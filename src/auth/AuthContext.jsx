import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiErrorMessage, authApi, TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);
const TIMEZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/;

function parseUtcTimestamp(value) {
  if (!value) return Number.NaN;
  const timestamp = TIMEZONE_PATTERN.test(value) ? value : `${value}Z`;
  return new Date(timestamp).getTime();
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (user) {
      setLoading(false);
      return;
    }
    const sessionToken = token;
    let cancelled = false;
    authApi.me(sessionToken)
      .then((data) => {
        if (cancelled || localStorage.getItem(TOKEN_KEY) !== sessionToken) return;
        setUser(data);
        setAuthError("");
      })
      .catch((err) => {
        if (cancelled || localStorage.getItem(TOKEN_KEY) !== sessionToken) return;
        logout(apiErrorMessage(err, "Your session expired. Please login again."));
      })
      .finally(() => {
        if (!cancelled && localStorage.getItem(TOKEN_KEY) === sessionToken) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  useEffect(() => {
    if (!user?.trial_expires_at) return undefined;
    const expiresAt = parseUtcTimestamp(user.trial_expires_at);
    const ms = expiresAt - Date.now();
    if (!Number.isFinite(ms)) return undefined;
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
    setAuthError("");
    setLoading(false);
  }

  function logout(reason = "") {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthError(reason);
    setLoading(false);
  }

  const value = useMemo(
    () => ({ token, user, loading, authError, applySession, logout, authenticated: Boolean(token) }),
    [token, user, loading, authError]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
