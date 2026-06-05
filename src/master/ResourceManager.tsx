import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { downloadXlsx } from "../lib/xlsx";
import type { Cell } from "../lib/xlsx";
import type { FieldDef, ResourceConfig } from "./schema";
import { ImportButton } from "./ImportData";

type MasterRecord = Record<string, unknown> & { _id?: string };

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/* ---- value coercion ---------------------------------------------------- */
function toFormValue(f: FieldDef, raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  if (f.type === "numbers") return Array.isArray(raw) ? raw.join(", ") : String(raw);
  if (f.type === "bool") return raw === true || raw === "true" ? "true" : "false";
  return String(raw);
}

function fromFormValue(f: FieldDef, v: string): unknown {
  if (f.type === "number") return v === "" ? 0 : Number(v);
  if (f.type === "numbers") return v.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
  if (f.type === "bool") return v === "true";
  return v;
}

/** Coerce an imported string record (CSV/Excel) into a typed payload. */
function coerceImport(config: ResourceConfig, raw: Record<string, unknown>): MasterRecord {
  const out: MasterRecord = {};
  for (const f of config.fields) {
    if (raw[f.name] === undefined) continue;
    out[f.name] = fromFormValue(f, String(raw[f.name] ?? ""));
  }
  return out;
}

function exportCell(f: FieldDef, rec: MasterRecord): Cell {
  const v = rec[f.name];
  if (v === null || v === undefined || v === "") return "";
  if (f.type === "numbers") return Array.isArray(v) ? v.join(", ") : String(v);
  if (f.type === "bool") return v === true || v === "true" ? "Ya" : "Tidak";
  if (f.type === "number") return typeof v === "number" ? v : Number(v);
  if (f.type === "select" && f.options) {
    const o = f.options.find((o) => o.value === v);
    return o ? o.label : String(v);
  }
  return String(v);
}

/* ---- manager ----------------------------------------------------------- */
export function ResourceManager({ config }: { config: ResourceConfig }) {
  const [items, setItems] = useState<MasterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<MasterRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const columns = useMemo(() => config.fields.filter((f) => !f.hideInTable), [config]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .list<MasterRecord>(config.key)
      .then((d) => setItems(d ?? []))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [config.key]);

  useEffect(load, [load]);

  const onDelete = async (rec: MasterRecord) => {
    if (!rec._id || !window.confirm(`Hapus ${config.singular} ini?`)) return;
    try {
      await api.deleteEntity(config.key, rec._id);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const importItems = async (rows: Record<string, unknown>[]): Promise<number> => {
    let n = 0;
    for (const raw of rows) {
      await api.saveEntity(config.key, coerceImport(config, raw));
      n++;
    }
    load();
    return n;
  };

  const onExport = () => {
    const cols = config.fields.map((f) => f.label);
    const body: Cell[][] = items.map((rec) => config.fields.map((f) => exportCell(f, rec)));
    downloadXlsx(`Marketing-${config.title}`, cols, body, config.title.slice(0, 31));
  };

  return (
    <div className="md-panel">
      <header className="md-head">
        <div>
          <h2>{config.title}</h2>
          <span className="md-count">{items.length} data</span>
        </div>
        <div className="md-head-actions">
          <button className="md-btn" onClick={onExport} disabled={items.length === 0} title="Unduh sebagai Excel (.xlsx)">
            ▦ Excel
          </button>
          <ImportButton columns={config.fields.map((f) => f.name)} onImport={importItems} entity={config.key} />
          <button className="md-btn primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            ＋ Tambah {config.singular}
          </button>
        </div>
      </header>

      {error && <div className="md-error">{error}</div>}

      <div className="md-table-wrap">
        {loading ? (
          <div className="md-empty">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="md-empty">Belum ada data.</div>
        ) : (
          <table className="md-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.name}>{c.label}</th>
                ))}
                <th className="md-actions-col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((rec) => (
                <tr key={rec._id}>
                  {columns.map((c) => (
                    <td key={c.name}>{String(exportCell(c, rec) ?? "")}</td>
                  ))}
                  <td className="md-actions">
                    <button className="md-btn" onClick={() => { setEditing(rec); setFormOpen(true); }}>
                      Edit
                    </button>
                    <button className="md-btn danger" onClick={() => onDelete(rec)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && (
        <RecordForm
          config={config}
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); load(); }}
        />
      )}
    </div>
  );
}

/* ---- create / edit form ------------------------------------------------ */
function RecordForm({
  config,
  editing,
  onClose,
  onSaved,
}: {
  config: ResourceConfig;
  editing: MasterRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const f of config.fields) out[f.name] = toFormValue(f, editing?.[f.name]);
    return out;
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload: MasterRecord = {};
    if (editing?._id) payload._id = editing._id;
    for (const f of config.fields) payload[f.name] = fromFormValue(f, values[f.name] ?? "");
    try {
      await api.saveEntity(config.key, payload);
      onSaved();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mdf-overlay" onClick={onClose}>
      <form className="mdf-card" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <header className="mdf-head">
          <h3>
            {editing ? "Edit" : "Tambah"} {config.singular}
          </h3>
          <button type="button" className="mdf-close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="mdf-body">
          {config.fields.map((f) => (
            <Field key={f.name} def={f} value={values[f.name] ?? ""} onChange={set} />
          ))}
        </div>
        {error && <div className="mdf-error">{error}</div>}
        <footer className="mdf-foot">
          <button type="button" className="md-btn" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="md-btn primary" disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({ def, value, onChange }: { def: FieldDef; value: string; onChange: (n: string, v: string) => void }) {
  return (
    <label className={`mdf-field ${def.type === "textarea" ? "wide" : ""}`}>
      <span className="mdf-label">
        {def.label}
        {def.tip && (
          <span className="mdf-tip" tabIndex={0} title={def.tip + (def.result ? "\n\nHasil: " + def.result : "")}>
            <span className="mdf-tip-i">i</span>
            <span className="mdf-tip-pop" role="tooltip">
              <b>{def.label}</b>
              <span>{def.tip}</span>
              {def.result && (
                <span className="mdf-tip-res">
                  <b>Hasil:</b> {def.result}
                </span>
              )}
            </span>
          </span>
        )}
      </span>
      {def.type === "select" ? (
        <select value={value} onChange={(e) => onChange(def.name, e.target.value)}>
          <option value="">— pilih —</option>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : def.type === "bool" ? (
        <select value={value || "false"} onChange={(e) => onChange(def.name, e.target.value)}>
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
      ) : def.type === "textarea" ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(def.name, e.target.value)} />
      ) : (
        <input
          type={def.type === "number" ? "number" : "text"}
          value={value}
          placeholder={def.type === "numbers" ? "mis. 2600, 2750, 2900" : undefined}
          onChange={(e) => onChange(def.name, e.target.value)}
        />
      )}
    </label>
  );
}
