import { useCallback, useEffect, useRef, useState } from "react";
import type { User, WorkItem, Warning } from "../models";
import { useAuth } from "../context/AuthContext";
import { workItemService } from "../services/workitem.service";
import { dashboardService } from "../services/dashboard.service";
import { RingkasanView } from "./views/RingkasanView";
import { AlurKerjaView } from "./views/AlurKerjaView";
import { TugasSayaView } from "./views/TugasSayaView";
import { MetaView } from "./views/MetaView";
import { AdsView, WhatsAppView, InstagramView } from "./views/meta/MetaViews";

type Tab = "ringkasan" | "alur" | "tugas" | "ads" | "whatsapp" | "instagram" | "meta";

const roleLabel: Record<string, string> = {
  kadep: "Kepala Departemen",
  staff: "Tim Marketing",
  viewer: "Viewer",
};

/** Scale the fixed 1920×1080 canvas to fit the viewport (war-room display). */
function useScale(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      el.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [ref]);
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const t = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const d = now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="clock">
      <div className="t">{t}</div>
      <div className="d">{d}</div>
    </div>
  );
}

export function DesktopShell({ user }: { user: User }) {
  const { logout } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  useScale(canvasRef);

  const [tab, setTab] = useState<Tab>(user.role === "kadep" ? "ringkasan" : "tugas");
  const [items, setItems] = useState<WorkItem[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [err, setErr] = useState("");

  const reload = useCallback(() => {
    Promise.all([workItemService.list(), dashboardService.warnings()])
      .then(([list, w]) => {
        setItems(list);
        setWarnings(w.warnings);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(reload, [reload]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "ringkasan", label: "Ringkasan" },
    { key: "alur", label: "Alur Kerja" },
    { key: "tugas", label: "Tugas Saya" },
    { key: "ads", label: "Iklan (Ads)" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "instagram", label: "Instagram" },
    { key: "meta", label: "Akun Meta" },
  ];

  return (
    <div id="stage">
      <div id="canvas" ref={canvasRef}>
        <header className="hdr">
          <div className="hdr-logo"><span>GP</span></div>
          <div className="hdr-titles">
            <h1>Alur Kerja Marketing</h1>
            <div className="sub">Greenpark Group · Departemen Marketing</div>
            <div className="tag">IKLAN BERBAYAR · KONTEN ORGANIK · LEAD</div>
          </div>
          <div className="hdr-spacer" />
          <div className="hdr-meta">
            <div className="badge-target">
              {items.length}
              <small>KONTEN</small>
            </div>
            <Clock />
            <div className="hdr-user">
              <div className="hu-name">{user.position || user.name}</div>
              <div className="hu-role">{roleLabel[user.role] ?? user.role}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Keluar">
              ✕
            </button>
          </div>
        </header>

        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="content">
          {err && <div className="empty-note error">{err}</div>}
          {tab === "ringkasan" && <RingkasanView items={items} warnings={warnings} />}
          {tab === "alur" && <AlurKerjaView items={items} canEdit={user.role !== "viewer"} onChanged={reload} />}
          {tab === "tugas" && <TugasSayaView user={user} canEdit={user.role !== "viewer"} onChanged={reload} />}
          {tab === "ads" && <AdsView />}
          {tab === "whatsapp" && <WhatsAppView />}
          {tab === "instagram" && <InstagramView />}
          {tab === "meta" && <MetaView user={user} />}
        </main>
      </div>
    </div>
  );
}
