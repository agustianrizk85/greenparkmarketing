// Domain types mirroring the Go backend JSON contract (see backend/marketing).
// Funnel/channel volumes are raw counts; monetary values are in Rupiah.

/** Traffic-light health indicator used by KPIs and the handover panel. */
export type Status = "good" | "warn" | "bad";

/** Channel decision status. */
export type ChannelStatus = "scale" | "optimize" | "pause" | "test";

/** Command-panel row status. */
export type CommandStatus = "open" | "progress" | "done";

export interface Context {
  period: string;
  updated: string;
  goal: number;
  bookingYTD: number;
  completeness: number;
}

export interface FunnelStage {
  _id: string;
  key: string;
  value: number;
  owner: string;
}

export interface KPI {
  _id: string;
  id: string;
  label: string;
  value: string;
  suffix?: string;
  target: string;
  gap: string;
  trend: number[];
  status: Status;
  note: string;
}

export interface LeadBreakdown {
  label: string;
  value: number;
  color: "hot" | "warm" | "nurture" | "low";
}

export interface LeadStat {
  label: string;
  value: string;
}

export interface LeadQuality {
  breakdown: LeadBreakdown[];
  stats: LeadStat[];
  topSource: string;
  bottomSource: string;
  topProject: string;
  bottomProject: string;
}

export interface HandoverItem {
  _id: string;
  label: string;
  value: string;
  status: Status;
}

export interface Channel {
  _id: string;
  name: string;
  group: string;
  spend: number;
  leads: number;
  mql: number;
  cpl: number;
  cpql: number;
  roi: string;
  status: ChannelStatus;
}

export interface Project {
  _id: string;
  name: string;
  ig: string;
  demand: number;
  readiness: number;
  leads: number;
  mql: number;
  booking: number;
}

export interface Asset {
  _id: string;
  type: string;
  handle: string;
  health: number;
  active: boolean;
  note: string;
}

export interface IGAccount {
  _id: string;
  handle: string;
  health: number;
  active: boolean;
  days: number;
}

export interface WinningCampaign {
  name: string;
  project: string;
  channel: string;
  criteria: number;
  cpl: string;
  mql: string;
  booking: number;
}

export interface ContentHighlight {
  name: string;
  account: string;
  metric: string;
}

export interface Content {
  winning: WinningCampaign[];
  best: ContentHighlight;
  worst: ContentHighlight;
  rework: number;
  pause: number;
}

export interface Command {
  _id: string;
  issue: string;
  cause: string;
  impact: string;
  command: string;
  pic: string;
  deadline: string;
  expected: string;
  status: CommandStatus;
}

export interface Alerts {
  red: string[];
  yellow: string[];
  green: string[];
}

export interface ReasonCode {
  _id: string;
  code: string;
  layer: string;
  label: string;
  count: number;
}

export interface Summary {
  goal: number;
  bookingYTD: number;
  progress: number;
  totalLeads: number;
  totalMQL: number;
  totalSpend: number;
  totalBooking: number;
  redAlerts: number;
  openCommands: number;
}

/** Full payload returned by GET /api/dashboard. */
export interface Dashboard {
  context: Context;
  funnel: FunnelStage[];
  spend: number;
  kpis: KPI[];
  leadQuality: LeadQuality;
  handover: HandoverItem[];
  channels: Channel[];
  projects: Project[];
  assets: Asset[];
  igAccounts: IGAccount[];
  content: Content;
  commands: Command[];
  alerts: Alerts;
  reasonCodes: ReasonCode[];
  summary: Summary;
}

/** Authenticated account (mirrors backend domain.User, no password material). */
export interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "viewer";
}

/** Response of POST /api/auth/login. */
export interface LoginResponse {
  token: string;
  user: User;
}
