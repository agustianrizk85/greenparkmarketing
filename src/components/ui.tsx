import type { CSSProperties, ReactNode } from "react";
import { GP_STATUS } from "../lib/status";
import type { Status } from "../types";

/** A titled panel/card — the building block of the bento grid. */
export function Panel({
  title,
  tag,
  children,
  accent,
}: {
  title: string;
  tag?: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <section className="gp-panel">
      <header className="gp-panel-head">
        <div className="gp-panel-title">
          {accent && <span className="gp-panel-accent" style={{ background: accent }} />}
          <h3>{title}</h3>
        </div>
        {tag && <span className="gp-panel-tag">{tag}</span>}
      </header>
      <div className="gp-panel-body">{children}</div>
    </section>
  );
}

/** Small status dot. */
export function Dot({ status, size = 8 }: { status: Status; size?: number }) {
  const s = GP_STATUS[status] ?? GP_STATUS.warn;
  return (
    <span
      style={{ display: "inline-block", width: size, height: size, borderRadius: 99, background: s.c, flex: "none" }}
    />
  );
}

/** Gap chip. */
export function Chip({ children, status }: { children: ReactNode; status: Status }) {
  const s = GP_STATUS[status] ?? GP_STATUS.warn;
  return (
    <span className="gp-chip" style={{ color: s.c, background: s.bg }}>
      {children}
    </span>
  );
}

/** Inline sparkline. */
export function Spark({
  data,
  color = "var(--accent)",
  w = 88,
  h = 24,
}: {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}) {
  if (!data || !data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / rng) * (h - 4) - 2;
    return [x, y] as const;
  });
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L ${w} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={area} fill={color} opacity="0.10" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
}

/** Mini horizontal bar. */
export function Bar({
  value,
  max,
  color = "var(--accent)",
  h = 6,
}: {
  value: number;
  max: number;
  color?: string;
  h?: number;
}) {
  const w = Math.max(2, Math.min(100, (value / max) * 100));
  const style: CSSProperties = {
    background: "var(--track)",
    borderRadius: 99,
    height: h,
    overflow: "hidden",
    width: "100%",
  };
  return (
    <div style={style}>
      <div style={{ width: w + "%", height: "100%", background: color, borderRadius: 99 }} />
    </div>
  );
}
