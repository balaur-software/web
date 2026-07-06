import { type AccentName, accentVars } from "@balaur/tokens";
import type { CSSProperties, ReactNode } from "react";

export interface AccentProviderProps {
  /** An accent name ("green" | "amber" | "cyan") or any hex. Default "green". */
  accent?: AccentName | string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Sets `--bx-accent` / `--bx-accent-bright` on a wrapper element so every
 * descendant that reads those custom properties re-skins to the chosen accent.
 * Replaces the reference's imperative `applyAccent()` querySelector loop with
 * plain CSS-variable inheritance.
 */
export function AccentProvider({ accent = "green", children, className, style }: AccentProviderProps) {
  return (
    <div className={className} style={{ ...accentVars(accent), ...style } as CSSProperties}>
      {children}
    </div>
  );
}
