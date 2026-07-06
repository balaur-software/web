import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode, useState } from "react";
import { FillButton } from "../FillButton/FillButton.tsx";
import { Sheet, type SheetProps } from "./Sheet.tsx";

const openBtnStyle = {
  fontFamily: "inherit",
  fontSize: 13,
  letterSpacing: "0.08em",
  padding: "11px 18px",
  background: "var(--bx-surface-2, #15161e)",
  border: "1px solid var(--bx-border-accent, #2a3320)",
  color: "var(--bx-accent, #46c66d)",
  cursor: "pointer",
} as const;

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px dotted var(--bx-border, #1c1d24)",
        padding: "10px 0",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#7b8290" }}>{label}</span>
      <span style={{ color: "#c8cdd6" }}>{value}</span>
    </div>
  );
}

/** The reference "NODE DETAILS" body: an identity block plus a dotted stat table. */
function NodeDetails() {
  return (
    <>
      <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            flex: "none",
            border: "1px solid var(--bx-border, #1c1d24)",
            background: "var(--bx-surface-3, #0c0d11)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--bx-accent, #46c66d)",
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          {"◈"}
        </div>
        <div>
          <div style={{ color: "var(--bx-text-1, #f4f6fb)", fontSize: 14 }}>OCTANT-01</div>
          <div style={{ color: "var(--bx-accent, #46c66d)", fontSize: 12 }}>{"● online"}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <StatRow label="LOAD" value="82%" />
        <StatRow label="CELLS" value="2048" />
        <StatRow label="UPTIME" value="14:22:07" />
        <StatRow label="REGION" value="grid-west" />
      </div>
    </>
  );
}

/** Interactive harness: an OPEN SHEET button + a self-contained Sheet. */
function SheetDemo({
  trigger = "OPEN SHEET",
  children,
  footer,
  ...props
}: Partial<SheetProps> & { trigger?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} style={openBtnStyle}>
        {trigger} {"▸"}
      </button>
      <Sheet open={open} onClose={close} title="NODE DETAILS" footer={footer} {...props}>
        {children ?? <NodeDetails />}
      </Sheet>
    </div>
  );
}

const detailFooter = (close: () => void) => (
  <>
    <button
      type="button"
      onClick={close}
      style={{
        flex: 1,
        fontFamily: "inherit",
        fontSize: 13,
        padding: 10,
        background: "transparent",
        border: "1px solid var(--bx-border, #1c1d24)",
        color: "var(--bx-text-2, #9aa0ad)",
        cursor: "pointer",
      }}
    >
      CLOSE
    </button>
    <FillButton style={{ flex: 1, padding: 10, letterSpacing: 0 }}>CONNECT</FillButton>
  </>
);

const meta: Meta<typeof Sheet> = {
  title: "OCTANT/Sheet",
  component: Sheet,
};
export default meta;
type Story = StoryObj<typeof Sheet>;

/** Right-docked drawer with the reference node-details body and a two-action footer. */
export const Default: Story = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      const close = () => setOpen(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)} style={openBtnStyle}>
            OPEN SHEET {"▸"}
          </button>
          <Sheet open={open} onClose={close} title="NODE DETAILS" footer={detailFooter(close)}>
            <NodeDetails />
          </Sheet>
        </div>
      );
    }
    return <Demo />;
  },
};

/** Docks and slides in from the left edge instead of the right. */
export const LeftEdge: Story = {
  render: () => (
    <SheetDemo trigger="OPEN LEFT" side="left" title="FILTERS">
      <div style={{ color: "var(--bx-text-2, #9aa0ad)", fontSize: 13, lineHeight: 1.8 }}>
        A left-docked sheet reads well as a nav or filter rail. It slides in from the leading edge and traps focus until
        dismissed via the scrim, Escape, or the × control.
      </div>
    </SheetDemo>
  ),
};

/** No footer bar — just a header and a scrolling body of log lines. */
export const ScrollingBody: Story = {
  render: () => (
    <SheetDemo trigger="OPEN LOG" title="EVENT LOG">
      <div style={{ fontSize: 12, lineHeight: 1.9, color: "var(--bx-text-2, #9aa0ad)" }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{ borderBottom: "1px dotted var(--bx-border, #1c1d24)", padding: "4px 0" }}>
            <span style={{ color: "var(--bx-accent, #46c66d)" }}>{String(i).padStart(3, "0")}</span> cell flush ok · region
            grid-west
          </div>
        ))}
      </div>
    </SheetDemo>
  ),
};

/** Rendered open so the docked panel and its layout are visible without interaction. */
export const AlwaysOpen: Story = {
  render: () => (
    <Sheet open onClose={() => {}} title="NODE DETAILS" footer={detailFooter(() => {})}>
      <NodeDetails />
    </Sheet>
  ),
};
