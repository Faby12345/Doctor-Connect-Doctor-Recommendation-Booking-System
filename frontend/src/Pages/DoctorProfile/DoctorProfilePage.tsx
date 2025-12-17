import { useEffect, useState } from "react";
import { useAuth } from "../../Authentification Context/AuthContext.tsx";
import AppointmentsDoctorView from "../../components/AppointmentsDoctorView";
import { useNavigate } from "react-router-dom";
import  WeeklyAppointmentsChart from "../../components/testChart.tsx"

interface DoctorDTO {
  id: string;
  fullName: string;
  speciality: string;
  bio: string;
  city: string;
  priceMinCents: number;
  priceMaxCents: number;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
}

interface EditFormData {
  fullName: string;
  speciality: string;
  city: string;
  bio: string;
  priceMinCents: number;
  priceMaxCents: number;
}

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(0)} RON`;
}

export default function DoctorProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

  const id = user?.id;
  const [doctor, setDoctor] = useState<DoctorDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    fullName: "",
    speciality: "",
    city: "",
    bio: "",
    priceMinCents: 0,
    priceMaxCents: 0,
  });

  useEffect(() => {
    if (!id) {
      setError("Missing doctor id");
      return;
    }
    const ctrl = new AbortController();

    fetch(`${API_URL}/api/doctor/${id}`, {
      signal: ctrl.signal,
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load profile (${r.status})`);
        return r.json();
      })
      .then((data) => {
        const normalized = data.specialty
          ? data
          : { ...data, specialty: data.speciality };
        setDoctor(normalized);
        setEditForm({
          fullName: normalized.fullName || "",
          speciality: normalized.speciality || normalized.specialty || "",
          city: normalized.city || "",
          bio: normalized.bio || "",
          priceMinCents: normalized.priceMinCents || 0,
          priceMaxCents: normalized.priceMaxCents || 0,
        });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });

    return () => ctrl.abort();
  }, [id, API_URL]);

  async function handleLogout() {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/");
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/doctor/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updated = await res.json();
      setDoctor(updated);
      setUser({
        ...user!,
        fullName: updated.fullName,
      });
      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  function initials(name: string) {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?"
    );
  }

  if (error && !doctor)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Eroare la încărcare</h3>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );

  if (!doctor)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-64 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );

  const specialty = (doctor as any).specialty ?? doctor.speciality;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100/50 border border-slate-100 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="px-6 pb-6 -mt-14">
            <div className="flex items-end gap-4 mb-4">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                {initials(doctor.fullName)}
              </div>

              {/* Verification Badge */}
              {doctor.verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verificat
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">{doctor.fullName}</h1>
                <p className="text-emerald-600 font-medium text-lg">{specialty}</p>

                {/* Stats chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {doctor.ratingAvg.toFixed(1)} ({doctor.ratingCount} recenzii)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {doctor.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatPrice(doctor.priceMinCents)} – {formatPrice(doctor.priceMaxCents)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 flex items-center gap-2 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editează
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 flex items-center gap-2 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Deconectare
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100/50 border border-slate-100 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Despre mine
          </h2>
          <p className="text-slate-600 leading-relaxed">{doctor.bio}</p>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100/50 border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Programări
          </h2>
          <AppointmentsDoctorView />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Editează profilul</h3>
              <p className="text-slate-500 text-sm mt-1">Actualizează informațiile tale de profil</p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nume complet</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Specialitate</label>
                <input
                  type="text"
                  value={editForm.speciality}
                  onChange={(e) => setEditForm({ ...editForm, speciality: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Oraș</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Preț minim (bani)</label>
                  <input
                    type="number"
                    value={editForm.priceMinCents}
                    onChange={(e) => setEditForm({ ...editForm, priceMinCents: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Preț maxim (bani)</label>
                  <input
                    type="number"
                    value={editForm.priceMaxCents}
                    onChange={(e) => setEditForm({ ...editForm, priceMaxCents: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  setEditForm({
                    fullName: doctor.fullName || "",
                    speciality: doctor.speciality || "",
                    city: doctor.city || "",
                    bio: doctor.bio || "",
                    priceMinCents: doctor.priceMinCents || 0,
                    priceMaxCents: doctor.priceMaxCents || 0,
                  });
                }}
                disabled={saving}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                Anulează
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all disabled:opacity-50"
              >
                {saving ? "Se salvează..." : "Salvează modificările"}
              </button>
            </div>
          </div>
        </div>

      )}
      <div className="max-w-4xl mx-auto">
        <WeeklyAppointmentsChart />
      </div>
      
    </div>
  );
}
