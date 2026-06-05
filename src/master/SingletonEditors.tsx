import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Alerts, Content, Context, LeadQuality } from "../types";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Common shell: load a singleton, edit a draft, save it back. */
function useSingleton<T>(path: string) {
  const [draft, setDraft] = useState<T | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api
      .getSingleton<T>(path)
      .then((d) => {
        setDraft(d);
        setStatus("ready");
      })
      .catch((e) => {
        setMsg(errMsg(e));
        setStatus("error");
      });
  }, [path]);

  const save = async (savePath: string, body: unknown) => {
    setMsg("");
    try {
      await api.putSingleton(savePath, body);
      setMsg("✓ Tersimpan");
    } catch (e) {
      setMsg(errMsg(e));
    }
  };
  return { draft, setDraft, status, msg, save };
}

function Shell({ title, msg, children }: { title: string; msg: string; children: React.ReactNode }) {
  return (
    <div className="md-panel">
      <header className="md-head">
        <div>
          <h2>{title}</h2>
        </div>
        {msg && <span className="md-count" style={{ color: msg.startsWith("✓") ? "var(--good)" : "var(--bad)" }}>{msg}</span>}
      </header>
      <div className="md-body-pad">{children}</div>
    </div>
  );
}

/* tiny rows editor for arrays of flat objects */
interface Col {
  key: string;
  label: string;
  type?: "text" | "number";
  options?: string[];
}
function RowsEditor<T extends Record<string, unknown>>({
  rows,
  cols,
  blank,
  onChange,
}: {
  rows: T[];
  cols: Col[];
  blank: () => T;
  onChange: (rows: T[]) => void;
}) {
  const set = (i: number, k: string, v: unknown) => {
    const next = rows.slice();
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };
  return (
    <div className="md-table-wrap" style={{ marginBottom: 10 }}>
      <table className="md-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th className="md-actions-col"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c.key}>
                  {c.options ? (
                    <select value={String(r[c.key] ?? "")} onChange={(e) => set(i, c.key, e.target.value)}>
                      {c.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={c.type === "number" ? "number" : "text"}
                      value={String(r[c.key] ?? "")}
                      onChange={(e) => set(i, c.key, c.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </td>
              ))}
              <td className="md-actions">
                <button type="button" className="md-btn danger" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="md-btn" style={{ margin: 8 }} onClick={() => onChange([...rows, blank()])}>
        ＋ Baris
      </button>
    </div>
  );
}

const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="mdf-field">
    <span>{label}</span>
    {children}
  </label>
);

/* ---- Context + Spend --------------------------------------------------- */
export function ContextEditor() {
  const { draft, setDraft, status, msg, save } = useSingleton<Context>("context");
  const [spend, setSpend] = useState<number>(0);
  useEffect(() => {
    api.dashboard().then((d) => setSpend(d.spend)).catch(() => {});
  }, []);
  if (status !== "ready" || !draft) return <Shell title="Context & Spend" msg={msg}>Memuat…</Shell>;
  const c = draft;
  const upd = (k: keyof Context, v: unknown) => setDraft({ ...c, [k]: v });
  return (
    <Shell title="Context & Spend" msg={msg}>
      <div className="mdf-grid2">
        <F label="Periode"><input value={c.period} onChange={(e) => upd("period", e.target.value)} /></F>
        <F label="Update"><input value={c.updated} onChange={(e) => upd("updated", e.target.value)} /></F>
        <F label="Goal (unit)"><input type="number" value={c.goal} onChange={(e) => upd("goal", Number(e.target.value))} /></F>
        <F label="Booking YTD"><input type="number" value={c.bookingYTD} onChange={(e) => upd("bookingYTD", Number(e.target.value))} /></F>
        <F label="Completeness (%)"><input type="number" value={c.completeness} onChange={(e) => upd("completeness", Number(e.target.value))} /></F>
        <F label="Total Spend (Rp)"><input type="number" value={spend} onChange={(e) => setSpend(Number(e.target.value))} /></F>
      </div>
      <button className="md-btn primary" onClick={async () => { await save("context", c); await api.putSingleton("spend", { spend }); }}>
        Simpan
      </button>
    </Shell>
  );
}

/* ---- Alerts ------------------------------------------------------------ */
export function AlertsEditor() {
  const { draft, setDraft, status, msg, save } = useSingleton<Alerts>("alerts");
  if (status !== "ready" || !draft) return <Shell title="Alert System" msg={msg}>Memuat…</Shell>;
  const a = draft;
  const area = (k: "red" | "yellow" | "green", label: string) => (
    <F label={`${label} (satu alert per baris)`}>
      <textarea
        rows={5}
        value={a[k].join("\n")}
        onChange={(e) => setDraft({ ...a, [k]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
      />
    </F>
  );
  return (
    <Shell title="Alert System" msg={msg}>
      <div className="mdf-grid2">
        {area("red", "🔴 Red")}
        {area("yellow", "🟡 Yellow")}
        {area("green", "🟢 Green")}
      </div>
      <button className="md-btn primary" onClick={() => save("alerts", a)}>
        Simpan
      </button>
    </Shell>
  );
}

/* ---- Lead Quality ------------------------------------------------------ */
export function LeadQualityEditor() {
  const { draft, setDraft, status, msg, save } = useSingleton<LeadQuality>("lead-quality");
  if (status !== "ready" || !draft) return <Shell title="Lead Quality" msg={msg}>Memuat…</Shell>;
  const lq = draft;
  return (
    <Shell title="Lead Quality" msg={msg}>
      <div className="mdf-grid2">
        <F label="Top Source"><input value={lq.topSource} onChange={(e) => setDraft({ ...lq, topSource: e.target.value })} /></F>
        <F label="Bottom Source"><input value={lq.bottomSource} onChange={(e) => setDraft({ ...lq, bottomSource: e.target.value })} /></F>
        <F label="Top Project"><input value={lq.topProject} onChange={(e) => setDraft({ ...lq, topProject: e.target.value })} /></F>
        <F label="Bottom Project"><input value={lq.bottomProject} onChange={(e) => setDraft({ ...lq, bottomProject: e.target.value })} /></F>
      </div>
      <div className="md-sub">Breakdown MQL</div>
      <RowsEditor
        rows={lq.breakdown}
        cols={[{ key: "label", label: "Label" }, { key: "value", label: "Jumlah", type: "number" }, { key: "color", label: "Warna", options: ["hot", "warm", "nurture", "low"] }]}
        blank={() => ({ label: "", value: 0, color: "warm" })}
        onChange={(breakdown) => setDraft({ ...lq, breakdown: breakdown as LeadQuality["breakdown"] })}
      />
      <div className="md-sub">Statistik</div>
      <RowsEditor
        rows={lq.stats}
        cols={[{ key: "label", label: "Label" }, { key: "value", label: "Nilai" }]}
        blank={() => ({ label: "", value: "" })}
        onChange={(stats) => setDraft({ ...lq, stats })}
      />
      <button className="md-btn primary" onClick={() => save("lead-quality", lq)}>
        Simpan
      </button>
    </Shell>
  );
}

/* ---- Content ----------------------------------------------------------- */
export function ContentEditor() {
  const { draft, setDraft, status, msg, save } = useSingleton<Content>("content");
  if (status !== "ready" || !draft) return <Shell title="Content & Winning" msg={msg}>Memuat…</Shell>;
  const ct = draft;
  const hl = (which: "best" | "worst") => (
    <div className="mdf-grid2">
      <F label={`${which === "best" ? "Best" : "Worst"} · Nama`}><input value={ct[which].name} onChange={(e) => setDraft({ ...ct, [which]: { ...ct[which], name: e.target.value } })} /></F>
      <F label="Akun"><input value={ct[which].account} onChange={(e) => setDraft({ ...ct, [which]: { ...ct[which], account: e.target.value } })} /></F>
      <F label="Metrik"><input value={ct[which].metric} onChange={(e) => setDraft({ ...ct, [which]: { ...ct[which], metric: e.target.value } })} /></F>
    </div>
  );
  return (
    <Shell title="Content & Winning" msg={msg}>
      <div className="md-sub">Best / Worst Creative</div>
      {hl("best")}
      {hl("worst")}
      <div className="mdf-grid2">
        <F label="Rework"><input type="number" value={ct.rework} onChange={(e) => setDraft({ ...ct, rework: Number(e.target.value) })} /></F>
        <F label="Pause"><input type="number" value={ct.pause} onChange={(e) => setDraft({ ...ct, pause: Number(e.target.value) })} /></F>
      </div>
      <div className="md-sub">Winning Campaign</div>
      <RowsEditor
        rows={ct.winning}
        cols={[
          { key: "name", label: "Nama" },
          { key: "project", label: "Project" },
          { key: "channel", label: "Channel" },
          { key: "criteria", label: "Kriteria", type: "number" },
          { key: "cpl", label: "CPL" },
          { key: "mql", label: "MQL" },
          { key: "booking", label: "Book", type: "number" },
        ]}
        blank={() => ({ name: "", project: "", channel: "", criteria: 0, cpl: "", mql: "", booking: 0 })}
        onChange={(winning) => setDraft({ ...ct, winning })}
      />
      <button className="md-btn primary" onClick={() => save("content", ct)}>
        Simpan
      </button>
    </Shell>
  );
}
