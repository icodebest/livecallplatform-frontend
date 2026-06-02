import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me().then(setUser).catch(() => logout()).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!user?.trial_expires_at) return undefined;
    const expiresAt = new Date(user.trial_expires_at).getTime();
    const ms = expiresAt - Date.now();
    if (ms <= 0) {
      logout();
      return undefined;
    }
    const timer = window.setTimeout(logout, ms);
    return () => window.clearTimeout(timer);
  }, [user?.trial_expires_at]);

  function applySession(data) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, loading, applySession, logout, authenticated: Boolean(token && user) }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
