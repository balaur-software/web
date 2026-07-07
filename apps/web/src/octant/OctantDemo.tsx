import { AccentProvider, ChatPanel, ToastProvider } from "@balaur/octant";
import type { ReactNode } from "react";
import { demoAgents, demoArtifacts, demoMessages } from "./demo-fixture.ts";
import { renderBlock } from "./render-block.tsx";

/**
 * OCTANT design-system integration spike for `web/`. Renders the agentic
 * `ChatPanel` (atoms + molecules + organisms) under `AccentProvider` and
 * `ToastProvider`, with a static fixture. Proves `@balaur/ui` resolves and
 * server-renders inside web's React 19 + `renderToReadableStream` pipeline.
 * Served at `/octant` (SSR-only; hydration wiring is the next step).
 */
export function OctantDemo(): ReactNode {
  return (
    <ToastProvider>
      <AccentProvider accent="green">
        <div style={{ padding: 24, minHeight: "100vh" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <h1
              style={{
                fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
                color: "var(--bx-text-1, #f4f6fb)",
                letterSpacing: "0.1em",
                fontSize: 16,
                margin: "0 0 16px",
              }}
            >
              OCTANT · design system spike
            </h1>
            <ChatPanel
              messages={demoMessages}
              agents={demoAgents}
              artifacts={demoArtifacts}
              streaming={false}
              renderBlock={renderBlock}
              onSend={() => {}}
            />
          </div>
        </div>
      </AccentProvider>
    </ToastProvider>
  );
}
