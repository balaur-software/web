/**
 * pi-remote-web-ui server — Bun-native SSR React edition.
 *
 * Binds to 127.0.0.1:8080 only. Access is via SSH port-forwarding:
 *   ssh -L 8080:localhost:8080 user@your-vps
 *
 * Uses AgentSession directly (per the pi SDK docs) instead of spawning
 * `pi --mode rpc` subprocesses. A single AgentSession is shared across all
 * WebSocket connections — every connected tab observes the same conversation
 * in real time via Bun's native pub/sub. The frontend is server-rendered React
 * (`renderToReadableStream`) and hydrated from a `Bun.build` client bundle —
 * no Vite, no `ws`, no separate build step.
 */

import {
  AuthStorage,
  createAgentSession,
  ModelRegistry,
  SessionManager,
  SettingsManager,
} from "@mariozechner/pi-coding-agent";
import { renderToReadableStream } from "react-dom/server";
import { Document } from "./Document.tsx";

const dir = import.meta.dir;

// Build the client hydration bundle once at startup with Bun's own bundler.
const clientBuild = await Bun.build({
  entrypoints: [`${dir}/client.tsx`],
  target: "browser",
  minify: process.env.NODE_ENV === "production",
});
if (!clientBuild.success) {
  console.error(clientBuild.logs);
  throw new Error("client bundle failed to build");
}
const clientJs = await clientBuild.outputs[0]!.text();

// Static assets: the OCTANT token stylesheet (custom properties + the
// self-hosted DepartureMono @font-face) plus our own thin app shell. The font
// file is served at the path tokens.css references relative to itself
// (`../fonts/departure-mono.woff2` → `/fonts/departure-mono.woff2`).
const stylePath = `${dir}/style.css`;
const tokensCssPath = Bun.resolveSync("@balaur/octant/tokens/tokens.css", dir);
const monoFontPath = Bun.resolveSync("@balaur/octant/tokens/fonts/departure-mono.woff2", dir);
// highlight.js theme for the syntax-highlighted spans web feeds into OCTANT's
// CodeBlock via ChatPanel's `renderBlock` (highlighting is web's concern, not
// the design system's).
const hljsCssPath = Bun.resolveSync("highlight.js/styles/github-dark.css", dir);

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "127.0.0.1"; // Never expose to the internet — use an SSH tunnel.
const TOPIC = "conversation";

// ── Extension UI bridge ─────────────────────────────────────────────────────
// Extension UI requests (select, confirm, input, …) are forwarded to the
// browser and their responses matched back by a random id.
type PendingUIRequest = {
  resolve: (response: Record<string, unknown>) => void;
  reject: (err: Error) => void;
};
const pendingExtensionRequests = new Map<string, PendingUIRequest>();

function createExtensionUIContext(broadcast: (msg: unknown) => void) {
  function createDialogPromise<T>(
    opts: { signal?: AbortSignal; timeout?: number } | undefined,
    defaultValue: T,
    request: Record<string, unknown>,
    parseResponse: (r: Record<string, unknown>) => T,
  ): Promise<T> {
    if (opts?.signal?.aborted) return Promise.resolve(defaultValue);
    const id = crypto.randomUUID();
    return new Promise<T>((resolve) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        opts?.signal?.removeEventListener("abort", onAbort);
        pendingExtensionRequests.delete(id);
      };
      const onAbort = () => {
        cleanup();
        resolve(defaultValue);
      };
      opts?.signal?.addEventListener("abort", onAbort, { once: true });
      if (opts?.timeout) {
        timeoutId = setTimeout(() => {
          cleanup();
          resolve(defaultValue);
        }, opts.timeout);
      }
      pendingExtensionRequests.set(id, {
        resolve: (response) => {
          cleanup();
          resolve(parseResponse(response));
        },
        reject: () => {
          cleanup();
          resolve(defaultValue);
        },
      });
      broadcast({ type: "extension_ui_request", id, ...request });
    });
  }

  return {
    select: (title: string, options: string[], opts?: { signal?: AbortSignal; timeout?: number }) =>
      createDialogPromise(
        opts,
        undefined as string | undefined,
        { method: "select", title, options, timeout: opts?.timeout },
        (r) => ("cancelled" in r && r.cancelled ? undefined : "value" in r ? (r.value as string) : undefined),
      ),
    confirm: (title: string, message?: string, opts?: { signal?: AbortSignal; timeout?: number }) =>
      createDialogPromise(opts, false, { method: "confirm", title, message, timeout: opts?.timeout }, (r) =>
        "cancelled" in r && r.cancelled ? false : "confirmed" in r ? (r.confirmed as boolean) : false,
      ),
    input: (title: string, placeholder?: string, opts?: { signal?: AbortSignal; timeout?: number }) =>
      createDialogPromise(
        opts,
        undefined as string | undefined,
        { method: "input", title, placeholder, timeout: opts?.timeout },
        (r) => ("cancelled" in r && r.cancelled ? undefined : "value" in r ? (r.value as string) : undefined),
      ),
    notify(message: string, type?: "info" | "warning" | "error") {
      broadcast({
        type: "extension_ui_request",
        id: crypto.randomUUID(),
        method: "notify",
        message,
        notifyType: type,
      });
    },
    onTerminalInput() {
      return () => {};
    },
    setStatus(key: string, text: string | undefined) {
      broadcast({
        type: "extension_ui_request",
        id: crypto.randomUUID(),
        method: "setStatus",
        statusKey: key,
        statusText: text,
      });
    },
    setWorkingMessage(_message: string | undefined) {
      // Not supported in the web UI.
    },
    setWidget(key: string, content: string[] | undefined, options?: { placement?: string }) {
      if (content === undefined || Array.isArray(content)) {
        broadcast({
          type: "extension_ui_request",
          id: crypto.randomUUID(),
          method: "setWidget",
          widgetKey: key,
          widgetLines: content,
          widgetPlacement: options?.placement,
        });
      }
    },
    setTitle(_title: string | undefined) {
      // Not supported in the web UI.
    },
    editor: undefined,
  };
}

// ── Boot ─────────────────────────────────────────────────────────────────────
console.log("Initialising AgentSession…");

// Provider config. balaur is European-aligned, so Mistral is the only provider
// for now. The API key is normally supplied per-browser (persisted in
// localStorage and pushed over the WebSocket); `MISTRAL_API_KEY` is an optional
// server-side fallback. No global pi installation is required or consulted.
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MODEL_ID = process.env.MISTRAL_MODEL ?? "devstral-medium-latest";

// Keep the agent fully self-contained: auth, models, settings and sessions are
// all app-local or in-memory, so nothing reads or writes a global pi install
// (`~/.pi`). `agentDir` points at an app-local (git-ignored) directory.
const agentDir = process.env.BALAUR_AGENT_DIR ?? `${dir}/../.balaur-agent`;

const authStorage = AuthStorage.create(`${agentDir}/auth.json`);
if (MISTRAL_API_KEY) authStorage.setRuntimeApiKey("mistral", MISTRAL_API_KEY); // runtime-only, never persisted

const modelRegistry = new ModelRegistry(authStorage, `${agentDir}/models.json`);
const model = modelRegistry.find("mistral", MODEL_ID);
if (!model) {
  throw new Error(`Unknown Mistral model "${MODEL_ID}" — set MISTRAL_MODEL to a valid model id.`);
}

const { session } = await createAgentSession({
  model,
  agentDir,
  authStorage,
  modelRegistry,
  settingsManager: SettingsManager.inMemory(),
  sessionManager: SessionManager.inMemory(process.cwd()),
});

console.log(
  `AgentSession ready (provider: mistral, model: ${session.model?.id ?? MODEL_ID}, session: ${session.sessionId})`,
);

let clientCount = 0;

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req, srv) {
    const { pathname } = new URL(req.url);

    if (pathname === "/ws") {
      if (srv.upgrade(req)) return undefined;
      return new Response("websocket upgrade failed", { status: 400 });
    }
    if (pathname === "/client.js") {
      return new Response(clientJs, { headers: { "content-type": "text/javascript; charset=utf-8" } });
    }
    if (pathname === "/style.css") {
      return new Response(Bun.file(stylePath), { headers: { "content-type": "text/css; charset=utf-8" } });
    }
    if (pathname === "/tokens.css") {
      return new Response(Bun.file(tokensCssPath), {
        headers: { "content-type": "text/css; charset=utf-8" },
      });
    }
    if (pathname === "/fonts/departure-mono.woff2") {
      return new Response(Bun.file(monoFontPath), {
        headers: { "content-type": "font/woff2", "cache-control": "public, max-age=31536000, immutable" },
      });
    }
    if (pathname === "/hljs.css") {
      return new Response(Bun.file(hljsCssPath), { headers: { "content-type": "text/css; charset=utf-8" } });
    }
    if (pathname === "/octant") {
      const { OctantDemo } = await import("./octant/OctantDemo.tsx");
      const body = await renderToReadableStream(
        <html lang="en">
          <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>OCTANT · design system spike</title>
            <link rel="stylesheet" href="/tokens.css" />
            <style>{`body{margin:0;background:#08080a;}`}</style>
          </head>
          <body>
            <div id="root">
              <OctantDemo />
            </div>
          </body>
        </html>,
      );
      return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (pathname === "/") {
      const stream = await renderToReadableStream(<Document />, { bootstrapModules: ["/client.js"] });
      return new Response(stream, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      ws.subscribe(TOPIC);
      clientCount++;
      console.log(`[${new Date().toISOString()}] Client connected (${clientCount} total)`);
      // Send the current conversation state so the new tab catches up.
      ws.send(
        JSON.stringify({
          type: "state_sync",
          messages: session.messages,
          streaming: session.isStreaming,
          model: session.model?.id,
          sessionId: session.sessionId,
        }),
      );
    },
    async message(_ws, message) {
      let cmd: Record<string, unknown>;
      try {
        cmd = JSON.parse(message.toString());
      } catch {
        return;
      }

      try {
        switch (cmd.type) {
          case "prompt": {
            const text = cmd.message as string;
            if (!text) break;
            if (session.isStreaming) {
              await session.prompt(text, {
                streamingBehavior: (cmd.streamingBehavior as "steer" | "followUp") ?? "followUp",
              });
            } else {
              // Don't await — events stream via the subscription below.
              session.prompt(text).catch((err) => console.error("[prompt error]", err));
            }
            break;
          }
          case "set_api_key": {
            // Per-browser runtime key. Applied to the shared session (all tabs).
            const key = typeof cmd.key === "string" ? cmd.key.trim() : "";
            if (key) {
              authStorage.setRuntimeApiKey("mistral", key);
              console.log("[api-key] runtime Mistral key updated by a client");
            }
            break;
          }
          case "abort":
            await session.abort();
            break;
          case "new_session":
            await session.newSession();
            broadcast({
              type: "state_sync",
              messages: session.messages,
              streaming: session.isStreaming,
              model: session.model?.id,
              sessionId: session.sessionId,
            });
            break;
          case "extension_ui_response": {
            const id = cmd.id as string;
            const pending = pendingExtensionRequests.get(id);
            if (pending) {
              pendingExtensionRequests.delete(id);
              pending.resolve(cmd);
            }
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error(`[cmd error] ${cmd.type}:`, err);
      }
    },
    close() {
      clientCount--;
      console.log(`[${new Date().toISOString()}] Client disconnected (${clientCount} total)`);
    },
  },
});

const broadcast = (msg: unknown) => {
  server.publish(TOPIC, JSON.stringify(msg));
};

// Broadcast every agent event to all connected clients.
session.subscribe((event) => broadcast(event));

// Bind the extension UI context so extensions can show dialogs, notifications, etc.
await session.bindExtensions({
  // biome-ignore lint/suspicious/noExplicitAny: the pi SDK UIContext type is not exported
  uiContext: createExtensionUIContext(broadcast) as any,
  onError: (err) => {
    broadcast({
      type: "extension_error",
      extensionPath: err.extensionPath,
      event: err.event,
      error: err.error,
    });
  },
});

console.log(`pi-remote-web-ui listening on http://${HOST}:${PORT}`);
console.log(`Access via SSH tunnel: ssh -L ${PORT}:localhost:${PORT} user@your-vps`);
console.log(`Then open: http://localhost:${PORT}`);

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    console.log(`\n${sig} received, shutting down…`);
    session.dispose();
    server.stop();
    process.exit(0);
  });
}
