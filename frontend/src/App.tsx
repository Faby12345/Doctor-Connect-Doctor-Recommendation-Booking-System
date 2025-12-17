import { Routes, Route, useNavigate } from "react-router-dom";

import LoginPage from "./Pages/login.tsx";
import RegisterPage from "./Pages/register";
import MainPage from "./Pages/MainPage";
import DoctorsPage from "./Pages/DoctorsPage";
import DoctorProfileRoute from "./Pages/DoctorProfile/DoctorProfileRoute";
import Dock from "./components/Dock";
import { useAuth } from "./Authentification Context/AuthContext.tsx";
import {
  VscHome,
  VscArchive,
  VscAccount,
  VscSettingsGear,
} from "react-icons/vsc";

import MePage from "./Pages/UserProfile/MePage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function App() {
  const { user, setUser, loading } = useAuth();
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

  if (loading) return <div className="p-6">Loading…</div>;

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
            <Route
              path="/"
              element={<MainPage user={user} onLogout={handleLogout} />}
            />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctor/:id" element={<DoctorProfileRoute />} />
            <Route path="/me" element={<MePage />} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </>
  );
}
