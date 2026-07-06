import type { ReactNode } from "react";

const AVATARS = {
  user: "▙▟\n▙▟",
  agent: "▛▜\n▙▟",
} as const;

const mono = "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)";

export interface MessageBubbleProps {
  /** Speaker role — drives alignment, avatar mosaic, accent colouring and default name. */
  role?: "user" | "agent";
  /** Speaker label above the message. Defaults to "USER" / "OCTANT" by role. */
  name?: string;
  /** Timestamp shown beside the name. Hidden when omitted. */
  time?: string;
  /** Octant-glyph avatar mosaic. Defaults to the role's 2×2 cell avatar. */
  avatar?: string;
  /** Message body. */
  children?: ReactNode;
}

/**
 * A chat message bubble shell (section §28 — chat atoms). The speaker is drawn
 * as an octant mosaic beside a bordered bubble carrying the name, timestamp and
 * body. Agent messages are accent-tinted and left-aligned; user messages are
 * neutral and right-aligned. Pure static markup.
 */
export function MessageBubble({ role = "user", name, time, avatar, children }: MessageBubbleProps) {
  const isAgent = role === "agent";
  const label = name ?? (isAgent ? "OCTANT" : "USER");
  const mosaic = avatar ?? AVATARS[role];

  const avatarEl = (
    <pre
      aria-hidden="true"
      style={{
        margin: 0,
        fontSize: 12,
        lineHeight: 0.9,
        color: isAgent ? "var(--bx-accent, #46c66d)" : "#5b616e",
        whiteSpace: "pre",
        letterSpacing: 0,
        flex: "none",
        fontFamily: mono,
      }}
    >
      {mosaic}
    </pre>
  );

  const bubble = (
    <div
      style={{
        maxWidth: "80%",
        border: `1px solid ${isAgent ? "var(--bx-border-accent, #2a3320)" : "#23252e"}`,
        background: isAgent ? "#0e140e" : "#12131a",
        padding: "11px 13px",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", gap: 9, alignItems: "baseline", marginBottom: 6, fontSize: 11 }}>
        <span
          style={{
            color: isAgent ? "var(--bx-accent, #46c66d)" : "var(--bx-text-4, #9aa0ad)",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
        {time != null && <span style={{ color: "#3f424d" }}>{time}</span>}
      </div>
      <div style={{ color: "#dfe3ea", fontSize: 13, lineHeight: 1.55 }}>{children}</div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        justifyContent: isAgent ? "flex-start" : "flex-end",
        fontFamily: mono,
      }}
    >
      {isAgent ? (
        <>
          {avatarEl}
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          {avatarEl}
        </>
      )}
    </div>
  );
}
