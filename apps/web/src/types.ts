// Conversation model shared by the React UI and the WebSocket event handler.
// Ported verbatim (in shape) from the original vanilla-TS `src/main.ts`.

export interface ThinkingBlock {
  type: "thinking";
  text: string;
  expanded: boolean;
}
export interface TextBlock {
  type: "text";
  text: string;
}
export interface ToolBlock {
  type: "tool";
  callId: string;
  name: string;
  args: unknown;
  output: string;
  isError: boolean;
  running: boolean;
  expanded: boolean;
}
export type Block = ThinkingBlock | TextBlock | ToolBlock;

export interface UserItem {
  kind: "user";
  text: string;
}
export interface AssistantItem {
  kind: "assistant";
  blocks: Block[];
  streaming: boolean;
}
export type ConversationItem = UserItem | AssistantItem;

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
  timeout?: number;
  notifyType?: "info" | "warning" | "error";
  statusKey?: string;
  statusText?: string;
}

export type ToastKind = "info" | "warning" | "error";

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}
