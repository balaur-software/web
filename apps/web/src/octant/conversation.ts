import type { Block, ChatMessageData } from "@balaur/octant";
import { splitTextBlocks } from "./blocks.ts";

type ToolCall = Extract<Block, { type: "tool_call" }>;
type TextBlock = Extract<Block, { type: "text" }>;
type Reasoning = Extract<Block, { type: "reasoning" }>;

function clock(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Translates the pi coding-agent's WebSocket event/state stream into OCTANT's
 * `ChatMessageData[]` model (the shape `ChatPanel`/`ChatThread` consume). Owns a
 * mutable transcript and a pointer to the message currently being streamed; the
 * React layer mutates it in place and forces a re-render, exactly as the prior
 * hand-rolled model did — only the produced types are now OCTANT's.
 */
export class Conversation {
  messages: ChatMessageData[] = [];
  streaming = false;
  private current: ChatMessageData | null = null;
  private seq = 0;

  private nextId(prefix: string): string {
    this.seq += 1;
    return `${prefix}-${this.seq}`;
  }

  private findTool(callId: string, mutate: (b: ToolCall) => void): void {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg?.role !== "agent") continue;
      const block = msg.blocks.find((b): b is ToolCall => b.type === "tool_call" && b.id === callId);
      if (block) {
        mutate(block);
        return;
      }
    }
  }

  /** Collapse the streaming text block into split text/code blocks on finish. */
  private finalize(msg: ChatMessageData | null): void {
    if (!msg) return;
    msg.status = "complete";
    msg.blocks = msg.blocks.flatMap((b) => (b.type === "text" ? splitTextBlocks(b.text, false) : [b]));
  }

  addUser(text: string): void {
    this.messages.push({
      id: this.nextId("u"),
      role: "user",
      time: clock(),
      blocks: [{ type: "text", text }],
    });
  }

  agentStart(): void {
    this.streaming = true;
    const msg: ChatMessageData = {
      id: this.nextId("a"),
      role: "agent",
      time: clock(),
      status: "streaming",
      blocks: [],
    };
    this.current = msg;
    this.messages.push(msg);
  }

  messageUpdate(delta: Record<string, unknown> | undefined): void {
    const cur = this.current;
    if (!cur || !delta) return;

    if (delta.type === "text_delta") {
      let tb = cur.blocks.find((b): b is TextBlock => b.type === "text");
      if (!tb) {
        tb = { type: "text", text: "", streaming: true };
        cur.blocks.push(tb);
      }
      tb.text += (delta.delta as string) ?? "";
    } else if (delta.type === "thinking_delta") {
      let rb = cur.blocks.find((b): b is Reasoning => b.type === "reasoning");
      if (!rb) {
        rb = { type: "reasoning", text: "" };
        cur.blocks.push(rb);
      }
      rb.text += (delta.delta as string) ?? "";
    } else if (delta.type === "toolcall_end") {
      const tc = delta.toolCall as Record<string, unknown> | undefined;
      if (tc) {
        cur.blocks.push({
          type: "tool_call",
          id: tc.id as string,
          name: tc.name as string,
          args: tc.arguments,
          status: "running",
          startedAt: Date.now(),
        });
      }
    }
  }

  messageStart(): void {
    if (this.current && this.current.blocks.length > 0) {
      this.finalize(this.current);
    } else if (this.current) {
      return; // reuse the empty in-flight message
    }
    const msg: ChatMessageData = {
      id: this.nextId("a"),
      role: "agent",
      time: clock(),
      status: "streaming",
      blocks: [],
    };
    this.current = msg;
    this.messages.push(msg);
  }

  toolUpdate(callId: string, text: string): void {
    if (!text) return;
    this.findTool(callId, (b) => {
      b.result = text;
    });
  }

  toolEnd(callId: string, text: string, isError: boolean): void {
    this.findTool(callId, (b) => {
      b.status = isError ? "error" : "done";
      b.endedAt = Date.now();
      if (text) b.result = text;
    });
  }

  agentEnd(): void {
    this.streaming = false;
    this.finalize(this.current);
    this.current = null;
  }

  /** Rebuild the whole transcript from a `state_sync` snapshot. */
  sync(data: Record<string, unknown>): void {
    this.messages = [];
    this.current = null;
    this.seq = 0;
    this.streaming = (data.streaming as boolean) ?? false;

    const messages = data.messages as Array<Record<string, unknown>> | undefined;
    if (!messages) return;

    for (const msg of messages) {
      if (msg.role === "user") {
        this.messages.push({
          id: this.nextId("u"),
          role: "user",
          blocks: [{ type: "text", text: userText(msg.content) }],
        });
      } else if (msg.role === "assistant") {
        const blocks: Block[] = [];
        const content = msg.content as Array<Record<string, unknown>> | undefined;
        for (const c of content ?? []) {
          if (c.type === "text") {
            blocks.push(...splitTextBlocks(c.text as string, false));
          } else if (c.type === "thinking") {
            blocks.push({ type: "reasoning", text: c.thinking as string, defaultCollapsed: true });
          } else if (c.type === "toolCall") {
            blocks.push({
              type: "tool_call",
              id: c.id as string,
              name: c.name as string,
              args: c.arguments,
              status: "done",
            });
          }
        }
        this.messages.push({ id: this.nextId("a"), role: "agent", status: "complete", blocks });
      } else if (msg.role === "toolResult") {
        const callId = msg.toolCallId as string;
        const first = (msg.content as Array<Record<string, unknown>> | undefined)?.[0];
        const text = first?.type === "text" ? (first.text as string) : "";
        this.findTool(callId, (b) => {
          b.status = (msg.isError as boolean) ? "error" : "done";
          if (text) b.result = text;
        });
      }
    }
  }
}

function userText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return (content as Array<Record<string, unknown>>)
      .filter((c) => c.type === "text")
      .map((c) => c.text as string)
      .join("\n");
  }
  return String(content);
}
