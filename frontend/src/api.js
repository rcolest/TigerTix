const API_BASE = process.env.REACT_APP_API_URL;

export const api = {
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify(body),
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify(body),
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }),

  logout: () =>
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include"
    }),

  getEvents: () =>
    fetch(`${API_BASE}/auth/api/events`, {
      credentials: "include"
    })
};
