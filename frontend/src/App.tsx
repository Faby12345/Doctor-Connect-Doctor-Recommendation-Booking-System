// App.tsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import LoginPage from "./login";
import RegisterPage from "./register";
import MainPage from "./MainPage";
import DoctorsPage from "./DoctorsPage";
import DoctorProfileRoute from "./DoctorProfile/DoctorProfileRoute";
//import DoctorProfile_outside from "./DoctorProfile/DoctorProfilePage_outside"; // if still used elsewhere
import Dock from "./components/Dock";
import { useAuth } from "./AuthContext";
import {
  VscHome,
  VscArchive,
  VscAccount,
  VscSettingsGear,
} from "react-icons/vsc";

import MePage from "./UserProfile/MePage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function App() {
  const { user, setUser, loading } = useAuth(); // ✅ from context
  const navigate = useNavigate();

  const items = [
    {
      icon: <VscHome size={27} />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      icon: <VscArchive size={27} />,
      label: "Doctors",
      onClick: () => navigate("/doctors"),
    },
    {
      icon: <VscAccount size={27} />,
      label: "Profile",
      onClick: () => navigate("/me"),
    },
    {
      icon: <VscSettingsGear size={27} />,
      label: "Settings",
      onClick: () => alert("Settings"),
    },
  ];

  async function handleLogout() {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/");
  }

  // Boot screen while AuthContext loads /api/auth/me
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
      <>
        {/* Show Dock only when logged in */}
        {user && (
            <Dock
                items={items}
                panelHeight={75}
                baseItemSize={70}
                magnification={90}
            />
        )}

        <Routes>
          {/* Public routes (when not logged in) */}
          {!user ? (
              <>
                <Route
                    path="/register"
                    element={
                      <RegisterPage
                          onRegister={async (vals) => {
                            const res = await fetch(`${API_URL}/api/auth/register`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              credentials: "include",
                              body: JSON.stringify(vals),
                            });
                            if (!res.ok) throw new Error(await res.text());
                            navigate("/");
                          }}
                          onNavigateToLogin={() => navigate("/")}
                      />
                    }
                />
                <Route
                    path="/"
                    element={
                      <LoginPage
                          onNavigateToRegister={() => navigate("/register")}
                          onLoginSuccess={(u) => {
                            setUser(u);
                            if (u.role === "DOCTOR") navigate("/doctors");
                            else navigate("/");
                          }}
                      />
                    }
                />
              </>
          ) : (
              <>
                {/* Private/main area when logged in */}
                <Route
                    path="/"
                    element={<MainPage user={user} onLogout={handleLogout} />}
                />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctor/:id" element={<DoctorProfileRoute />} />

                {/* ✅ /me now handled by MePage (doctor/patient/admin) */}
                <Route path="/me" element={<MePage />} />
              </>
          )}

          {/* Fallback */}
          <Route
              path="*"
              element={<div style={{ padding: 24 }}>Not found</div>}
          />
        </Routes>
      </>
  );
}
