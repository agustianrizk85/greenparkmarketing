import { useState } from "react";
import { csvToRecords, parseCSV } from "../lib/csv";
import { downloadXlsx, parseXlsx } from "../lib/xlsx";

type Rec = Record<string, unknown>;

/** Import data from a real Excel (.xlsx), CSV or JSON file (or pasted text). */
export function ImportButton({
  entity,
  columns,
  onImport,
}: {
  entity: string;
  columns: string[];
  onImport: (rows: Rec[]) => Promise<number>;
}) {
  const [open, setOpen] = useState(false);
  const template = () => downloadXlsx(`${entity}-template`, columns, [], entity.slice(0, 31));
  return (
    <>
      <button className="md-btn" onClick={template} title="Unduh template Excel (header kolom)">
        ⬇ Template
      </button>
      <button className="md-btn" onClick={() => setOpen(true)} title="Impor dari Excel / CSV / JSON">
        ⭱ Import
      </button>
      {open && <ImportDialog columns={columns} onImport={onImport} onClose={() => setOpen(false)} />}
    </>
  );
}

function ImportDialog({
  columns,
  onImport,
  onClose,
}: {
  columns: string[];
  onImport: (rows: Rec[]) => Promise<number>;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<Rec[] | null>(null);
  const [text, setText] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setRows(null);
    setText("");
    try {
      if (/\.xlsx$/i.test(file.name)) {
        const matrix = await parseXlsx(await file.arrayBuffer());
        const recs = csvToRecords(matrix);
        setRows(recs);
        setInfo(`${recs.length} baris terbaca dari Excel.`);
      } else {
        const raw = await file.text();
        setText(raw);
        setInfo("Berkas teks dimuat — periksa lalu Import.");
      }
    } catch (err) {
      setError("Gagal membaca berkas: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const parseText = (raw: string): Rec[] => {
    const t = raw.trim();
    if (t.startsWith("[") || t.startsWith("{")) {
      const j = JSON.parse(t);
      return Array.isArray(j) ? j : [j];
    }
    return csvToRecords(parseCSV(raw));
  };

  const submit = async () => {
    setError("");
    let data: Rec[];
    try {
      data = rows ?? parseText(text);
    } catch (err) {
      setError("Format tidak valid: " + (err instanceof Error ? err.message : String(err)));
      return;
    }
    if (!data.length) {
      setError("Tidak ada baris data yang terbaca.");
      return;
    }
    setBusy(true);
    try {
      setDone(await onImport(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mdf-overlay" onClick={onClose}>
      <form
        className="mdf-card"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (done === null) submit();
          else onClose();
        }}
      >
        <header className="mdf-head">
          <h3>Import Data</h3>
          <button type="button" className="mdf-close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="mdf-body">
          {done !== null ? (
            <div className="md-count" style={{ color: "var(--good)" }}>
              ✓ Berhasil impor {done} baris.
            </div>
          ) : (
            <>
              <div className="md-count">
                Kolom: <b>{columns.join(", ")}</b>
              </div>
              <label className="mdf-field wide">
                <span>Berkas Excel (.xlsx), CSV, atau JSON</span>
                <input type="file" accept=".xlsx,.csv,.json" onChange={onFile} />
              </label>
              {info && <div className="md-count">{info}</div>}
              <label className="mdf-field wide">
                <span>atau tempel data CSV / JSON di sini</span>
                <textarea
                  rows={8}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setRows(null);
                    setInfo("");
                  }}
                  placeholder={columns.join(",") + "\n…"}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                />
              </label>
            </>
          )}
        </div>
        {error && <div className="mdf-error">{error}</div>}
        <footer className="mdf-foot">
          <button type="button" className="md-btn" onClick={onClose}>
            {done !== null ? "Tutup" : "Batal"}
          </button>
          {done === null && (
            <button type="submit" className="md-btn primary" disabled={busy || (rows === null && text.trim() === "")}>
              {busy ? "Mengimpor…" : "Import"}
            </button>
          )}
        </footer>
      </form>
    </div>
  );
}
