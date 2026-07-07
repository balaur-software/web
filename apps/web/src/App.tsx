import {
  AccentProvider,
  ChatPanel,
  FillButton,
  Modal,
  type ToastKind as OctantToastKind,
  type PresenceItem,
  ScanButton,
  Select,
  Textarea,
  TextInput,
  ToastProvider,
  useToast,
} from "@balaur/octant";
import { useEffect, useReducer, useRef, useState } from "react";
import { AGENT_ID, Conversation } from "./octant/conversation.ts";
import { renderBlock } from "./octant/render-block.tsx";
import type { ExtUIRequest, ToastKind } from "./types.ts";

const API_KEY_STORAGE = "balaur.mistralApiKey";

/** Map our info/warning/error toast kinds onto OCTANT's ok/err/info palette. */
const TOAST_KIND: Record<ToastKind, OctantToastKind> = {
  info: "info",
  warning: "info",
  error: "err",
};

export function App() {
  return (
    <AccentProvider
      accent="green"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bx-bg, #08080a)",
        color: "var(--bx-text-2, #dfe3ea)",
        fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
      }}
    >
      <ToastProvider>
        <ChatApp />
      </ToastProvider>
    </AccentProvider>
  );
}

function ChatApp() {
  const convRef = useRef(new Conversation());
  const apiKeyRef = useRef<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const connectedRef = useRef(false);
  const dialogRef = useRef<ExtUIRequest | null>(null);
  const [keyDialog, setKeyDialog] = useState(false);
  const [, force] = useReducer((n: number) => n + 1, 0);
  const toast = useToast();

  function send(cmd: object) {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(cmd));
  }

  function showToast(message: string, kind: ToastKind = "info") {
    toast({ kind: TOAST_KIND[kind], message });
  }

  function handleServerEvent(event: Record<string, unknown>) {
    const conv = convRef.current;
    switch (event.type) {
      case "state_sync":
        conv.sync(event);
        break;
      case "agent_start":
        conv.agentStart();
        break;
      case "message_update":
        conv.messageUpdate(event.assistantMessageEvent as Record<string, unknown> | undefined);
        break;
      case "message_start":
        conv.messageStart();
        break;
      case "tool_execution_update": {
        const partial = event.partialResult as Record<string, unknown> | undefined;
        const content = (partial?.content as Array<Record<string, unknown>> | undefined)?.[0];
        const text = content?.type === "text" ? (content.text as string) : "";
        conv.toolUpdate(event.toolCallId as string, text);
        break;
      }
      case "tool_execution_end": {
        const result = event.result as Record<string, unknown> | undefined;
        const content = (result?.content as Array<Record<string, unknown>> | undefined)?.[0];
        const text = content?.type === "text" ? (content.text as string) : "";
        conv.toolEnd(event.toolCallId as string, text, (event.isError as boolean) ?? false);
        break;
      }
      case "agent_end":
        conv.agentEnd();
        break;
      case "extension_ui_request": {
        const req = event as unknown as ExtUIRequest;
        if (req.method === "notify") {
          showToast(req.statusText ?? req.title ?? req.message ?? "", req.notifyType ?? "info");
        } else if (["select", "confirm", "input", "editor"].includes(req.method)) {
          dialogRef.current = req;
        }
        break;
      }
      case "extension_error":
        showToast(`Extension error: ${event.error as string}`, "error");
        break;
    }
    force();
  }

  // ── Connection lifecycle (client only) ──────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: connect once on mount; handlers read from refs
  useEffect(() => {
    let closed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    try {
      apiKeyRef.current = localStorage.getItem(API_KEY_STORAGE) ?? "";
    } catch {
      // localStorage may be unavailable — fall back to no key.
    }

    function connect() {
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        connectedRef.current = true;
        if (apiKeyRef.current) {
          ws.send(JSON.stringify({ type: "set_api_key", key: apiKeyRef.current }));
        } else {
          showToast("Set your Mistral API key (◆ KEY) to start", "warning");
        }
        force();
      };
      ws.onclose = () => {
        connectedRef.current = false;
        convRef.current.streaming = false;
        force();
        if (!closed) reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          handleServerEvent(JSON.parse(e.data as string));
        } catch {
          // ignore malformed messages
        }
      };
    }

    connect();
    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  function sendPrompt(text: string) {
    const conv = convRef.current;
    if (!text || !connectedRef.current || conv.streaming) return;
    conv.addUser(text);
    force();
    send({ type: "prompt", message: text });
  }

  function respondDialog(value: Record<string, unknown>) {
    const req = dialogRef.current;
    if (!req) return; // idempotent: Modal fires onConfirm then onClose
    send({ type: "extension_ui_response", id: req.id, ...value });
    dialogRef.current = null;
    force();
  }

  function saveApiKey(raw: string) {
    const key = raw.trim();
    apiKeyRef.current = key;
    try {
      if (key) localStorage.setItem(API_KEY_STORAGE, key);
      else localStorage.removeItem(API_KEY_STORAGE);
    } catch {
      // ignore storage failures — the key still applies for this session
    }
    send({ type: "set_api_key", key });
    setKeyDialog(false);
    showToast(key ? "Mistral API key saved" : "Mistral API key cleared", "info");
  }

  const conv = convRef.current;
  const connected = connectedRef.current;
  const streaming = conv.streaming;
  const dialog = dialogRef.current;

  const presence: PresenceItem[] = !connected
    ? [{ label: "OFFLINE", state: "idle", meta: "reconnecting…" }]
    : streaming
      ? [{ label: "THINKING", state: "thinking" }]
      : [{ label: "ONLINE", state: "online" }];

  const agentName = (conv.model.split(/[-@]/)[0] || "agent").toUpperCase();
  const agents = { [AGENT_ID]: { id: AGENT_ID, name: agentName, accent: "#46c66d" } };

  return (
    <>
      <Header
        connected={connected}
        streaming={streaming}
        onKey={() => setKeyDialog(true)}
        onNew={() => send({ type: "new_session" })}
      />

      <ChatPanel
        messages={conv.messages}
        agents={agents}
        streaming={streaming}
        presence={presence}
        renderBlock={renderBlock}
        onSend={sendPrompt}
        onStop={() => send({ type: "abort" })}
        style={{ flex: 1, minHeight: 0, height: "auto", border: "none", background: "transparent" }}
      />

      {dialog ? <ExtDialog req={dialog} onRespond={respondDialog} /> : null}

      {keyDialog ? (
        <KeyDialog initial={apiKeyRef.current} onSave={saveApiKey} onClose={() => setKeyDialog(false)} />
      ) : null}
    </>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header({
  connected,
  streaming,
  onKey,
  onNew,
}: {
  connected: boolean;
  streaming: boolean;
  onKey: () => void;
  onNew: () => void;
}) {
  const dotColor = !connected
    ? "var(--bx-ansi-9, #ff6b6f)"
    : streaming
      ? "var(--bx-ansi-3, #f2c94c)"
      : "var(--bx-accent, #46c66d)";
  const compact = { padding: "8px 14px", fontSize: 12 } as const;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid var(--bx-border, #1c1d24)",
        background: "var(--bx-surface-1, #0a0b0e)",
        flex: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "var(--bx-accent, #46c66d)", fontSize: 18 }}>◈</span>
        <span style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 14, letterSpacing: "0.14em" }}>
          BALAUR · AGENT
        </span>
        <span
          aria-hidden="true"
          style={{
            width: 7,
            height: 7,
            marginLeft: 4,
            background: dotColor,
            display: "inline-block",
            ...(streaming ? {} : { animation: "bx-blink 1.4s steps(1) infinite" }),
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ScanButton onClick={onKey} style={compact}>
          ◆ KEY
        </ScanButton>
        <FillButton onClick={onNew} style={compact}>
          + NEW
        </FillButton>
      </div>
    </header>
  );
}

// ── Extension-UI dialogs ───────────────────────────────────────────────────────
function ExtDialog({
  req,
  onRespond,
}: {
  req: ExtUIRequest;
  onRespond: (v: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState(req.prefill ?? "");
  const [choice, setChoice] = useState(req.options?.[0] ?? "");
  const title = (req.title ?? req.method).toUpperCase();
  const message = req.message ? <div style={{ marginBottom: 14 }}>{req.message}</div> : null;

  if (req.method === "confirm") {
    return (
      <Modal
        open
        title={title}
        confirmLabel="YES"
        cancelLabel="NO"
        onConfirm={() => onRespond({ confirmed: true })}
        onClose={() => onRespond({ confirmed: false })}
      >
        {req.message ?? "Are you sure?"}
      </Modal>
    );
  }

  if (req.method === "select") {
    return (
      <Modal
        open
        title={title}
        confirmLabel="SELECT"
        onConfirm={() => onRespond({ value: choice })}
        onClose={() => onRespond({ cancelled: true })}
      >
        {message}
        <Select
          options={(req.options ?? []).map((o) => ({ value: o, label: o }))}
          value={choice}
          onChange={setChoice}
          width="100%"
          ariaLabel={title}
        />
      </Modal>
    );
  }

  if (req.method === "editor") {
    return (
      <Modal
        open
        title={title}
        confirmLabel="OK"
        onConfirm={() => onRespond({ value: text })}
        onClose={() => onRespond({ cancelled: true })}
        width={560}
      >
        {message}
        <Textarea value={text} onChange={setText} maxLength={20000} hint="" style={{ minHeight: 160 }} />
      </Modal>
    );
  }

  // input
  return (
    <Modal
      open
      title={title}
      confirmLabel="OK"
      onConfirm={() => onRespond({ value: text })}
      onClose={() => onRespond({ cancelled: true })}
    >
      {message}
      <TextInput
        value={text}
        onChange={setText}
        placeholder={req.placeholder ?? ""}
        maxLength={2000}
        autoFocus
      />
    </Modal>
  );
}

function KeyDialog({
  initial,
  onSave,
  onClose,
}: {
  initial: string;
  onSave: (key: string) => void;
  onClose: () => void;
}) {
  const [key, setKey] = useState(initial);
  return (
    <Modal
      open
      title="MISTRAL API KEY"
      confirmLabel="SAVE"
      cancelLabel="CANCEL"
      onConfirm={() => onSave(key)}
      onClose={onClose}
    >
      <div style={{ marginBottom: 14 }}>
        Stored in this browser (localStorage) and sent to the local server over your SSH tunnel. Leave empty
        and save to clear it.
      </div>
      <TextInput
        value={key}
        onChange={setKey}
        placeholder="sk-…"
        maxLength={200}
        type="password"
        autoComplete="off"
        autoFocus
      />
    </Modal>
  );
}
