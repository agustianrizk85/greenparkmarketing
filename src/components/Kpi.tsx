import { GP_STATUS } from "../lib/status";
import type { KPI } from "../types";
import { Chip, Dot, Spark } from "./ui";

function KpiTile({ k, onClick }: { k: KPI; onClick: (k: KPI) => void }) {
  const s = GP_STATUS[k.status];
  return (
    <button
      className="gp-kpi"
      style={{ ["--st" as string]: s.c, ["--stbg" as string]: s.bg }}
      onClick={() => onClick(k)}
    >
      <div className="gp-kpi-top">
        <span className="gp-kpi-label">{k.label}</span>
        <Dot status={k.status} size={7} />
      </div>
      <div className="gp-kpi-val">
        {k.value}
        {k.suffix && <span className="gp-kpi-suffix">{k.suffix}</span>}
      </div>
      <div className="gp-kpi-meta">
        <span className="gp-kpi-target">Tgt {k.target}</span>
        <Chip status={k.status}>{k.gap}</Chip>
      </div>
      <div className="gp-kpi-spark">
        <Spark data={k.trend} color={s.c} w={120} h={20} />
      </div>
    </button>
  );
}

/** North Star KPI ribbon. */
export function KpiRibbon({ kpis, onPick }: { kpis: KPI[]; onPick: (k: KPI) => void }) {
  return (
    <div className="gp-ribbon">
      {kpis.map((k) => (
        <KpiTile key={k.id} k={k} onClick={onPick} />
      ))}
    </div>
  );
}

/** Drilldown content for a KPI. */
export function KpiDrill({ k }: { k: KPI }) {
  const s = GP_STATUS[k.status];
  const mx = Math.max(...k.trend);
  return (
    <div>
      <div className="gp-drill-hero" style={{ borderColor: s.c }}>
        <div>
          <div className="gp-drill-bignum" style={{ color: s.c }}>
            {k.value}
            {k.suffix && <span style={{ fontSize: "0.5em", color: "var(--muted)" }}>{k.suffix}</span>}
          </div>
          <div className="gp-drill-sub">
            Target <b>{k.target}</b> · Gap <b style={{ color: s.c }}>{k.gap}</b> · Status{" "}
            <b style={{ color: s.c }}>{s.label}</b>
          </div>
        </div>
        <Spark data={k.trend} color={s.c} w={220} h={64} />
      </div>
      <p className="gp-drill-note">{k.note}</p>
      <div className="gp-drill-grid">
        <div className="gp-drill-cell">
          <span className="gp-mini-label">Tren 6 periode</span>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 56, marginTop: 8 }}>
            {k.trend.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: (v / mx) * 100 + "%",
                  background: i === k.trend.length - 1 ? s.c : "var(--track)",
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
        </div>
        <div className="gp-drill-cell">
          <span className="gp-mini-label">Interpretasi CEO</span>
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5 }}>{k.note}</p>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted)" }}>
            Drilldown penuh: per channel · per project · per campaign tersedia pada modul detail.
          </p>
        </div>
      </div>
    </div>
  );
}
