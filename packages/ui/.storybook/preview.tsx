import type { Preview } from "@storybook/react";
import "@balaur/tokens/tokens.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          background: "#08080a",
          color: "#c8cdd6",
          fontFamily: "var(--bx-font-mono, 'DepartureMono', ui-monospace, monospace)",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
