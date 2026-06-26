import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "../../models";
import {
  metaService,
  type MetaConnection,
  type MetaOAuthConfig,
} from "../../services/meta.service";

type Toast = { tone: "ok" | "err"; msg: string } | null;

export function MetaView({ user }: { user: User }) {
  const isKadep = user.role === "kadep";
  const canManage = user.role !== "viewer";

  const [config, setConfig] = useState<MetaOAuthConfig | null>(null);
  const [conns, setConns] = useState<MetaConnection[]>([]);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const flash = useCallback((t: Toast) => {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 3500);
  }, []);

  const reload = useCallback(() => {
    Promise.all([metaService.getConfig(), metaService.listConnections()])
      .then(([c, list]) => {
        setConfig(c);
        setConns(list);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(reload, [reload]);

  // Listen for the OAuth popup result.
  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data as { source?: string; status?: string; detail?: string };
      if (!d || d.source !== "meta-oauth") return;
      if (d.status === "connected") {
        flash({ tone: "ok", msg: `Akun Meta terhubung${d.detail ? `: ${d.detail}` : ""}.` });
        reload();
      } else {
        flash({ tone: "err", msg: d.detail || "Gagal menghubungkan akun Meta." });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [flash, reload]);

  const connect = () => {
    if (!config?.configured) {
      flash({ tone: "err", msg: "Lengkapi App ID & App Secret dulu." });
      return;
    }
    const w = 600;
    const h = 720;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    popupRef.current = window.open(
      metaService.loginUrl(),
      "meta-oauth",
      `width=${w},height=${h},left=${left},top=${top}`,
    );
  };

  const activate = async (id: number) => {
    setBusy(true);
    try {
      setConns(await metaService.activate(id));
      flash({ tone: "ok", msg: "Akun aktif diganti." });
    } catch (e) {
      flash({ tone: "err", msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (c: MetaConnection) => {
    if (!confirm(`Putuskan koneksi "${c.label || c.meta_user_name}"?`)) return;
    setBusy(true);
    try {
      setConns(await metaService.disconnect(c.id));
      flash({ tone: "ok", msg: "Koneksi diputus." });
    } catch (e) {
      flash({ tone: "err", msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const active = conns.find((c) => c.is_active);

  return (
    <div className="view meta-view">
      {toast && <div className={`meta-toast ${toast.tone}`}>{toast.msg}</div>}
      {err && <div className="empty-note error">{err}</div>}

      <div className="metric-row">
        <div className={`metric ${config?.configured ? "ok" : ""}`}>
          <div className="metric-label">Meta App</div>
          <div className="metric-value">{config?.configured ? "Siap" : "Belum"}</div>
          <div className="metric-sub">{config?.app_id ? `App ID ${config.app_id}` : "App ID & Secret belum diisi"}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Akun Terhubung</div>
          <div className="metric-value">{conns.length}</div>
          <div className="metric-sub">multi-akun didukung</div>
        </div>
        <div className={`metric ${active ? "ok" : ""}`}>
          <div className="metric-label">Akun Aktif</div>
          <div className="metric-value" style={{ fontSize: active ? 22 : undefined }}>
            {active ? active.label || active.meta_user_name : "—"}
          </div>
          <div className="metric-sub">sumber data Ads / WA / IG</div>
        </div>
      </div>

      <div className="panel-grid meta-grid">
        {/* Connected accounts */}
        <div className="panel">
          <div className="panel-hd">
            <span className="ptitle">Akun Meta Terhubung</span>
            <span className="pspacer" />
            {canManage && (
              <button className="meta-btn primary" onClick={connect} disabled={busy}>
                + Hubungkan Akun
              </button>
            )}
          </div>
          <div className="panel-bd scroll">
            {conns.length === 0 ? (
              <div className="empty-note">
                Belum ada akun. {canManage ? "Klik “Hubungkan Akun” untuk login lewat Facebook." : "Hubungi admin untuk menghubungkan akun."}
              </div>
            ) : (
              <div className="meta-conn-list">
                {conns.map((c) => (
                  <ConnectionRow
                    key={c.id}
                    conn={c}
                    canManage={canManage}
                    busy={busy}
                    onActivate={() => activate(c.id)}
                    onDisconnect={() => disconnect(c)}
                    onSaved={setConns}
                    flash={flash}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* App config */}
        <div className="panel">
          <div className="panel-hd">
            <span className="ptitle">Konfigurasi Meta App (OAuth)</span>
          </div>
          <div className="panel-bd scroll">
            {config && <ConfigForm config={config} canEdit={isKadep} onSaved={setConfig} flash={flash} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionRow({
  conn,
  canManage,
  busy,
  onActivate,
  onDisconnect,
  onSaved,
  flash,
}: {
  conn: MetaConnection;
  canManage: boolean;
  busy: boolean;
  onActivate: () => void;
  onDisconnect: () => void;
  onSaved: (c: MetaConnection[]) => void;
  flash: (t: Toast) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [label, setLabel] = useState(conn.label);
  const [adAccount, setAdAccount] = useState(conn.ad_account_id);
  const [saving, setSaving] = useState(false);

  const expired = conn.token_expires_at ? new Date(conn.token_expires_at) < new Date() : false;

  const save = async () => {
    setSaving(true);
    try {
      onSaved(await metaService.update(conn.id, { label, ad_account_id: adAccount }));
      setEdit(false);
      flash({ tone: "ok", msg: "Akun diperbarui." });
    } catch (e) {
      flash({ tone: "err", msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`meta-conn ${conn.is_active ? "on" : ""}`}>
      <div className="mc-main">
        <div className="mc-top">
          <span className="mc-name">{conn.label || conn.meta_user_name}</span>
          {conn.is_active && <span className="mc-badge active">AKTIF</span>}
          {expired && <span className="mc-badge warn">TOKEN KADALUARSA</span>}
        </div>
        <div className="mc-sub">
          {conn.meta_user_name} · ID {conn.meta_user_id}
          {conn.ad_account_id ? ` · act_${conn.ad_account_id}` : " · akun iklan otomatis"}
        </div>
        {edit && (
          <div className="mc-edit">
            <label>
              Label
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nama tampilan" />
            </label>
            <label>
              Pin Ad Account ID
              <input value={adAccount} onChange={(e) => setAdAccount(e.target.value)} placeholder="cth. 108683553290578 (opsional)" />
            </label>
          </div>
        )}
      </div>
      {canManage && (
        <div className="mc-actions">
          {!conn.is_active && (
            <button className="meta-btn" onClick={onActivate} disabled={busy}>
              Jadikan Aktif
            </button>
          )}
          {edit ? (
            <>
              <button className="meta-btn primary" onClick={save} disabled={saving}>
                Simpan
              </button>
              <button className="meta-btn ghost" onClick={() => setEdit(false)} disabled={saving}>
                Batal
              </button>
            </>
          ) : (
            <button className="meta-btn ghost" onClick={() => setEdit(true)}>
              Edit
            </button>
          )}
          <button className="meta-btn danger" onClick={onDisconnect} disabled={busy}>
            Putuskan
          </button>
        </div>
      )}
    </div>
  );
}

function ConfigForm({
  config,
  canEdit,
  onSaved,
  flash,
}: {
  config: MetaOAuthConfig;
  canEdit: boolean;
  onSaved: (c: MetaOAuthConfig) => void;
  flash: (t: Toast) => void;
}) {
  const [appId, setAppId] = useState(config.app_id);
  const [appSecret, setAppSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState(config.redirect_uri);
  const [scopes, setScopes] = useState(config.scopes);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const next = await metaService.saveConfig({
        app_id: appId,
        app_secret: appSecret || undefined,
        redirect_uri: redirectUri,
        scopes,
      });
      onSaved(next);
      setAppSecret("");
      flash({ tone: "ok", msg: "Konfigurasi disimpan." });
    } catch (e) {
      flash({ tone: "err", msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  const copyRedirect = () => {
    navigator.clipboard?.writeText(config.redirect_uri);
    flash({ tone: "ok", msg: "Redirect URI disalin." });
  };

  return (
    <div className="meta-config">
      <p className="meta-hint">
        Daftarkan satu Meta App di{" "}
        <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer">
          developers.facebook.com
        </a>
        , tambahkan produk <b>Facebook Login</b>, lalu daftarkan Redirect URI di bawah ke
        <i> Valid OAuth Redirect URIs</i>.
      </p>

      <label className="meta-field">
        <span>App ID</span>
        <input value={appId} onChange={(e) => setAppId(e.target.value)} disabled={!canEdit} placeholder="cth. 123456789012345" />
      </label>

      <label className="meta-field">
        <span>App Secret {config.has_secret && <em>(tersimpan — kosongkan jika tak diubah)</em>}</span>
        <input
          type="password"
          value={appSecret}
          onChange={(e) => setAppSecret(e.target.value)}
          disabled={!canEdit}
          placeholder={config.has_secret ? "••••••••" : "App Secret"}
        />
      </label>

      <label className="meta-field">
        <span>Redirect URI (callback)</span>
        <div className="meta-inline">
          <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} disabled={!canEdit} />
          <button className="meta-btn ghost" type="button" onClick={copyRedirect}>
            Salin
          </button>
        </div>
      </label>

      <label className="meta-field">
        <span>Scopes (izin Graph, pisahkan koma)</span>
        <input value={scopes} onChange={(e) => setScopes(e.target.value)} disabled={!canEdit} />
      </label>

      {canEdit ? (
        <button className="meta-btn primary wide" onClick={save} disabled={saving}>
          {saving ? "Menyimpan…" : "Simpan Konfigurasi"}
        </button>
      ) : (
        <p className="meta-hint muted">Hanya Kepala Departemen yang dapat mengubah konfigurasi App.</p>
      )}
    </div>
  );
}
