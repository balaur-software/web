import type { Meta, StoryObj } from "@storybook/react";
import { LogStream } from "./LogStream.tsx";

const meta: Meta<typeof LogStream> = {
  title: "OCTANT/LogStream",
  component: LogStream,
};
export default meta;
type Story = StoryObj<typeof LogStream>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LogStream />
    </div>
  ),
};

export const FastStream: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LogStream title="TELEMETRY" interval={600} maxLines={11} />
    </div>
  ),
};

export const CustomFeed: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LogStream
        title="DEPLOY"
        interval={900}
        initialCount={4}
        placeholder="type a command"
        messages={[
          "pulling image sha256:9f2a",
          "container scheduled",
          "health probe green",
          "rollout 3/3 ready",
          "gateway route swapped",
          "cache invalidated",
        ]}
      />
    </div>
  ),
};

export const WithCommandHandler: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <LogStream
        title="CONSOLE"
        onCommand={(c) => {
          // eslint-disable-next-line no-console
          console.log("command:", c);
        }}
      />
    </div>
  ),
};
