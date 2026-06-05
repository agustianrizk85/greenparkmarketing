// Status → colour-token maps, ported from the dashboard mockup (ui.jsx /
// funnel.jsx / panels.jsx). Colours reference CSS variables in styles.css.

import type { ChannelStatus, CommandStatus, Status } from "../types";

export interface StatusToken {
  c: string;
  bg: string;
  label: string;
}

export const GP_STATUS: Record<Status, StatusToken> = {
  good: { c: "var(--good)", bg: "var(--good-bg)", label: "Sehat" },
  warn: { c: "var(--warn)", bg: "var(--warn-bg)", label: "Pantau" },
  bad: { c: "var(--bad)", bg: "var(--bad-bg)", label: "Alert" },
};

export const CH_STATUS: Record<ChannelStatus, StatusToken> = {
  scale: { c: "var(--good)", bg: "var(--good-bg)", label: "Scale" },
  optimize: { c: "var(--warn)", bg: "var(--warn-bg)", label: "Optimize" },
  pause: { c: "var(--bad)", bg: "var(--bad-bg)", label: "Pause" },
  test: { c: "var(--muted)", bg: "rgba(120,130,128,.12)", label: "Test" },
};

export const CMD_STATUS: Record<CommandStatus, { c: string; t: string }> = {
  open: { c: "var(--bad)", t: "Open" },
  progress: { c: "var(--gold)", t: "Progress" },
  done: { c: "var(--good)", t: "Done" },
};

/** Funnel-stage owner → accent colour. */
export const FUNNEL_OWNER_COLOR: Record<string, string> = {
  Marketing: "var(--accent)",
  "Marketing / AI": "var(--accent)",
  Sales: "var(--navy)",
  "Sales + Finance": "var(--navy)",
  "Keuangan / KPR": "var(--gold)",
  "Keuangan + Sales": "var(--gold)",
  Finance: "var(--gold)",
};

/** Lead-quality band colour. */
export const LQ_COLOR: Record<string, string> = {
  hot: "var(--good)",
  warm: "var(--accent)",
  nurture: "var(--gold)",
  low: "var(--bad)",
};

/** Asset / IG health → colour. */
export function healthColor(h: number): string {
  return h >= 75 ? "var(--good)" : h >= 55 ? "var(--gold)" : "var(--bad)";
}
