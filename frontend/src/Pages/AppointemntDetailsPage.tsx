import { useEffect, useState } from "react";
import { useAuth } from "../Authentification Context/AuthContext.tsx";
import {useParams} from "react-router-dom";

// 1. Types
export interface AppointmentDetails {
    id: string;
    doctorId: string;
    date: string;
    time: string;
    status: string;
    doctorName: string;
}



export default function AppointmentDetailsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const { id } = useParams<{ id: string }>();



    const appId = id;


    useEffect(() => {
        if (!user || !user.id || !appId) return;

        const controller = new AbortController();
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");


                const response = await fetch(`http://localhost:8080/api/appointments/details/${appId}`, {
                    signal: controller.signal,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error("Failed to load details");

                const data = await response.json();
                setAppointment(data);
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== "AbortError") {
                    console.error("Fetch error:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [user, appId]);

    // 3. Helper for Status Colors
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default:          return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };


    if (loading) {
        return (
            <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-1/3 rounded bg-slate-200"></div>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <div className="h-20 rounded bg-slate-100"></div>
                        <div className="h-20 rounded bg-slate-100"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!appointment) return null;


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">

                {/* Header Section */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Appointment Details</h2>
                            <p className="mt-1 text-sm font-medium text-slate-500">ID: {appointment.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyles(appointment.status)}`}>
                        {appointment.status}
                    </span>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2">

                    {/* Date & Time Block */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Calendar Icon */}
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">Date & Time</span>
                        </div>
                        <div className="pl-11">
                            <div className="text-lg font-bold text-slate-800">{appointment.date}</div>
                            <div className="text-sm text-slate-500">{appointment.time}</div>
                        </div>
                    </div>

                    {/* Participants Block */}
                    <div className="space-y-4">
                        <div>
                            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Doctor Name</span>
                            <div className="mt-1 font-mono text-sm text-slate-700 break-all bg-slate-50 p-2 rounded border border-slate-100">
                                {appointment.doctorName}
                            </div>
                        </div>


                    </div>
                </div>


            </div>
        </div>

    );
}