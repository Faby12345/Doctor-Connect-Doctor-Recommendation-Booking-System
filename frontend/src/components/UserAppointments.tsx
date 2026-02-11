import { useEffect, useState } from "react";
import { useAuth } from "../Authentification Context/AuthContext.tsx";
import RatingModal from "./RatingModalPopUp.tsx";

type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
};

type Review = {
  appointmentId: string;
  rating: number;
  comment: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function UserAppointments() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ratingForId, setRatingForId] = useState<string | null>(null);

  if (authLoading) return <div className="p-4">Loading user…</div>;
  if (!user || user.role !== "PATIENT") return null;

  const userId = user.id;

  async function fetchAppointments(id: string) {
    setLoading(true);
    setErr(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_URL}/api/appointments/patient/${encodeURIComponent(id)}`,

        { method: "GET",
          headers: {"Authorization": `Bearer ${token}`}
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
    fetchAppointments(userId);
  }, [userId]);

  if (loading) return <div className="p-4">Loading appointments…</div>;

  if (err) {
    return (
      <div className="p-4 text-red-600">
        Error: {err}{" "}
        <button
          onClick={() => fetchAppointments(userId)}
          className="ml-2 underline underline-offset-2 text-red-700 hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="mb-1 font-semibold">Your Appointments</div>
        <div className="text-gray-600">No appointments found.</div>

        <button
          onClick={() => fetchAppointments(userId)}
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 active:scale-[0.99]"
        >
          Refresh
        </button>
      </div>
    );
  }

  async function cancelAppointmentHandle(id: string) {
    setLoading(true);
    setErr(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_URL}/api/appointments/${encodeURIComponent(id)}/cancel`,
        {

          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        }
      );
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      setErr(e?.message ?? "Failed to accept appointment");
    } finally {
      setLoading(false);
    }
  }

  const handleReview = async (appId: string, r: number, c: string) => {
    const newReview: Review = {
      appointmentId: appId,
      rating: r,
      comment: c,
    };

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify(newReview),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add review");
    }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!ratingForId) return;
    await handleReview(ratingForId, rating, comment);
    setRatingForId(null);
  };

  const pillClass = (status: string) => {
    const base =
      "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium";
    switch (status) {
      case "COMPLETED":
        return `${base} border-green-200 bg-green-50 text-green-700`;
      case "CANCELLED":
        return `${base} border-red-200 bg-red-50 text-red-700`;
      case "PENDING":
        return `${base} border-yellow-200 bg-yellow-50 text-yellow-700`;
      default:
        return `${base} border-gray-200 bg-gray-100 text-gray-700`;
    }
  };

  const btnBase =
    "inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 active:scale-[0.99]";

  return (
    <div className="grid gap-3">
      <div className="text-lg font-bold">Your Appointments</div>

      {items.map((a) => {
        const iso = `${a.date}T${a.time.length === 5 ? a.time + ":00" : a.time}`;
        const parsed = new Date(iso);
        const formatted = isNaN(parsed.getTime())
          ? `${a.date} ${a.time}`
          : parsed.toLocaleString();

        return (
          <div
            key={a.id}
            className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold">{formatted}</div>
                <div className="mt-1 text-sm text-gray-600">
                  Patient ID: {a.patientId}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Appointment ID: {a.id}
                </div>
              </div>

              <div className="sm:pt-0">
                <span className={pillClass(a.status)}>{a.status}</span>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  className={btnBase}
                  onClick={() => {
                    if (a.status === "CANCELLED") {
                      alert("Already canceled");
                      return;
                    }
                    cancelAppointmentHandle(a.id);
                    a.status = "CANCELLED";
                  }}
                >
                  CANCEL
                </button>

                <button
                  className={btnBase}
                  onClick={() => {
                    if (a.status === "COMPLETED") {
                      setRatingForId(a.id);
                    } else {
                      alert(
                        "You have not completed the appointment yet. Please complete it first to rate the doctor."
                      );
                    }
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <RatingModal
        isOpen={ratingForId !== null}
        onClose={() => setRatingForId(null)}
        onSubmit={handleSubmitRating}
      />

      <div>
        <button onClick={() => fetchAppointments(user.id)} className={btnBase}>
          Refresh
        </button>
      </div>
    </div>
  );
}
