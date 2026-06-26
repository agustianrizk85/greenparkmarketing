import { useState } from "react";
import { alurLabels } from "../../lib/alurCatalog";
import {
  contentPlanService,
  type ContentPlanPreview,
  type ContentPlanApproveResult,
} from "../../services/contentplan.service";

/**
 * SyncContentPlan drives the Content Plan → work-item sync: preview (dry-run)
 * then approve. Re-syncing is idempotent (existing items are skipped), so the
 * button is safe to press repeatedly. Rendered as a modal over the canvas.
 */
export function SyncContentPlan({ onClose, onApplied }: { onClose: () => void; onApplied: () => void }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState<ContentPlanPreview | null>(null);
  const [result, setResult] = useState<ContentPlanApproveResult | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const doPreview = () =>
    run(async () => {
      setResult(null);
      setPreview(await contentPlanService.preview(url));
    });

  const doApprove = () =>
    run(async () => {
      const r = await contentPlanService.approve(url);
      setResult(r);
      onApplied();
    });

  const s = preview?.summary;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal cp-sync" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>Sinkron Content Plan</h2>
          <span className="mh-sp" />
          <button className="mclose" onClick={onClose} title="Tutup">✕</button>
        </div>

        <div className="modal-body cp-body">
          <p className="cp-hint">
            Tarik jadwal konten dari Google Sheet <b>Content Plan GP 2026</b> menjadi item kerja (Alur A–D).
            Kosongkan kolom URL untuk memakai sheet default. Sinkron ulang aman — item yang sudah ada dilewati.
          </p>

          <label className="form-field">
            <span>URL Google Sheets (opsional)</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="default: Content Plan GP 2026"
            />
          </label>

          <div className="cp-actions">
            <button className="btn-primary sm" onClick={doPreview} disabled={busy}>
              {busy && !result ? "Memuat…" : "Pratinjau"}
            </button>
            <button className="btn-primary sm" onClick={doApprove} disabled={busy || !preview || preview.new_count === 0}>
              {busy && preview ? "Menyinkron…" : `Sinkron${preview ? ` (${preview.new_count} baru)` : ""}`}
            </button>
          </div>

          {err && <div className="login-error">{err}</div>}

          {result && (
            <div className="cp-result ok">
              ✓ Selesai — <b>{result.created}</b> konten baru dibuat, {result.skipped} dilewati (sudah ada) dari {result.total}.
            </div>
          )}

          {s && (
            <div className="cp-summary">
              <div className="cp-stats">
                <Stat label="Total" value={s.total_items} />
                <Stat label="Baru" value={preview!.new_count} tone="ok" />
                <Stat label="Sudah ada" value={preview!.existing} tone="grey" />
                <Stat label="Ada caption" value={s.with_caption} />
                <Stat label="Tab dibaca" value={s.tabs_seen} />
              </div>

              <div className="cp-cols">
                <div>
                  <div className="cp-col-hd">Per Alur</div>
                  {(["A", "B", "C", "D"] as const).map((a) => (
                    <div className="cp-line" key={a}>
                      <span>{alurLabels[a]}</span>
                      <b>{s.by_alur[a] ?? 0}</b>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="cp-col-hd">Per Proyek</div>
                  {Object.entries(s.by_project)
                    .sort((x, y) => y[1] - x[1])
                    .map(([proj, n]) => (
                      <div className="cp-line" key={proj}>
                        <span>{proj}</span>
                        <b>{n}</b>
                      </div>
                    ))}
                </div>
              </div>

              {s.tabs_skipped.length > 0 && (
                <div className="cp-skipped">Tab dilewati: {s.tabs_skipped.join(", ")}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "grey" }) {
  return (
    <div className={`cp-stat ${tone ?? ""}`}>
      <div className="cp-stat-num">{value}</div>
      <div className="cp-stat-lbl">{label}</div>
    </div>
  );
}
