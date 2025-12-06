
import DoctorsPage from "./DoctorsPage";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  createdAt: string;
  authenticated?: boolean;
};

export default function MainPage({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, alignItems: "center" }}>
          Welcome, {user.fullName}
        </h2>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #e6eefc",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <p style={{ marginTop: 0, color: "#475467" }}>
        Email: {user.email} — Role: {user.role}
      </p>

      {/* Doctors catalog */}
      <DoctorsPage />
    </div>
  );
}
