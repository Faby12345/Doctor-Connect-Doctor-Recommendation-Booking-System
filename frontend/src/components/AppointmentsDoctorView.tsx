import React, { useEffect, useState } from "react";
import { useAuth } from "../Authentification Context/AuthContext.tsx";

type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function AppointmentsDoctorView() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  //const [acceptAppointment, setAcceptAppointment] = useState<true | false>(false);

  if (authLoading) return <div style={{ padding: 16 }}>Loading user…</div>;
  if (!user || user.role !== "DOCTOR") return null;
  const doctorId = user.id;

  async function fetchAppointments(id: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/doctor/${encodeURIComponent(id)}`,
        { credentials: "include" }
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

  if (loading) {
    return <div style={{ padding: 16 }}>Loading appointments…</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 16, color: "crimson" }}>
        Error: {err}{" "}
        <button
          onClick={() => fetchAppointments(doctorId)}
          style={btnLinkStyle}
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          Your Appointments
        </div>
        <div style={{ color: "#666" }}>No appointments found.</div>
        <button
          onClick={() => fetchAppointments(doctorId)}
          style={{ ...btnBase, marginTop: 12 }}
        >
          Refresh
        </button>
      </div>
    );
  }

  async function acceptAppointmentHandle(id: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
          `${API_URL}/api/appointments/${encodeURIComponent(id)}/confirm`,
          {
            credentials: "include",
            method: "PUT",
          }
      );
      if(!res.ok) throw new Error(await res.text());
      //setAcceptAppointment(true);
    }
    catch (e: any) {
      setErr(e?.message ?? "Failed to accept appointment");
    } finally {
      setLoading(false);
    }
  }

  async function completAppointmentHandle(id: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
          `${API_URL}/api/appointments/${encodeURIComponent(id)}/completed`,
          {
            credentials: "include",
            method: "PUT",
          }
      );
      if(!res.ok) throw new Error(await res.text());
      //setAcceptAppointment(true);
    }
    catch (e: any) {
      setErr(e?.message ?? "Failed to accept appointment");
    } finally {
      setLoading(false);
    }
  }

  async function rejectAppointmentHandle(id: string) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(
          `${API_URL}/api/appointments/${encodeURIComponent(id)}/reject`,
          {
            credentials: "include",
            method: "PUT",
          }
      );
      if(!res.ok) throw new Error(await res.text());
      //setAcceptAppointment(true);
    }
    catch (e: any) {
      setErr(e?.message ?? "Failed to reject the appointment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>Your Appointments</div>

      {items.map((a) => {
        const iso = `${a.date}T${
          a.time.length === 5 ? a.time + ":00" : a.time
        }`;
        const parsed = new Date(iso);
        const formatted = isNaN(parsed.getTime())
          ? `${a.date} ${a.time}`
          : parsed.toLocaleString();

        return (
          <div key={a.id} style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{formatted}</div>
                <div style={{ marginTop: 4, color: "#555" }}>
                  Patient ID: {a.patientId}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#777" }}>
                  Appointment ID: {a.id}
                </div>
              </div>
              <div>
                <span style={pillStyle}>{a.status}</span>
              </div>
              <div>
                <button onClick={() => {
                  if (a.status === "CONFIRMED") {
                    alert("Already confirmed");
                    return
                  }
                  acceptAppointmentHandle(a.id)
                  a.status = "CONFIRMED";
                  //setAcceptAppointment(false);
                }} style={btnBase}>Accept
                </button>
              </div>
              <div>
                <button onClick={() => {
                  if (a.status === "REJECTED") {
                    alert("Already rejected");
                    return;
                  }

                  rejectAppointmentHandle(a.id)
                  a.status = "REJECTED";
                  //setAcceptAppointment(false);
                }} style={btnBase}>Reject
                </button>
              </div>

              <div>
                <button onClick={() => {
                  if (a.status === "COMPLETED") {
                    alert("Already completed");
                    return;
                  }

                  completAppointmentHandle(a.id)
                  a.status = "COMPLETED";
                  //setAcceptAppointment(false);
                }} style={btnBase}>Mark as Completed
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div>
        <button onClick={() => fetchAppointments(doctorId)} style={btnBase}>
          Refresh
        </button>
      </div>
    </div>
  );
}

/* styles */
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
};
const btnLinkStyle: React.CSSProperties = {
  ...btnBase,
  padding: "2px 6px",
  background: "transparent",
  border: "none",
  textDecoration: "underline",
};
const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  background: "#f3f4f6",
  fontSize: 12,
};
