import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";

// Pages
import LoginPage from "./Pages/login.tsx";
import RegisterPage from "./Pages/register";
import AppointmentsHistoryPage from "./Pages/AppointmentsHistoryPage.tsx";
// import MainPage from "./Pages/MainPage"; // <-- Removing this if HomePagePatient replaces it
import DoctorsPage from "./Pages/DoctorsPage";
import DoctorProfileRoute from "./Pages/DoctorProfile/DoctorProfileRoute";
import MePage from "./Pages/UserProfile/MePage";
import HomePagePatient from "./Pages/HomePagePacient.tsx";
import AppointmentDetailsPage from "./Pages/AppointemntDetailsPage.tsx";
import Dock from "./components/Dock";
import { useAuth } from "./Authentification Context/AuthContext.tsx";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function App() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();

  // MENTOR TIP:
  // We use lowercase paths here to match standard web conventions.
  const items = [
    {
      icon: <VscHome size={27} />,
      label: "Home",
      onClick: () => navigate("/"), // Simply go to root!
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
      onClick: () => alert("Settings"), // Todo: Make a settings page
    },
  ];

  async function  handleLogout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
    // Always clear local state even if backend fails
    setUser(null);
    localStorage.removeItem("token"); // If you switched to token auth
    navigate("/");
  }

  if (loading) return <div className="p-6">Loading application...</div>;

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
          {/* === GUEST ROUTES (Not Logged In) === */}
          {!user ? (
              <>
                <Route
                    path="/"
                    element={
                      <LoginPage
                          onNavigateToRegister={() => navigate("/register")}
                          onLoginSuccess={(u) => {
                            setUser(u);
                            // MENTOR TIP:
                            // Navigate to root "/" for everyone.
                            // The "Authenticated Routes" section below decides WHICH page they see at "/"
                            navigate("/");
                          }}
                      />
                    }
                />
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
                {/* Catch-all: Redirect unknown guest URLs to Login */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
          ) : (
              /* === AUTHENTICATED ROUTES (Logged In) === */
              <>

                <Route
                    path="/"
                    element={
                      user.role === "DOCTOR" ? <DoctorsPage /> : <HomePagePatient />
                    }
                />
                <Route
                    path ="/appointment-details/:id"
                    element={ < AppointmentDetailsPage/>}

                />

                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctor/:id" element={<DoctorProfileRoute />} />
                <Route path="/me" element={<MePage />} />
                <Route path = "/appointments/history" element={<AppointmentsHistoryPage/>}/>
                {/* Catch-all: Redirect unknown auth URLs to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
          )}
        </Routes>
      </>
  );
}