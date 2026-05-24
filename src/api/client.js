import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

export const callsApi = {
  list: () => api.get("/calls").then((res) => res.data),
  get: (id) => api.get(`/calls/${id}`).then((res) => res.data),
  create: (payload) => api.post("/calls/outbound", payload).then((res) => res.data)
};

export const appointmentsApi = {
  list: () => api.get("/appointments").then((res) => res.data),
  create: (payload) => api.post("/appointments", payload).then((res) => res.data),
  patch: (id, payload) => api.patch(`/appointments/${id}`, payload).then((res) => res.data)
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats").then((res) => res.data)
};
