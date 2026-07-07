import { useEffect, useReducer, useRef } from "react";
import { renderMarkdown } from "./markdown.ts";
import type {
  AssistantItem,
  Block,
  ConversationItem,
  ExtUIRequest,
  TextBlock,
  ThinkingBlock,
  Toast,
  ToastKind,
  ToolBlock,
  UserItem,
} from "./types.ts";

const API_KEY_STORAGE = "balaur.mistralApiKey";

interface UIState {
  connected: boolean;
  streaming: boolean;
  items: ConversationItem[];
  dialog: ExtUIRequest | null;
  toasts: Toast[];
  keyDialog: boolean;
}

const toolIcons: Record<string, string> = {
  bash: "⬡",
  read: "📖",
  edit: "✏️",
  write: "📝",
  grep: "🔍",
  find: "🗂️",
  ls: "📁",
};

function getArgPreview(name: string, args: unknown): string {
  if (!args || typeof args !== "object") return "";
  const a = args as Record<string, unknown>;
  if (name === "bash" && a.command) return String(a.command).slice(0, 80);
  if (name === "read" && a.path) return String(a.path);
  if (name === "write" && a.path) return String(a.path);
  if (name === "edit" && a.path) return String(a.path);
  if (name === "grep" && a.pattern) return `${a.pattern} ${a.path ?? ""}`.trim();
  if (name === "find" && a.path) return String(a.path);
  if (name === "ls" && a.path) return String(a.path);
  const first = Object.values(a).find((v) => typeof v === "string");
  return first ? String(first).slice(0, 80) : "";
}

function findToolBlock(items: ConversationItem[], callId: string, mutate: (b: ToolBlock) => void) {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item?.kind === "assistant") {
      const block = item.blocks.find((b): b is ToolBlock => b.type === "tool" && b.callId === callId);
      if (block) {
        mutate(block);
        return;
      }
    }
  }
}

export function App() {
  const stateRef = useRef<UIState>({
    connected: false,
    streaming: false,
    items: [],
    dialog: null,
    toasts: [],
    keyDialog: false,
  });
  const currentAssistantRef = useRef<AssistantItem | null>(null);
  const apiKeyRef = useRef<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const stickToBottomRef = useRef(true);
  const toastSeq = useRef(0);
  const [, force] = useReducer((n: number) => n + 1, 0);

  // ── WebSocket helpers ──────────────────────────────────────────────────────
  function send(cmd: object) {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(cmd));
  }

  function showToast(message: string, kind: ToastKind = "info") {
    const id = ++toastSeq.current;
    stateRef.current.toasts.push({ id, message, kind });
    force();
    setTimeout(() => {
      const s = stateRef.current;
      s.toasts = s.toasts.filter((t) => t.id !== id);
      force();
    }, 5000);
  }

  function handleStateSync(data: Record<string, unknown>) {
    const messages = data.messages as Array<Record<string, unknown>> | undefined;
    const s = stateRef.current;
    s.items = [];
    currentAssistantRef.current = null;
    s.streaming = (data.streaming as boolean) ?? false;

    if (messages) {
      for (const msg of messages) {
        if (msg.role === "user") {
          const content = msg.content;
          let text: string;
          if (typeof content === "string") {
            text = content;
          } else if (Array.isArray(content)) {
            text = (content as Array<Record<string, unknown>>)
              .filter((c) => c.type === "text")
              .map((c) => c.text as string)
              .join("\n");
          } else {
            text = String(content);
          }
          s.items.push({ kind: "user", text });
        } else if (msg.role === "assistant") {
          const contentArr = msg.content as Array<Record<string, unknown>> | undefined;
          const blocks: Block[] = [];
          if (contentArr) {
            for (const c of contentArr) {
              if (c.type === "text") {
                blocks.push({ type: "text", text: c.text as string });
              } else if (c.type === "thinking") {
                blocks.push({ type: "thinking", text: c.thinking as string, expanded: false });
              } else if (c.type === "toolCall") {
                blocks.push({
                  type: "tool",
                  callId: c.id as string,
                  name: c.name as string,
                  args: c.arguments,
                  output: "",
                  isError: false,
                  running: false,
                  expanded: false,
                });
              }
            }
          }
          s.items.push({ kind: "assistant", blocks, streaming: false });
        } else if (msg.role === "toolResult") {
          const callId = msg.toolCallId as string;
          const content = (msg.content as Array<Record<string, unknown>> | undefined)?.[0];
          const text = content?.type === "text" ? (content.text as string) : "";
          findToolBlock(s.items, callId, (b) => {
            b.output = text;
            b.running = false;
            b.isError = (msg.isError as boolean) ?? false;
            if (b.isError) b.expanded = true;
          });
        }
      }
    }
  }

  function handleServerEvent(event: Record<string, unknown>) {
    const s = stateRef.current;
    switch (event.type) {
      case "state_sync": {
        handleStateSync(event);
        break;
      }
      case "agent_start": {
        s.streaming = true;
        const item: AssistantItem = { kind: "assistant", blocks: [], streaming: true };
        currentAssistantRef.current = item;
        s.items.push(item);
        break;
      }
      case "message_update": {
        const cur = currentAssistantRef.current;
        if (!cur) break;
        const delta = event.assistantMessageEvent as Record<string, unknown> | undefined;
        if (!delta) break;
        if (delta.type === "text_delta") {
          let tb = cur.blocks.find((b): b is TextBlock => b.type === "text");
          if (!tb) {
            tb = { type: "text", text: "" };
            cur.blocks.push(tb);
          }
          tb.text += (delta.delta as string) ?? "";
        } else if (delta.type === "thinking_delta") {
          let kb = cur.blocks.find((b): b is ThinkingBlock => b.type === "thinking");
          if (!kb) {
            kb = { type: "thinking", text: "", expanded: false };
            cur.blocks.push(kb);
          }
          kb.text += (delta.delta as string) ?? "";
        } else if (delta.type === "toolcall_end") {
          const tc = delta.toolCall as Record<string, unknown>;
          if (tc) {
            cur.blocks.push({
              type: "tool",
              callId: tc.id as string,
              name: tc.name as string,
              args: tc.arguments,
              output: "",
              isError: false,
              running: true,
              expanded: false,
            });
          }
        }
        break;
      }
      case "message_start": {
        const cur = currentAssistantRef.current;
        if (cur && cur.blocks.length > 0) {
          cur.streaming = false;
          const next: AssistantItem = { kind: "assistant", blocks: [], streaming: true };
          currentAssistantRef.current = next;
          s.items.push(next);
        } else if (!cur) {
          const next: AssistantItem = { kind: "assistant", blocks: [], streaming: true };
          currentAssistantRef.current = next;
          s.items.push(next);
        }
        break;
      }
      case "tool_execution_update": {
        const partial = event.partialResult as Record<string, unknown> | undefined;
        const content = (partial?.content as Array<Record<string, unknown>> | undefined)?.[0];
        const text = content?.type === "text" ? (content.text as string) : "";
        if (text) {
          findToolBlock(s.items, event.toolCallId as string, (b) => {
            b.output = text;
          });
        }
        break;
      }
      case "tool_execution_end": {
        const result = event.result as Record<string, unknown> | undefined;
        const content = (result?.content as Array<Record<string, unknown>> | undefined)?.[0];
        const text = content?.type === "text" ? (content.text as string) : "";
        findToolBlock(s.items, event.toolCallId as string, (b) => {
          b.running = false;
          b.isError = (event.isError as boolean) ?? false;
          if (text) b.output = text;
          if (b.isError) b.expanded = true;
        });
        break;
      }
      case "agent_end": {
        s.streaming = false;
        if (currentAssistantRef.current) currentAssistantRef.current.streaming = false;
        currentAssistantRef.current = null;
        break;
      }
      case "extension_ui_request": {
        const req = event as unknown as ExtUIRequest;
        if (req.method === "notify") {
          showToast(req.statusText ?? req.title ?? "", req.notifyType ?? "info");
        } else if (["select", "confirm", "input", "editor"].includes(req.method)) {
          s.dialog = req;
        }
        break;
      }
      case "extension_error": {
        showToast(`Extension error: ${event.error as string}`, "error");
        break;
      }
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
        stateRef.current.connected = true;
        if (apiKeyRef.current) {
          ws.send(JSON.stringify({ type: "set_api_key", key: apiKeyRef.current }));
        } else {
          showToast("Set your Mistral API key (🔑) to start", "warning");
        }
        force();
      };
      ws.onclose = () => {
        stateRef.current.connected = false;
        stateRef.current.streaming = false;
        currentAssistantRef.current = null;
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

  // Keep the transcript pinned to the bottom while streaming / near the bottom.
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    if (stickToBottomRef.current || stateRef.current.streaming) {
      el.scrollTop = el.scrollHeight;
    }
  });

  // ── Input handling ───────────────────────────────────────────────────────
  function autoResizeInput() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function sendPrompt() {
    const el = inputRef.current;
    const s = stateRef.current;
    const text = el?.value.trim() ?? "";
    if (!text || !s.connected || s.streaming) return;
    s.items.push({ kind: "user", text });
    if (el) el.value = "";
    autoResizeInput();
    force();
    send({ type: "prompt", message: text });
  }

  function respondDialog(value: Record<string, unknown>) {
    const req = stateRef.current.dialog;
    if (!req) return;
    send({ type: "extension_ui_response", id: req.id, ...value });
    stateRef.current.dialog = null;
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
    stateRef.current.keyDialog = false;
    force();
    showToast(key ? "Mistral API key saved" : "Mistral API key cleared", "info");
  }

  const s = stateRef.current;
  const statusDotClass = !s.connected ? "disconnected" : s.streaming ? "streaming" : "connected";
  const statusText = !s.connected ? "Disconnected" : s.streaming ? "Working…" : "Connected";

  return (
    <div id="app">
      <header id="header">
        <div className="header-left">
          <span className="logo">π</span>
          <span className="logo-text">pi-remote-web-ui</span>
          <span className={`status-dot ${statusDotClass}`} title={statusText} />
          <span className="status-text">{statusText}</span>
        </div>
        <div className="header-right">
          <button
            type="button"
            className="btn btn-ghost"
            title="Set Mistral API key"
            onClick={() => {
              stateRef.current.keyDialog = true;
              force();
            }}
          >
            🔑 Key
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            title="New session"
            onClick={() => send({ type: "new_session" })}
          >
            ＋ New
          </button>
        </div>
      </header>

      <div
        ref={messagesRef}
        className="messages"
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
        }}
      >
        {s.items.map((item, i) =>
          item.kind === "user" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: transcript is append-only, index is stable
            <UserMsg key={i} item={item} />
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: transcript is append-only, index is stable
            <AssistantMsg key={i} item={item} onToggle={force} />
          ),
        )}
      </div>

      <div className={`streaming-indicator${s.streaming ? "" : " hidden"}`}>
        <span className="spinner" /> Working…
      </div>

      <div id="input-bar" className="input-bar">
        <textarea
          ref={inputRef}
          className="prompt-input"
          placeholder="Send a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          disabled={!s.connected}
          // biome-ignore lint/a11y/noAutofocus: matches the original single-input chat UX
          autoFocus
          onInput={autoResizeInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendPrompt();
            }
          }}
        />
        <button
          type="button"
          className={`btn btn-primary${s.streaming ? " hidden" : ""}`}
          title="Send (Enter)"
          onClick={sendPrompt}
        >
          Send
        </button>
        <button
          type="button"
          className={`btn btn-danger${s.streaming ? "" : " hidden"}`}
          title="Abort"
          onClick={() => send({ type: "abort" })}
        >
          Stop
        </button>
      </div>

      {s.dialog ? <Dialog req={s.dialog} onRespond={respondDialog} /> : null}

      {s.keyDialog ? (
        <KeyDialog
          initial={apiKeyRef.current}
          onSave={saveApiKey}
          onClose={() => {
            stateRef.current.keyDialog = false;
            force();
          }}
        />
      ) : null}

      <div id="toast-container">
        {s.toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function UserMsg({ item }: { item: UserItem }) {
  return (
    <div className="msg msg-user">
      <div className="msg-bubble">{item.text}</div>
    </div>
  );
}

function AssistantMsg({ item, onToggle }: { item: AssistantItem; onToggle: () => void }) {
  return (
    <div className="msg msg-assistant">
      {item.blocks.map((block, i) => {
        if (block.type === "thinking") {
          // biome-ignore lint/suspicious/noArrayIndexKey: blocks are append-only within a message
          return <ThinkingBlockView key={i} block={block} onToggle={onToggle} />;
        }
        if (block.type === "tool") {
          // biome-ignore lint/suspicious/noArrayIndexKey: blocks are append-only within a message
          return <ToolBlockView key={i} block={block} onToggle={onToggle} />;
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: blocks are append-only within a message
        return <TextBlockView key={i} block={block} />;
      })}
    </div>
  );
}

function ThinkingBlockView({ block, onToggle }: { block: ThinkingBlock; onToggle: () => void }) {
  return (
    <div className={`block-thinking${block.expanded ? " expanded" : ""}`}>
      <button
        type="button"
        className="block-header"
        onClick={() => {
          block.expanded = !block.expanded;
          onToggle();
        }}
      >
        <span>💭 Thinking</span>
        <span className="chevron">▶</span>
      </button>
      <div className="block-content">{block.text}</div>
    </div>
  );
}

function ToolBlockView({ block, onToggle }: { block: ToolBlock; onToggle: () => void }) {
  const statusClass = block.running ? "running" : block.isError ? "error" : "success";
  const statusIcon = block.running ? "⟳ running…" : block.isError ? "✕ error" : "✓";
  const toolIcon = toolIcons[block.name] ?? "🔧";
  const argPreview = getArgPreview(block.name, block.args);

  return (
    <div className={`block-tool ${statusClass}${block.expanded ? " expanded" : ""}`}>
      <button
        type="button"
        className="block-header"
        onClick={() => {
          block.expanded = !block.expanded;
          onToggle();
        }}
      >
        <span className="tool-name">
          {toolIcon} {block.name}
        </span>
        <span className="tool-arg-preview">{argPreview}</span>
        <span className="tool-status">{statusIcon}</span>
        <span className="chevron">{block.expanded ? "▲" : "▼"}</span>
      </button>
      <div className="block-content">
        {block.args !== undefined ? (
          <>
            <div className="tool-section-label">Arguments</div>
            <pre className="tool-args-pre">
              {typeof block.args === "string" ? block.args : JSON.stringify(block.args, null, 2)}
            </pre>
          </>
        ) : null}
        {block.output ? (
          <>
            <div className="tool-section-label">{block.running ? "Output (streaming)" : "Output"}</div>
            <pre className={`tool-output-pre${block.isError ? " error-output" : ""}`}>{block.output}</pre>
          </>
        ) : null}
      </div>
    </div>
  );
}

function TextBlockView({ block }: { block: TextBlock }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown is rendered from trusted agent output
  return <div className="block-text" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text) }} />;
}

function Dialog({
  req,
  onRespond,
}: {
  req: ExtUIRequest;
  onRespond: (value: Record<string, unknown>) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (req.method === "input") inputRef.current?.focus();
    if (req.method === "editor") textareaRef.current?.focus();
  }, [req.method]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismissal mirrors the original UI
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-dismiss only
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onRespond({ cancelled: true });
      }}
    >
      <div className="dialog-box">
        <div className="dialog-title">{req.title ?? ""}</div>
        <div className="dialog-message">{req.message ?? ""}</div>
        <div className="dialog-body">
          {req.method === "select"
            ? (req.options ?? []).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="dialog-select-option"
                  onClick={() => onRespond({ value: opt })}
                >
                  {opt}
                </button>
              ))
            : null}
          {req.method === "input" ? (
            <input
              ref={inputRef}
              className="dialog-input"
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") onRespond({ value: e.currentTarget.value });
              }}
            />
          ) : null}
          {req.method === "editor" ? (
            <textarea ref={textareaRef} className="dialog-textarea" defaultValue={req.prefill ?? ""} />
          ) : null}
        </div>
        <div className="dialog-actions">
          {req.method === "confirm" ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => onRespond({ confirmed: false })}>
                No
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onRespond({ confirmed: true })}
              >
                Yes
              </button>
            </>
          ) : null}
          {req.method === "select" ? (
            <button type="button" className="btn btn-ghost" onClick={() => onRespond({ cancelled: true })}>
              Cancel
            </button>
          ) : null}
          {req.method === "input" ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => onRespond({ cancelled: true })}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onRespond({ value: inputRef.current?.value ?? "" })}
              >
                OK
              </button>
            </>
          ) : null}
          {req.method === "editor" ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => onRespond({ cancelled: true })}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onRespond({ value: textareaRef.current?.value ?? "" })}
              >
                OK
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismissal mirrors the other dialogs
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-dismiss only
    <div
      className="dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-box">
        <div className="dialog-title">Mistral API key</div>
        <div className="dialog-message">
          Stored in this browser (localStorage) and sent to the local server over your SSH tunnel. Leave empty
          and save to clear it.
        </div>
        <div className="dialog-body">
          <input
            ref={inputRef}
            className="dialog-input"
            type="password"
            autoComplete="off"
            placeholder="sk-…"
            defaultValue={initial}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(e.currentTarget.value);
            }}
          />
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSave(inputRef.current?.value ?? "")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
