import type { Meta, StoryObj } from "@storybook/react";
import { Carousel } from "./Carousel.tsx";

const meta: Meta<typeof Carousel> = {
  title: "OCTANT/Carousel",
  component: Carousel,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {};

export const Static: Story = {
  args: { autoplay: false },
};

export const Bare: Story = {
  args: { showDots: false, showArrows: false, autoplay: false },
};

const panel = (label: string, sub: string, color: string): React.ReactNode => (
  <div
    style={{
      height: 208,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      background: "#0a0b0e",
    }}
  >
    <span style={{ fontSize: 40, lineHeight: 1, color }}>{label}</span>
    <span style={{ color: "#5b616e", fontSize: 12, letterSpacing: "0.1em" }}>{sub}</span>
  </div>
);

export const CustomSlides: Story = {
  args: {
    interval: 2600,
    slides: [
      panel("§ 01", "GENERATIVE", "var(--bx-accent, #46c66d)"),
      panel("§ 02", "COMPOSITES", "#2bd9d9"),
      panel("§ 03", "OVERLAYS", "#c061ff"),
    ],
  },
};
