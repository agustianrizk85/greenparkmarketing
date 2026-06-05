import { num, rp } from "../lib/format";
import { CH_STATUS, CMD_STATUS, GP_STATUS, healthColor, LQ_COLOR } from "../lib/status";
import type {
  Alerts as AlertsData,
  Asset,
  Channel,
  Command,
  Content,
  HandoverItem,
  IGAccount,
  LeadQuality as LeadQualityData,
  Project,
} from "../types";
import { Bar } from "./ui";

/* ---------- Lead Quality ---------- */
export function LeadQuality({ lq }: { lq: LeadQualityData }) {
  const total = lq.breakdown.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <div className="gp-lq">
      <div className="gp-lq-bar">
        {lq.breakdown.map((b) => (
          <div
            key={b.label}
            className="gp-lq-seg"
            style={{ width: (b.value / total) * 100 + "%", background: LQ_COLOR[b.color] }}
            title={b.label + ": " + b.value}
          />
        ))}
      </div>
      <div className="gp-lq-legend">
        {lq.breakdown.map((b) => (
          <div key={b.label} className="gp-lq-item">
            <span className="gp-lq-swatch" style={{ background: LQ_COLOR[b.color] }} />
            <span className="gp-lq-name">{b.label}</span>
            <span className="gp-lq-num">{num(b.value)}</span>
          </div>
        ))}
      </div>
      <div className="gp-lq-stats">
        {lq.stats.map((s) => (
          <div key={s.label} className="gp-stat-mini">
            <span>{s.value}</span>
            <label>{s.label}</label>
          </div>
        ))}
      </div>
      <div className="gp-lq-srcs">
        <div>
          <span className="gp-up">▲ Top</span> {lq.topSource}
        </div>
        <div>
          <span className="gp-down">▼ Bottom</span> {lq.bottomSource}
        </div>
      </div>
    </div>
  );
}

/* ---------- MQL → SAL handover ---------- */
export function Handover({ handover }: { handover: HandoverItem[] }) {
  return (
    <div className="gp-handover">
      {handover.map((h) => (
        <div key={h._id} className="gp-ho-cell">
          <div className="gp-ho-val" style={{ color: GP_STATUS[h.status].c }}>
            {h.value}
          </div>
          <div className="gp-ho-label">{h.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Channel Performance Matrix ---------- */
export function ChannelMatrix({ channels, onPick }: { channels: Channel[]; onPick: (ch: Channel) => void }) {
  const maxLeads = Math.max(...channels.map((c) => c.leads), 1);
  return (
    <div className="gp-table-wrap">
      <table className="gp-table">
        <thead>
          <tr>
            <th>Channel</th>
            <th className="r">Spend</th>
            <th className="r">Leads</th>
            <th className="r">MQL</th>
            <th className="r">CPL</th>
            <th className="r">ROI</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((c) => {
            const st = CH_STATUS[c.status];
            return (
              <tr key={c._id} onClick={() => onPick(c)} className="gp-row">
                <td>
                  <div className="gp-ch-name">{c.name}</div>
                  <div className="gp-ch-grp">{c.group}</div>
                </td>
                <td className="r mono">{c.spend ? rp(c.spend) : "—"}</td>
                <td className="r mono">
                  <div className="gp-cell-bar">
                    <Bar value={c.leads} max={maxLeads} color={st.c} h={5} />
                  </div>
                  {num(c.leads)}
                </td>
                <td className="r mono">{num(c.mql)}</td>
                <td className="r mono">{c.cpl ? rp(c.cpl) : "—"}</td>
                <td className="r mono">{c.roi}</td>
                <td>
                  <span className="gp-status-pill" style={{ color: st.c, background: st.bg }}>
                    {st.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ChannelDrill({ ch }: { ch: Channel }) {
  const st = CH_STATUS[ch.status];
  const rows: [string, string][] = [
    ["Group", ch.group],
    ["Spend", ch.spend ? rp(ch.spend) : "—"],
    ["Leads", num(ch.leads)],
    ["MQL", num(ch.mql)],
    ["MQL Rate", ch.leads ? ((ch.mql / ch.leads) * 100).toFixed(1) + "%" : "—"],
    ["CPL", ch.cpl ? rp(ch.cpl) : "—"],
    ["CPQL", ch.cpql ? rp(ch.cpql) : "—"],
    ["ROI", ch.roi],
  ];
  return (
    <div>
      <div className="gp-drill-hero" style={{ borderColor: st.c }}>
        <div>
          <div className="gp-drill-bignum" style={{ fontSize: 30 }}>
            {ch.name}
          </div>
          <div className="gp-drill-sub">
            Keputusan CEO: <b style={{ color: st.c }}>{st.label}</b>
          </div>
        </div>
        <span className="gp-status-pill" style={{ color: st.c, background: st.bg, fontSize: 14, padding: "8px 16px" }}>
          {st.label}
        </span>
      </div>
      <div className="gp-kv-grid">
        {rows.map(([l, v]) => (
          <div key={l} className="gp-kv">
            <label>{l}</label>
            <span className="mono">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Project Demand & Readiness quadrant ---------- */
function projColor(p: Project): string {
  if (p.demand >= 60 && p.readiness >= 60) return "var(--good)";
  if (p.demand < 60 && p.readiness < 60) return "var(--bad)";
  return "var(--gold)";
}

export function ProjectMatrix({ projects, onPick }: { projects: Project[]; onPick: (p: Project) => void }) {
  return (
    <div className="gp-quad">
      <div className="gp-quad-plot">
        <span className="gp-quad-ylabel">Demand →</span>
        <span className="gp-quad-xlabel">Readiness →</span>
        <div className="gp-quad-mid-v" />
        <div className="gp-quad-mid-h" />
        <span className="gp-quad-tag tl">Fix readiness</span>
        <span className="gp-quad-tag tr">Scale</span>
        <span className="gp-quad-tag bl">Hold</span>
        <span className="gp-quad-tag br">Improve message</span>
        {projects.map((p) => (
          <button
            key={p._id}
            className="gp-dot"
            title={p.name}
            style={{
              left: p.readiness + "%",
              bottom: p.demand + "%",
              background: projColor(p),
              width: 10 + p.booking,
              height: 10 + p.booking,
            }}
            onClick={() => onPick(p)}
          />
        ))}
      </div>
    </div>
  );
}

export function ProjectDrill({ p }: { p: Project }) {
  const scale = p.demand >= 60 && p.readiness >= 60;
  const decision = scale
    ? "Scale"
    : p.demand >= 60
      ? "Fix readiness before scale"
      : p.readiness >= 60
        ? "Rework campaign / message"
        : "Hold / pembenahan";
  const dc = projColor(p);
  return (
    <div>
      <div className="gp-drill-hero" style={{ borderColor: dc }}>
        <div>
          <div className="gp-drill-bignum" style={{ fontSize: 28 }}>
            {p.name}
          </div>
          <div className="gp-drill-sub">
            @{p.ig} · Keputusan: <b style={{ color: dc }}>{decision}</b>
          </div>
        </div>
      </div>
      <div className="gp-kv-grid">
        <div className="gp-kv">
          <label>Demand Score</label>
          <span className="mono">{p.demand}/100</span>
        </div>
        <div className="gp-kv">
          <label>Readiness Score</label>
          <span className="mono">{p.readiness}/100</span>
        </div>
        <div className="gp-kv">
          <label>Leads</label>
          <span className="mono">{num(p.leads)}</span>
        </div>
        <div className="gp-kv">
          <label>MQL</label>
          <span className="mono">{num(p.mql)}</span>
        </div>
        <div className="gp-kv">
          <label>Booking</label>
          <span className="mono">{p.booking}</span>
        </div>
        <div className="gp-kv">
          <label>MQL Rate</label>
          <span className="mono">{p.leads ? ((p.mql / p.leads) * 100).toFixed(1) + "%" : "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Digital Asset Registry ---------- */
export function DigitalAssets({ assets, igAccounts }: { assets: Asset[]; igAccounts: IGAccount[] }) {
  return (
    <div className="gp-assets">
      <div className="gp-asset-rows">
        {assets.map((a) => (
          <div key={a._id} className="gp-asset-row">
            <span className="gp-asset-type">{a.type}</span>
            <span className="gp-asset-handle">{a.handle}</span>
            <div className="gp-asset-bar">
              <Bar value={a.health} max={100} color={healthColor(a.health)} h={6} />
            </div>
            <span className="gp-asset-score" style={{ color: healthColor(a.health) }}>
              {a.health}
            </span>
          </div>
        ))}
      </div>
      <div className="gp-ig-head">
        {igAccounts.length} IG Project <span>· kotak = akun, warna = health, ✕ = tidak aktif</span>
      </div>
      <div className="gp-ig-grid">
        {igAccounts.map((ig) => (
          <div
            key={ig._id}
            className="gp-ig-cell"
            style={{ background: healthColor(ig.health), opacity: ig.active ? 1 : 0.42 }}
            title={"@" + ig.handle + " · health " + ig.health + " · " + ig.days + " hari lalu"}
          >
            {!ig.active && <span className="gp-ig-x">✕</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Content & Winning Campaign ---------- */
export function ContentWinning({ content }: { content: Content }) {
  return (
    <div className="gp-content">
      <div className="gp-winning-head">
        Winning Campaign <span>· lolos ≥5 dari 8 syarat</span>
      </div>
      <div className="gp-winning-list">
        {content.winning.map((w) => (
          <div key={w.name} className="gp-winning">
            <div className="gp-winning-main">
              <span className="gp-winning-name">{w.name}</span>
              <span className="gp-winning-meta">
                {w.project} · {w.channel}
              </span>
            </div>
            <div className="gp-winning-stats">
              <span title="syarat terpenuhi">{w.criteria}/8</span>
              <span>{w.cpl}</span>
              <span>MQL {w.mql}</span>
              <span className="gp-winning-book">{w.booking} book</span>
            </div>
          </div>
        ))}
      </div>
      <div className="gp-content-bw">
        <div className="gp-bw">
          <span className="gp-up">▲ Best</span>
          <b>{content.best.name}</b>
          <em>
            {content.best.account} · {content.best.metric}
          </em>
        </div>
        <div className="gp-bw">
          <span className="gp-down">▼ Worst</span>
          <b>{content.worst.name}</b>
          <em>
            {content.worst.account} · {content.worst.metric}
          </em>
        </div>
      </div>
    </div>
  );
}

/* ---------- CEO Command Panel ---------- */
export function CommandPanel({ commands }: { commands: Command[] }) {
  return (
    <div className="gp-table-wrap">
      <table className="gp-table gp-cmd">
        <thead>
          <tr>
            <th>Issue</th>
            <th>Command</th>
            <th>PIC</th>
            <th>DL</th>
            <th>Impact</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {commands.map((c) => {
            const s = CMD_STATUS[c.status];
            return (
              <tr key={c._id}>
                <td>
                  <div className="gp-cmd-issue">{c.issue}</div>
                  <div className="gp-ch-grp">{c.cause}</div>
                </td>
                <td>{c.command}</td>
                <td className="gp-nowrap">{c.pic}</td>
                <td className="mono">{c.deadline}</td>
                <td>{c.expected}</td>
                <td>
                  <span className="gp-dotpill" style={{ background: s.c }} title={s.t} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Alerts ---------- */
export function Alerts({ alerts }: { alerts: AlertsData }) {
  const blocks = [
    { key: "red", title: "Red Alert", items: alerts.red, c: "var(--bad)" },
    { key: "yellow", title: "Yellow", items: alerts.yellow, c: "var(--gold)" },
    { key: "green", title: "Green Signal", items: alerts.green, c: "var(--good)" },
  ];
  return (
    <div className="gp-alerts">
      {blocks.map((b) => (
        <div key={b.key} className="gp-alert-block">
          <div className="gp-alert-title" style={{ color: b.c }}>
            <span className="gp-alert-dot" style={{ background: b.c }} />
            {b.title}
            <span className="gp-alert-count">{b.items.length}</span>
          </div>
          <ul>
            {b.items.map((it, i) => (
              <li key={i} style={{ ["--ac" as string]: b.c }}>
                {it}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
