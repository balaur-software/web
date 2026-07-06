import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToastProvider } from "../primitives";
import { OTPInput } from "./OTPInput.tsx";

const meta: Meta<typeof OTPInput> = {
  title: "OCTANT/OTPInput",
  component: OTPInput,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof OTPInput>;

/** Six empty cells. Type or paste a code; completion fires a toast. */
export const Default: Story = {};

/** Shorter code — cell count is driven by `length`. */
export const FourDigit: Story = { args: { length: 4 } };

/** Longer code. */
export const EightDigit: Story = { args: { length: 8 } };

/** Pre-filled + complete on mount: announces the code once. */
export const Prefilled: Story = { args: { defaultValue: "123456" } };

/** Controlled: value and onChange are owned by the parent. */
export const Controlled: Story = {
  render: () => {
    function Demo() {
      const [code, setCode] = useState("");
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 340 }}>
          <OTPInput value={code} onChange={setCode} onComplete={(v) => console.log("complete", v)} />
          <div style={{ fontSize: 12, color: "#9aa0ad" }}>value: {code || "—"}</div>
        </div>
      );
    }
    return <Demo />;
  },
};
