import { useState } from "react";
import { api } from "../api/client";
import { RESOURCES } from "./schema";
import { ResourceManager } from "./ResourceManager";
import { AlertsEditor, ContentEditor, ContextEditor, LeadQualityEditor } from "./SingletonEditors";

const SINGLETONS = [
  { key: "s:context", title: "Context & Spend", render: () => <ContextEditor /> },
  { key: "s:lead-quality", title: "Lead Quality", render: () => <LeadQualityEditor /> },
  { key: "s:content", title: "Content & Winning", render: () => <ContentEditor /> },
  { key: "s:alerts", title: "Alert System", render: () => <AlertsEditor /> },
];

/** Master-data workspace: resource picker on the left, editor on the right. */
export function MasterData({ onChanged }: { onChanged?: () => void }) {
  const [activeKey, setActiveKey] = useState(RESOURCES[0].key);
  const [busy, setBusy] = useState<"seed" | "clear" | null>(null);
  const [msg, setMsg] = useState("");

  const resource = RESOURCES.find((r) => r.key === activeKey);
  const singleton = SINGLETONS.find((s) => s.key === activeKey);

  const run = async (kind: "seed" | "clear", fn: () => Promise<unknown>, confirmMsg: string) => {
    if (busy || !window.confirm(confirmMsg)) return;
    setBusy(kind);
    setMsg("");
    try {
      await fn();
      setMsg(kind === "seed" ? "✓ Data contoh dipulihkan" : "✓ Semua data dihapus");
      onChanged?.();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="master-workspace">
      <aside className="master-nav">
        <div className="master-nav-title">Koleksi</div>
        {RESOURCES.map((r) => (
          <button key={r.key} className={`master-nav-item ${r.key === activeKey ? "active" : ""}`} onClick={() => setActiveKey(r.key)}>
            {r.title}
          </button>
        ))}
        <div className="master-nav-title">Singleton</div>
        {SINGLETONS.map((s) => (
          <button key={s.key} className={`master-nav-item ${s.key === activeKey ? "active" : ""}`} onClick={() => setActiveKey(s.key)}>
            {s.title}
          </button>
        ))}
        <div className="master-tools">
          <div className="master-nav-title">Alat Data</div>
          <button
            className="master-tool"
            disabled={busy !== null}
            onClick={() => run("seed", () => api.reseed(), "Pulihkan ke data contoh? Semua perubahan saat ini akan tergantikan.")}
          >
            {busy === "seed" ? "Memproses…" : "↻ Seed data contoh"}
          </button>
          <button
            className="master-tool danger"
            disabled={busy !== null}
            onClick={() => run("clear", () => api.clearAll(), "Hapus SEMUA data marketing? Tindakan ini tidak bisa dibatalkan.")}
          >
            {busy === "clear" ? "Memproses…" : "🗑 Hapus semua data"}
          </button>
          {msg && <div className="master-msg" style={{ color: msg.startsWith("✓") ? "var(--good)" : "var(--bad)" }}>{msg}</div>}
        </div>
      </aside>
      <section className="master-content">
        {resource ? <ResourceManager key={resource.key} config={resource} /> : singleton ? singleton.render() : null}
      </section>
    </div>
  );
}
