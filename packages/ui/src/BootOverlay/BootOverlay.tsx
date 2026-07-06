import { bar8 } from "@balaur/octant-core";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { useControllableState, useReducedMotion, useScramble } from "../hooks";

const DEFAULT_LINES = [
  "OCTANT.OS BIOS v1.0",
  "MEM CHECK ......... 256 STATES OK",
  "GLYPH CACHE ....... U+1CD00 MAPPED",
  "ANSI PALETTE ...... 16/16 RESOLVED",
];

// Timing constants ported from the reference `initBoot` (all in ms).
const LINE_MS = 170; // one boot line revealed every 170ms
const BAR_START = 760; // progress bar appears after 760ms
const BAR_MS = 520; // bar fills over 520ms
const BOOT_END = 1780; // boot self-dismisses after 1780ms
const FADE_MS = 400; // fade-out before unmount (markup transition is .38s)
const SAFETY_MS = 5200; // hard kill-switch in case rAF stalls
const BAR_CELLS = 26; // width of the eighth-block progress bar

/** A single boot-log line that decodes itself in via the shared scramble pass. */
function BootLine({ text, dur }: { text: string; dur: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useScramble(ref, text, { dur });
  return <div ref={ref}>{text}</div>;
}

export interface BootOverlayProps {
  /** Controlled visibility. Omit for uncontrolled (use `defaultOpen`). */
  open?: boolean;
  /** Initial visibility when uncontrolled. Defaults to `true` (boots on mount). */
  defaultOpen?: boolean;
  /** Called when visibility changes — fires with `false` when the boot dismisses. */
  onOpenChange?: (open: boolean) => void;
  /** Called once the boot sequence completes or is skipped. */
  onDone?: () => void;
  /** Boot-log lines. Defaults to the OCTANT.OS BIOS sequence. */
  lines?: string[];
  /** Colour of the boot text. Defaults to the accent CSS var. */
  accent?: string;
  style?: CSSProperties;
}

/**
 * A fullscreen boot splash: a scramble-decoded BIOS log followed by an
 * eighth-block progress bar, mirroring the reference's `initBoot`. It runs
 * client-side only (the rAF timeline lives in an effect and is fully torn down
 * on unmount), self-dismisses with a fade, and can be skipped by clicking or
 * pressing any key. Exposed as a controllable overlay via `useControllableState`.
 */
export function BootOverlay({
  open,
  defaultOpen = true,
  onOpenChange,
  onDone,
  lines = DEFAULT_LINES,
  accent = "var(--bx-accent, #46c66d)",
  style,
}: BootOverlayProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const reduced = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  const [fading, setFading] = useState(false);

  const rafRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const killedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const kill = useCallback(() => {
    if (killedRef.current) return;
    killedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    setFading(true);
    fadeTimerRef.current = setTimeout(() => {
      onDoneRef.current?.();
      setOpen(false);
    }, FADE_MS);
  }, [setOpen]);

  // Drives the boot timeline. Client-only; resets every time the overlay opens.
  useEffect(() => {
    if (!isOpen) return;
    killedRef.current = false;
    setFading(false);
    setElapsed(0);

    if (reduced) {
      onDoneRef.current?.();
      setOpen(false);
      return;
    }

    const t0 = performance.now();
    const tick = () => {
      if (killedRef.current) return;
      const t = performance.now() - t0;
      setElapsed(t);
      if (t > BOOT_END) {
        kill();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    const safety = setTimeout(kill, SAFETY_MS);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(safety);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [isOpen, reduced, kill, setOpen]);

  // Skip on any keypress (mirrors the reference's one-shot keydown listener).
  useEffect(() => {
    if (!isOpen || reduced) return;
    const onKey = () => kill();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, reduced, kill]);

  if (!isOpen) return null;

  const n = Math.min(lines.length, Math.floor(elapsed / LINE_MS) + 1);
  const visible = lines.slice(0, n);
  const showBar = elapsed > BAR_START;
  const bp = showBar ? Math.max(0, Math.min(1, (elapsed - BAR_START) / BAR_MS)) : 0;
  const complete = bp >= 1;

  return (
    <div
      role="status"
      aria-label="System boot"
      onPointerDown={kill}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "var(--bx-bg, #08080a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        opacity: fading ? 0 : 1,
        transition: "opacity .38s ease",
        ...style,
      }}
    >
      <div
        style={{
          margin: 0,
          fontFamily: "var(--bx-font-mono, ui-monospace, monospace)",
          fontSize: 14,
          lineHeight: 1.9,
          color: accent,
          whiteSpace: "pre",
          letterSpacing: "0.04em",
          minWidth: 340,
          minHeight: 170,
        }}
      >
        {visible.map((line, i) => (
          <BootLine key={i} text={line} dur={220} />
        ))}
        {showBar && (
          <>
            <div aria-hidden="true">{" "}</div>
            <div>{bar8(bp, BAR_CELLS)}</div>
            {complete && <BootLine text={"BOOT COMPLETE ✓"} dur={260} />}
          </>
        )}
      </div>
    </div>
  );
}
