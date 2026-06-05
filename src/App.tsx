import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";
import { api } from "./api/client";
import { num } from "./lib/format";
import { useAuth } from "./hooks/useAuth";
import type { Auth } from "./hooks/useAuth";
import { useDashboard } from "./hooks/useDashboard";
import { useScale } from "./hooks/useScale";
import { Login } from "./components/Login";
import { Header } from "./components/Header";
import { KpiRibbon, KpiDrill } from "./components/Kpi";
import { FunnelTower, FunnelDrill } from "./components/Funnel";
import { Modal } from "./components/Modal";
import type { DrillData } from "./components/Modal";
import { Panel } from "./components/ui";
import { MasterData } from "./master/MasterData";
import {
  Alerts,
  ChannelDrill,
  ChannelMatrix,
  CommandPanel,
  ContentWinning,
  DigitalAssets,
  Handover,
  LeadQuality,
  ProjectDrill,
  ProjectMatrix,
} from "./components/panels";
import type { Dashboard } from "./types";

export function App() {
  const auth = useAuth();

  if (auth.status === "checking") {
    return (
      <Splash>
        <div className="spinner" />
        Memeriksa sesi…
      </Splash>
    );
  }
  if (auth.status === "anon") {
    return <Login onLogin={auth.login} />;
  }
  return <AuthedApp auth={auth} />;
}

function AuthedApp({ auth }: { auth: Auth }) {
  const [state, reload] = useDashboard(auth.expire);

  if (state.status === "loading") {
    return (
      <Splash>
        <div className="spinner" />
        Memuat data marketing…
      </Splash>
    );
  }
  if (state.status === "error") {
    return (
      <Splash tone="error">
        <div className="splash-title">Gagal memuat data</div>
        <div className="splash-msg">{state.error}</div>
        <div className="splash-msg">API: {api.base}</div>
        <button className="splash-btn" onClick={reload}>
          Coba lagi
        </button>
      </Splash>
    );
  }
  return <DashboardView D={state.data} auth={auth} reload={reload} />;
}

function Splash({ tone, children }: { tone?: "error"; children: ReactNode }) {
  return <div className={`splash ${tone ?? ""}`}>{children}</div>;
}

function DashboardView({ D, auth, reload }: { D: Dashboard; auth: Auth; reload: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  useScale(stageRef, canvasRef);

  const [drill, setDrill] = useState<DrillData | null>(null);
  const open = useCallback((d: DrillData) => setDrill(d), []);
  const [view, setView] = useState<"dash" | "admin">("dash");
  const isAdmin = auth.user?.role === "admin";

  if (view === "admin") {
    return (
      <>
        <div className="gp-chrome">
          <div className="gp-chrome-brand">
            <span className="gp-logo-mark sm" /> Greenpark · Marketing — Master Data
          </div>
          <div className="gp-chrome-mid">Input · Import Excel/CSV · Seed &amp; Hapus data</div>
          <div className="gp-chrome-right">
            <button className="gp-chrome-btn" onClick={() => { setView("dash"); reload(); }}>
              ← Dashboard
            </button>
            <span className="gp-chrome-user">
              {auth.user?.name}
              <small>{auth.user?.role}</small>
            </span>
            <button className="gp-chrome-btn" onClick={() => void auth.logout()}>
              Logout
            </button>
          </div>
        </div>
        <div className="gp-admin">
          <MasterData onChanged={reload} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="gp-chrome">
        <div className="gp-chrome-brand">
          <span className="gp-logo-mark sm" /> Greenpark · Marketing Control Tower
        </div>
        <div className="gp-chrome-mid">Command Bento · Eksekusi &amp; alert dominan</div>
        <div className="gp-chrome-right">
          <span className="gp-chrome-hint">Klik KPI · funnel · channel · project untuk drilldown</span>
          {isAdmin && (
            <button className="gp-chrome-btn" onClick={() => setView("admin")}>
              ⚙ Master Data
            </button>
          )}
          <span className="gp-chrome-user">
            {auth.user?.name}
            <small>{auth.user?.role}</small>
          </span>
          <button className="gp-chrome-btn" onClick={() => void auth.logout()}>
            Logout
          </button>
        </div>
      </div>

      <div className="gp-stage" ref={stageRef}>
        <div className="gp-canvas density-regular" ref={canvasRef}>
          <Header context={D.context} />
          <KpiRibbon kpis={D.kpis} onPick={(k) => open({ title: k.label, body: <KpiDrill k={k} /> })} />

          <div className="gp-grid gp-grid-c">
            <div className="gc-funnel">
              <Panel title="Full Funnel Control Tower" tag="Impression → Cash-In" accent="var(--accent)">
                <FunnelTower
                  funnel={D.funnel}
                  onPick={(st, i, cv) =>
                    open({
                      title: st.key + " · Funnel Stage",
                      body: <FunnelDrill funnel={D.funnel} stage={st} idx={i} conv={cv} />,
                    })
                  }
                />
              </Panel>
            </div>
            <div className="gc-command">
              <Panel title="CEO Command Panel" tag="Issue → PIC → Deadline" accent="var(--bad)">
                <CommandPanel commands={D.commands} />
              </Panel>
            </div>
            <div className="gc-alerts">
              <Panel title="Alert System" tag="Red · Yellow · Green" accent="var(--bad)">
                <Alerts alerts={D.alerts} />
              </Panel>
            </div>
            <div className="gc-channel">
              <Panel title="Channel Performance Matrix" tag="Scale · Optimize · Pause" accent="var(--accent)">
                <ChannelMatrix
                  channels={D.channels}
                  onPick={(ch) => open({ title: "Channel · " + ch.name, body: <ChannelDrill ch={ch} /> })}
                />
              </Panel>
            </div>
            <div className="gc-project">
              <Panel title="Project Demand & Readiness" tag="Demand × Readiness" accent="var(--gold)">
                <ProjectMatrix
                  projects={D.projects}
                  onPick={(p) => open({ title: "Project · " + p.name, body: <ProjectDrill p={p} /> })}
                />
              </Panel>
            </div>
            <div className="gc-lead">
              <Panel title="Lead Quality & MQL Scoring" tag={`${num(D.summary.totalLeads)} leads`} accent="var(--gold)">
                <LeadQuality lq={D.leadQuality} />
              </Panel>
            </div>
            <div className="gc-handover">
              <Panel title="MQL → SAL Handover" tag="Akuntabilitas" accent="var(--navy)">
                <Handover handover={D.handover} />
              </Panel>
            </div>
            <div className="gc-assets">
              <Panel title="Digital Asset Registry" tag="Web · IG · TikTok · YT · GBP" accent="var(--navy)">
                <DigitalAssets assets={D.assets} igAccounts={D.igAccounts} />
              </Panel>
            </div>
            <div className="gc-content">
              <Panel title="Content & Winning Campaign" tag="Evidence-based" accent="var(--accent)">
                <ContentWinning content={D.content} />
              </Panel>
            </div>
          </div>
        </div>
      </div>

      <Modal data={drill} onClose={() => setDrill(null)} />
    </>
  );
}
