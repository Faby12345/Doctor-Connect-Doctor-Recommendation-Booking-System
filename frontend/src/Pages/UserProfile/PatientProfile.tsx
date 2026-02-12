import { useState } from "react";
import UserAppointments from "../../components/UserAppointments.tsx";
import { useAuth } from "../../Authentification Context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";

export default function PatientProfile() {
    const { user, setUser } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.fullName ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            const res = await fetch(`${API_URL}/api/user/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ fullName: editName }),
            });

            if (!res.ok) {
                throw new Error("Failed to update profile");
            }

            const updated = await res.json();
            setUser({
                ...user!,
                fullName: updated.name,
            });
            setIsEditing(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An error occurred");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-slate-100 overflow-hidden mb-6">
                    {/* Banner */}

                    <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

                    <div className="px-6 pb-6 -mt-12">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white mb-4">
                            {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                                Nume complet
                                            </label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-800"
                                                placeholder="Numele tău"
                                            />
                                        </div>

                                        {error && (
                                            <p className="text-red-500 text-sm">{error}</p>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 disabled:opacity-50"
                                            >
                                                {saving ? "Se salvează..." : "Salvează"}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditName(user?.fullName ?? "");
                                                    setError(null);
                                                }}
                                                disabled={saving}
                                                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200"
                                            >
                                                Anulează
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-2xl font-bold text-slate-800 mb-1">
                                            Welcome, {user?.fullName}
                                        </h1>
                                        <p className="text-slate-500">
                                            <span className="inline-flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {user?.email}
                                            </span>
                                            <span className="mx-2">•</span>
                                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                                {user?.role}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 flex items-center gap-2 transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 flex items-center gap-2 transition-all duration-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Section */}
                <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-slate-100 p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Your Appointments
                    </h2>
                    <UserAppointments />
                </div>
            </div>
        </div>
    );
}