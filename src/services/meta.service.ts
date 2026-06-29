import { api, tokenStore } from "./api";

// OAuth app config (App ID / Secret are set once from the UI; the secret is
// write-only and never returned).
export interface MetaOAuthConfig {
  app_id: string;
  redirect_uri: string;
  api_version: string;
  scopes: string;
  has_secret: boolean;
  configured: boolean;
  connections: number;
}

// One connected Meta account. The access token lives server-side only.
export interface MetaConnection {
  id: number;
  label: string;
  meta_user_id: string;
  meta_user_name: string;
  token_expires_at: string | null;
  business_id: string;
  ad_account_id: string;
  scopes: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface SaveConfigInput {
  app_id?: string;
  app_secret?: string;
  redirect_uri?: string;
  api_version?: string;
  scopes?: string;
}

export interface UpdateConnectionInput {
  label?: string;
  ad_account_id?: string;
  business_id?: string;
}

// Absolute backend origin — the OAuth popup is a top-level navigation, so it
// can't go through the axios same-origin relative base.
const API_ORIGIN =
  (((import.meta.env.VITE_API_BASE as string | undefined) ?? "").replace(/\/$/, "")) ||
  window.location.origin;

export const metaService = {
  getConfig: () => api.get<MetaOAuthConfig>("/meta/oauth/config").then((r) => r.data),

  saveConfig: (body: SaveConfigInput) =>
    api.put<MetaOAuthConfig>("/meta/oauth/config", body).then((r) => r.data),

  listConnections: () =>
    api.get<{ connections: MetaConnection[]; count: number }>("/meta/connections").then((r) => r.data.connections),

  activate: (id: number) =>
    api.post<{ connections: MetaConnection[] }>(`/meta/connections/${id}/activate`).then((r) => r.data.connections),

  update: (id: number, body: UpdateConnectionInput) =>
    api.patch<{ connections: MetaConnection[] }>(`/meta/connections/${id}`, body).then((r) => r.data.connections),

  disconnect: (id: number) =>
    api.delete<{ connections: MetaConnection[] }>(`/meta/connections/${id}`).then((r) => r.data.connections),

  // Tempel token manual (mis. System User token) — tanpa popup OAuth / redirect
  // URI. Backend memvalidasi token, menyimpannya, dan menjadikannya akun aktif.
  connectManual: (accessToken: string, label?: string) =>
    api
      .post<{ connections: MetaConnection[] }>("/meta/connections/manual", { access_token: accessToken, label })
      .then((r) => r.data.connections),

  // URL for the OAuth popup. The token is passed as a query param because a
  // popup navigation can't set an Authorization header (same pattern as /ws).
  loginUrl: () =>
    `${API_ORIGIN}/api/meta/oauth/login?token=${encodeURIComponent(tokenStore.get() ?? "")}`,
};
