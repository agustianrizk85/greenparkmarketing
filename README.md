# Marketing Frontend — Greenpark

> **Aplikasi utama saat ini: Alur Kerja Departemen Marketing** (`src/AppRouter.tsx`,
> `pages/`, `services/`, `models/`, `context/`) — mengikuti pola `greenparkpermit`.
> Backend: `greenparkmarketingbee` (Go, default `http://localhost:8086`).
> Login: `kadep@greenpark.id` / `staff@greenpark.id`. Set `VITE_API_BASE` di `.env`.
>
> Empat alur (A Iklan Hardsell · B Iklan Video · C Organik Carousel · D Organik
> Reels) di-seed otomatis saat membuat konten/campaign baru. Tiap langkah punya
> PIC, phase, gate approval Kadep, budget iklan, dan SLA.
>
> Dashboard "Control Tower" lama (`src/App.tsx` + `components/panels.tsx`, dll.)
> **masih tersimpan** namun bukan lagi entry point.

---

## (Lama) Qualified Demand Control Tower

React + TypeScript (Vite) dashboard for the **Marketing** war-room. It renders
the **Command Bento** layout — the full demand funnel, North Star KPI ribbon,
channel & project performance, lead quality, MQL→SAL handover, digital asset
registry, content/winning campaigns, the CEO command panel and the alert system
— scaled to a fixed 1920×1080 canvas. Data comes from the Go backend
(`backend/marketing`) over an authenticated REST API.

## Architecture

```
src/
  main.tsx            mount point
  App.tsx             auth gating → scaled stage → bento grid → drilldown modal
  styles.css          full dashboard stylesheet (design tokens + bento layout)
  types.ts            TS mirror of the backend JSON contract
  api/client.ts       fetch wrapper (bearer token, 401 → re-login)
  hooks/              useAuth · useDashboard · useScale
  lib/                format (rp/num/pct/fmtFunnel) · status colour maps
  components/         Login · Header · Kpi · Funnel · panels · Modal · ui primitives
```

## Run

```bash
cd frontend/marketing
npm install
npm run dev
# Vite dev server (default port 5177); set VITE_PORT / VITE_API_BASE in .env
```

Make sure the backend is running first (`cd backend/marketing && go run ./cmd/server`,
default `http://localhost:8086`).

Demo accounts: **admin / admin123** (master data) · **viewer / viewer123** (read-only).

## Configuration

| Variable         | Default                  | Description                                  |
| ---------------- | ------------------------ | -------------------------------------------- |
| `VITE_PORT`      | `5177`                   | Dev/preview server port (empty = dynamic)    |
| `VITE_API_BASE`  | `http://localhost:8086`  | Backend base URL (empty in prod → `/api`)    |

## Build

```bash
npm run typecheck   # tsc --noEmit
npm run build       # tsc && vite build → dist/
```
