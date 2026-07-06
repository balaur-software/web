import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal, type ModalProps } from "./Modal.tsx";

/** Interactive harness: an OPEN button + a self-contained Modal. */
function ModalDemo({ trigger = "OPEN DIALOG", ...props }: Partial<ModalProps> & { trigger?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "inherit",
          fontSize: 13,
          letterSpacing: "0.1em",
          padding: "12px 20px",
          background: "var(--bx-surface-2, #15161e)",
          border: "1px solid var(--bx-border-accent, #2a3320)",
          color: "var(--bx-accent, #46c66d)",
          cursor: "pointer",
        }}
      >
        {trigger} {"▸"}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} {...props}>
        {props.children ?? "Discard the current octant buffer and reset all 256 cell states to zero?"}
      </Modal>
    </div>
  );
}

const meta: Meta<typeof Modal> = {
  title: "OCTANT/Modal",
  component: Modal,
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => (
    <ModalDemo trigger="OPEN DIALOG" title="CONFIRM FLUSH" tone="danger" confirmLabel="FLUSH" cancelLabel="CANCEL">
      Discard the current octant buffer and reset all 256 cell states to zero? This action clears every lit sub-pixel and
      cannot be undone.
    </ModalDemo>
  ),
};

export const Accent: Story = {
  render: () => (
    <ModalDemo trigger="COMMIT BUFFER" title="COMMIT BUFFER" tone="accent" confirmLabel="COMMIT" cancelLabel="CANCEL">
      Write the current 256 cell states to the frame store? The committed buffer becomes the new baseline for the next
      diff pass.
    </ModalDemo>
  ),
};

export const NarrowPrompt: Story = {
  render: () => (
    <ModalDemo trigger="RENAME LAYER" title="RENAME LAYER" tone="accent" confirmLabel="APPLY" width={340}>
      Assign a new identifier to the active octant layer.
    </ModalDemo>
  ),
};

export const AlwaysOpen: Story = {
  render: () => (
    <Modal open onClose={() => {}} title="CONFIRM FLUSH" tone="danger" confirmLabel="FLUSH">
      Discard the current octant buffer and reset all 256 cell states to zero? This action clears every lit sub-pixel and
      cannot be undone.
    </Modal>
  ),
};
