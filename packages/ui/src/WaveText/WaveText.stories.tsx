import type { Meta, StoryObj } from "@storybook/react";
import { WaveText } from "./WaveText.tsx";

const meta: Meta<typeof WaveText> = {
  title: "OCTANT/WaveText",
  component: WaveText,
  args: { text: "OSCILLATE" },
};
export default meta;
type Story = StoryObj<typeof WaveText>;

export const Default: Story = {};

export const Phrase: Story = {
  args: { text: "SIGNAL ACQUIRED", fontSize: 22 },
};

export const HighAmplitude: Story = {
  args: { text: "RIPPLE", amplitude: 16, phaseStep: 0.7, fontSize: 34 },
};

export const AccentSlow: Story = {
  args: { text: "AMBIENT", color: "var(--bx-accent, #46c66d)", speed: 1.6 },
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <WaveText text="OSCILLATE" />
      <WaveText text="TELEMETRY" color="var(--bx-accent, #46c66d)" phaseStep={0.35} speed={2.4} />
      <WaveText text="WAVEFORM" color="#d94f9d" amplitude={12} />
    </div>
  ),
};
