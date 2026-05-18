"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest, type Role, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem("rain-tree-token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem("rain-tree-token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (payload) => {
        const data = await loginRequest(payload);
        window.localStorage.setItem("rain-tree-token", data.token);
        setToken(data.token);
        setUser(data.user);
      },
      logout: () => {
        window.localStorage.removeItem("rain-tree-token");
        setToken(null);
        setUser(null);
      },
      hasRole: (...roles) => Boolean(user && roles.includes(user.role))
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
