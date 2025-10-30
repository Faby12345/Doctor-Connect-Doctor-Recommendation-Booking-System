import React, { createContext, useContext, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type AuthContextType = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const API = "http://localhost:8080/api/auth/me";

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(API, { credentials: "include" });

        if (!res.ok) return null;
        const data = await res.json();

        setUser(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// helper hook so it's nice to use
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider />");
  }
  return ctx;
}
