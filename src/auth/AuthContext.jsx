import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiErrorMessage, authApi, TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);
const TIMEZONE_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/;
const SESSION_KEY = "maya_auth_session";

function parseUtcTimestamp(value) {
  if (!value) return Number.NaN;
  const timestamp = TIMEZONE_PATTERN.test(value) ? value : `${value}Z`;
  return new Date(timestamp).getTime();
}

function readStoredSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (stored?.access_token) return stored;
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
  const legacyToken = localStorage.getItem(TOKEN_KEY);
  return legacyToken ? { access_token: legacyToken, user: null } : null;
}

function persistSession(data) {
  const session = { access_token: data.access_token, user: data.user || null };
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [loading, setLoading] = useState(() => Boolean(readStoredSession()?.access_token && !readStoredSession()?.user));
  const [authError, setAuthError] = useState("");
  const token = session?.access_token || "";
  const user = session?.user || null;

  const applySession = useCallback((data) => {
    const nextSession = persistSession(data);
    setSession(nextSession);
    setAuthError("");
    setLoading(false);
    return nextSession;
  }, []);

  const logout = useCallback((reason = "") => {
    clearStoredSession();
    setSession(null);
    setAuthError(reason);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
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
        const hydrated = persistSession({ access_token: sessionToken, user: data });
        setSession(hydrated);
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
  }, [token, user, logout]);

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
  }, [user?.trial_expires_at, logout]);

  const value = useMemo(
    () => ({ token, user, loading, authError, applySession, logout, authenticated: Boolean(token) }),
    [token, user, loading, authError, applySession, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
