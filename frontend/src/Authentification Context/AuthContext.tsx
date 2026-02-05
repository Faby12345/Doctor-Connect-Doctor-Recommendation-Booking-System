import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  createdAt: string;
};

type AuthContextType = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

  const loadUser = useCallback(async () => {
    // 1. GET TOKEN: We assume your Login page saved it to localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        // 2. CHANGE: Remove credentials (cookies) and add Header
        // credentials: "include", <--- Remove this if switching to headers
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <--- The "Handshake"
        }
      });

      if (res.ok) {
        const data = (await res.json()) as AuthUser;
        setUser(data);
      } else {
        // If token is invalid (403), remove it so we don't keep retrying
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return (
      <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}