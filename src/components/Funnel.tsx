import { Fragment } from "react";
import { fmtFunnel, num } from "../lib/format";
import { FUNNEL_OWNER_COLOR } from "../lib/status";
import type { FunnelStage } from "../types";
import { Bar } from "./ui";

/** Full Funnel Control Tower — Impression → Cash-In, log-scaled bars. */
export function FunnelTower({
  funnel,
  onPick,
}: {
  funnel: FunnelStage[];
  onPick: (st: FunnelStage, idx: number, conv: number | null) => void;
}) {
  const max = funnel[0]?.value ?? 1;
  const lmin = Math.log10(funnel[funnel.length - 1]?.value ?? 1);
  const lmax = Math.log10(max);
  const conv = (i: number) => (i === 0 ? null : (funnel[i].value / funnel[i - 1].value) * 100);

  return (
    <div className="gp-funnel">
      {funnel.map((st, i) => {
        const h = ((Math.log10(st.value) - lmin) / (lmax - lmin || 1)) * 100;
        const c = FUNNEL_OWNER_COLOR[st.owner] ?? "var(--accent)";
        const cv = conv(i);
        const leak = cv !== null && cv < 30;
        return (
          <Fragment key={st.key}>
            {cv !== null && (
              <div className="gp-funnel-conv" title="Conversion ke stage ini">
                <span className={leak ? "gp-leak" : ""}>{cv >= 10 ? cv.toFixed(0) : cv.toFixed(1)}%</span>
              </div>
            )}
            <button className="gp-funnel-stage" onClick={() => onPick(st, i, cv)}>
              <span className="gp-funnel-val">{fmtFunnel(st.value)}</span>
              <div className="gp-funnel-track">
                <div className="gp-funnel-bar" style={{ height: Math.max(8, h) + "%", background: c }} />
              </div>
              <span className="gp-funnel-key">{st.key}</span>
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

function Row({
  label,
  v,
  mx,
  c,
  bold,
}: {
  label: string;
  v: number;
  mx: number;
  c: string;
  bold?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 92, fontSize: 12, fontWeight: bold ? 700 : 500, color: bold ? "var(--ink)" : "var(--muted)" }}>
        {label}
      </span>
      <div style={{ flex: 1 }}>
        <Bar value={v} max={mx} color={c} h={bold ? 10 : 7} />
      </div>
      <span style={{ width: 64, textAlign: "right", fontSize: 12, fontVariantNumeric: "tabular-nums", fontWeight: bold ? 700 : 500 }}>
        {fmtFunnel(v)}
      </span>
    </div>
  );
}

/** Drilldown content for one funnel stage. */
export function FunnelDrill({
  funnel,
  stage,
  idx,
  conv,
}: {
  funnel: FunnelStage[];
  stage: FunnelStage;
  idx: number;
  conv: number | null;
}) {
  const prev = idx > 0 ? funnel[idx - 1] : null;
  const next = idx < funnel.length - 1 ? funnel[idx + 1] : null;
  const c = FUNNEL_OWNER_COLOR[stage.owner] ?? "var(--accent)";
  const drop = prev ? prev.value - stage.value : 0;
  const mx = funnel[0]?.value ?? 1;
  return (
    <div>
      <div className="gp-drill-hero" style={{ borderColor: c }}>
        <div>
          <div className="gp-drill-bignum" style={{ color: c }}>
            {num(stage.value)}
          </div>
          <div className="gp-drill-sub">
            Owner utama <b>{stage.owner}</b>
            {conv !== null && prev && (
              <>
                {" "}
                · Konversi dari {prev.key} <b style={{ color: c }}>{conv.toFixed(1)}%</b>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="gp-drill-grid">
        <div className="gp-drill-cell">
          <span className="gp-mini-label">Posisi di funnel</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {prev && <Row label={prev.key} v={prev.value} mx={mx} c="var(--track-strong)" />}
            <Row label={stage.key} v={stage.value} mx={mx} c={c} bold />
            {next && <Row label={next.key} v={next.value} mx={mx} c="var(--track-strong)" />}
          </div>
        </div>
        <div className="gp-drill-cell">
          <span className="gp-mini-label">Catatan kebocoran</span>
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5 }}>
            {prev ? (
              <>
                Selisih dari <b>{prev.key}</b>: <b>{num(drop)}</b> hilang di tahap ini.
              </>
            ) : (
              "Tahap teratas funnel — basis exposure."
            )}
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted)" }}>
            Reason code & owner accountability tersedia pada drilldown stage detail.
          </p>
        </div>
      </div>
    </div>
  );
}
