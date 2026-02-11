import { useEffect, useState } from "react";
import { useAuth } from "../Authentification Context/AuthContext.tsx";
import StarRating from "./StarRating.tsx";

type Review = {
  id: string;
  patientId: string;
  appointmentId: string;
  doctorId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewsDoctorViewProps = {
  id: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function ReviewsDoctorView({ id }: ReviewsDoctorViewProps) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  if (authLoading) return <div className="p-4">Loading user…</div>;
  if (!user) return null;

  const doctorId = id;

  async function fetchReviews(id: string) {
    setLoading(true);
    setErr(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_URL}/api/review/doctor/${encodeURIComponent(id)}`,
        { method: "GET",
          headers: {
            "Content-Type": "application/json",

            "Authorization": `Bearer ${token}`
          }, }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as Review[];
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews(doctorId);
  }, [doctorId]);

  if (loading) {
    return <div className="p-4">Loading reviews…</div>;
  }

  if (err) {
    return (
      <div className="p-4 text-red-600">
        Error: {err}{" "}
        <button
          onClick={() => fetchReviews(doctorId)}
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
        <div className="mb-1 font-semibold">Reviews</div>
        <div className="text-gray-600">No reviews found.</div>

        <button
          onClick={() => fetchReviews(doctorId)}
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 active:scale-[0.99]"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="text-lg font-bold">Reviews</div>

      {items.map((a) => (
        <div
          key={a.id}
          className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div className="flex justify-between gap-3">
            <div>
              <div className="mt-1 text-sm text-gray-600">
                Patient ID: {a.patientId}
              </div>

              <div className="mt-2">
                <StarRating rating={a.rating} />
              </div>

              <div className="mt-2 font-semibold">
                {new Date(a.createdAt).toLocaleString()}
              </div>

              <div className="mt-1 text-[22px] text-gray-500">
                Comment: {a.comment}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div>
        <button
          onClick={() => fetchReviews(doctorId)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 active:scale-[0.99]"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
