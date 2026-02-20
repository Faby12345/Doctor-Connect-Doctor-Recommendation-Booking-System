import React, { useEffect, useState } from "react";
import { useAuth } from "../Authentification Context/AuthContext.tsx";

type Appointment = {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  status: string;
  doctorName: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function AppointmentsDoctorView() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  if (authLoading) return <div style={{ padding: 16 }}>Loading user…</div>;
  if (!user || user.role !== "DOCTOR") return null;
  const doctorId = user.id;

  // --- 1. FETCH ---
  async function fetchAppointments(id: string) {
    setLoading(true);
    setErr(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
          `${API_URL}/api/appointments/doctor/${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as Appointment[];
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments(doctorId);
  }, [doctorId]);

  // --- 2. ACTIONS (Fixed) ---

  // Helper to update one item in the list without reloading everything
  const updateLocalStatus = (id: string, newStatus: string) => {
    setItems((currentItems) =>
        currentItems.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
        )
    );
  };

  async function handleStatusChange(id: string, newStatus: string, endpoint: string) {
    // Optimistic Update: Change UI immediately to feel fast
    const originalItems = [...items]; // Backup in case of error
    updateLocalStatus(id, newStatus);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
          `${API_URL}/api/appointments/${encodeURIComponent(id)}/${endpoint}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
      );

      if(!res.ok) throw new Error(await res.text());

      console.log(`Appointment ${newStatus} successfully!`);
      // No need to reload, we already updated the UI!

    } catch (e: any) {
      console.error(e);
      alert(`Failed to update status: ${e.message}`);
      setItems(originalItems); // Revert UI if server failed
    }
  }

  // --- 3. RENDER ---

  if (loading) return <div style={{ padding: 16 }}>Loading appointments…</div>;

  if (err) {
    return (
        <div style={{ padding: 16, color: "crimson" }}>
          Error: {err} <button onClick={() => fetchAppointments(doctorId)}>Retry</button>
        </div>
    );
  }

  if (items.length === 0) {
    return (
        <div style={cardStyle}>
          <div>Your Appointments</div>
          <div style={{ color: "#666" }}>No appointments found.</div>
          <button onClick={() => fetchAppointments(doctorId)}>Refresh</button>
        </div>
    );
  }

  return (
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Your Appointments</div>

        {items.map((a) => {
          // Safe Date Logic
          const iso = `${a.date}T${a.time.length === 5 ? a.time + ":00" : a.time}`;
          const parsed = new Date(iso);
          const formatted = isNaN(parsed.getTime()) ? `${a.date} ${a.time}` : parsed.toLocaleString();

          // Helper to check disabled state
          const isConfirmed = a.status === "CONFIRMED";
          const isRejected = a.status === "REJECTED";
          const isCompleted = a.status === "COMPLETED";

          return (
              <div key={a.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>

                  {/* Info Section */}
                  <div>
                    <div style={{ fontWeight: 600 }}>{formatted}</div>
                    <div style={{ marginTop: 4, color: "#555" }}>Patient ID: {a.patientId}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: "#777" }}>ID: {a.id}</div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    <span style={{...pillStyle, backgroundColor: getStatusColor(a.status)}}>{a.status}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>

                    {/* ACCEPT BUTTON */}
                    {!isConfirmed && !isCompleted && !isRejected && (
                        <button
                            onClick={() => handleStatusChange(a.id, "CONFIRMED", "confirm")}
                            style={{...btnBase, background: '#d1fae5', color: '#065f46'}}>
                          Accept
                        </button>
                    )}

                    {/* REJECT BUTTON */}
                    {!isRejected && !isCompleted && !isConfirmed && (
                        <button
                            onClick={() => handleStatusChange(a.id, "REJECTED", "reject")}
                            style={{...btnBase, background: '#fee2e2', color: '#991b1b'}}>
                          Reject
                        </button>
                    )}

                    {/* COMPLETE BUTTON (Only show if confirmed) */}
                    {isConfirmed && !isCompleted && (
                        <button
                            onClick={() => handleStatusChange(a.id, "COMPLETED", "completed")}
                            style={{...btnBase, background: '#dbeafe', color: '#1e40af'}}>
                          Mark Completed
                        </button>
                    )}

                  </div>
                </div>
              </div>
          );
        })}

        <div>
          <button onClick={() => fetchAppointments(doctorId)} style={btnBase}>Refresh List</button>
        </div>
      </div>
  );
}

// --- STYLES & HELPERS ---

const getStatusColor = (status: string) => {
  switch(status) {
    case 'CONFIRMED': return '#d1fae5'; // Green
    case 'REJECTED': return '#fee2e2'; // Red
    case 'COMPLETED': return '#dbeafe'; // Blue
    default: return '#f3f4f6'; // Grey
  }
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  background: "#fff",
};
const btnBase: React.CSSProperties = {
  borderRadius: 8,
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  cursor: "pointer",
  fontWeight: 500
};
const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  fontSize: 12,
  fontWeight: "bold"
};