// Extension-UI bridge types shared by the React UI and the WebSocket handler.
// The conversation model now lives in OCTANT's `ChatMessageData` (see
// `octant/conversation.ts`); these are only the dialog/notify request shapes
// forwarded from the agent's extension UI context (`server.tsx`).

export type ExtUIMethod =
  | "select"
  | "confirm"
  | "input"
  | "editor"
  | "notify"
  | "setStatus"
  | "setWidget"
  | "setTitle"
  | "set_editor_text";

export interface ExtUIRequest {
  id: string;
  method: ExtUIMethod;
  title?: string;
  message?: string;
  options?: string[];
  prefill?: string;
  placeholder?: string;
  timeout?: number;
  notifyType?: "info" | "warning" | "error";
  statusKey?: string;
  statusText?: string;
}

export type ToastKind = "info" | "warning" | "error";
