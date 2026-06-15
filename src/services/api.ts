import axios from "axios";
import type { AxiosError } from "axios";

const TOKEN_KEY = "marketingflow_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Shared axios instance. VITE_API_BASE points at the Go backend origin
// (e.g. http://localhost:8086); empty in production → same-origin "/api".
const envBase = ((import.meta.env.VITE_API_BASE as string | undefined) ?? "").replace(/\/$/, "");
export const api = axios.create({
  baseURL: envBase ? `${envBase}/api` : "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalise API errors into Error messages and handle 401 globally.
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      if (location.pathname !== "/login") location.assign("/login");
    }
    const message = error.response?.data?.error || error.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);
