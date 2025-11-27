// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

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
  loading: boolean; // ✅ add this
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // ✅ add this
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as AuthUser;
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false); // ✅ done booting
      }
    }
    loadUser();
  }, [API_URL]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
