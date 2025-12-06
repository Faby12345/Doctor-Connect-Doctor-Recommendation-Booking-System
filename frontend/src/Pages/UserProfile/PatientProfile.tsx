import UserAppointments from "../../components/UserAppointments.tsx";
import { useAuth } from "../../Authentification Context/AuthContext.tsx";
import {useNavigate } from "react-router-dom";


export default function PatientProfile() {
    const { user, setUser} = useAuth();
    const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    const navigate = useNavigate();

    async function handleLogout() {

        await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
        navigate("/");
    }
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ margin: 0, alignItems: "center" }}>
                    Welcome, {user?.fullName}
                </h2>
                <div style={{ marginLeft: "auto" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            border: "1px solid #e6eefc",
                            cursor: "pointer",
                        }}
                    >
                        Log out
                    </button>
                </div>
            </div>
            <p style={{ marginTop: 0, color: "#475467" }}>
                Email: {user?.email} — Role: {user?.role}
            </p>
            <UserAppointments/>
        </div>
    );
}