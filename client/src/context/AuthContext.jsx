import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginRequest, registerRequest, logoutRequest, getMeRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await getMeRequest();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await loginRequest(credentials);
    if (data.token) localStorage.setItem("bloom_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    if (data.token) localStorage.setItem("bloom_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      localStorage.removeItem("bloom_token");
      setUser(null);
    }
  };

  const updateLocalUser = (patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateLocalUser, refresh: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Small context module; co-locating the hook keeps imports simple for an
// app this size and has no runtime effect outside of dev fast-refresh.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
