import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "../primitives";
import { Toast } from "./Toast.tsx";

const meta: Meta<typeof Toast> = {
  title: "OCTANT/Toast",
  component: Toast,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {};

/** Two demo panels side by side share the single provider stack. */
export const SharedStack: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      <Toast />
      <Toast />
    </div>
  ),
};

/** Firing a toast programmatically from a custom trigger. */
export const CustomTrigger: Story = {
  render: () => {
    function Panel() {
      const toast = useToast();
      return (
        <button
          type="button"
          onClick={() => toast({ kind: "info", message: "Rendered 256 cells", duration: 5000 })}
          style={{
            fontFamily: "inherit",
            fontSize: 13,
            letterSpacing: "0.06em",
            padding: "10px 14px",
            background: "transparent",
            border: "1px solid var(--bx-border-cyan, #1d3540)",
            color: "#6ff2f2",
            cursor: "pointer",
          }}
        >
          ▛ FLUSH BUFFER
        </button>
      );
    }
    return <Panel />;
  },
};
