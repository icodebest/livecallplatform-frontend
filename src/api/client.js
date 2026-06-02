import axios from "axios";

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function ensureJsonObject(data, message) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(message);
  }
  return data;
}

function authSession(data) {
  const session = ensureJsonObject(data, "The auth API did not return JSON. Check VITE_API_URL and backend /api routing.");
  if (!session.access_token || !session.user) {
    throw new Error("The auth API did not return a valid session.");
  }
  return session;
}

function apiMessage(data) {
  return ensureJsonObject(data, "The auth API did not return JSON. Check VITE_API_URL and backend /api routing.");
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:8000");
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");
export const TOKEN_KEY = "maya_access_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload).then((res) => apiMessage(res.data)),
  verify: (payload) => api.post("/auth/verify", payload).then((res) => authSession(res.data)),
  login: (payload) => api.post("/auth/login", payload).then((res) => authSession(res.data)),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload).then((res) => apiMessage(res.data)),
  resetPassword: (payload) => api.post("/auth/reset-password", payload).then((res) => apiMessage(res.data)),
  me: () => api.get("/auth/me").then((res) => res.data)
};

export const sessionsApi = {
  list: () => api.get("/sessions").then((res) => res.data),
  get: (id) => api.get(`/sessions/${id}`).then((res) => res.data),
  create: (payload) => api.post("/sessions", payload).then((res) => res.data)
};

export const appointmentsApi = {
  list: () => api.get("/appointments").then((res) => res.data),
  create: (payload) => api.post("/appointments", payload).then((res) => res.data),
  patch: (id, payload) => api.patch(`/appointments/${id}`, payload).then((res) => res.data)
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats").then((res) => res.data)
};

export function voiceSocketUrl(sessionId) {
  const token = encodeURIComponent(localStorage.getItem(TOKEN_KEY) || "");
  return `${WS_BASE_URL}/ws/sessions/${sessionId}/voice?token=${token}`;
}

export function monitorSocketPath(sessionId) {
  const token = encodeURIComponent(localStorage.getItem(TOKEN_KEY) || "");
  return `/ws/sessions/${sessionId}/monitor?token=${token}`;
}
