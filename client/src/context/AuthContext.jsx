import { createContext, useContext, useMemo, useState } from "react";
import { clearStoredSession, getStoredToken, getStoredUser, isTokenExpired, saveSession } from "../services/authStorage";

const AuthContext = createContext(null);

const initialSession = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user || isTokenExpired(token)) {
    clearStoredSession();
    return { token: null, user: null };
  }
  return { token, user };
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(initialSession);
  const value = useMemo(() => ({
    ...session,
    isAuthenticated: Boolean(session.token && session.user),
    login: (payload) => { saveSession(payload); setSession(payload); },
    logout: () => { clearStoredSession(); setSession({ token: null, user: null }); },
  }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
