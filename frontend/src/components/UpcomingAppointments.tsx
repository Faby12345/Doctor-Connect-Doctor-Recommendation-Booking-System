import { useEffect, useState, useMemo } from "react";
import { differenceInSeconds, isAfter } from "date-fns";
import { useAuth } from "../Authentification Context/AuthContext";
import { useNavigate } from "react-router-dom";

// 1. MATCHING JAVA DATA SHAPE
// Based on your controller returning "List<Appointments>"
// Check your browser Network tab response to verify if 'doctor' is nested!
// 1. Mirror the inner AppointmentsDTO
export interface AppointmentDetails {
    id: string;
    doctorId: string;
    date: string;
    time: string;
    status: string;
}

// 2. Mirror the wrapper IncommingAppointmentsDTO
export interface IncomingAppointmentResponse {
    appointment: AppointmentDetails;
    doctorName: string;
}

export default function UpcomingAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<IncomingAppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [now, setNow] = useState(new Date());
    const navigate = useNavigate();


    useEffect(() => {

        if (!user || !user.id) return;

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);


                const token = localStorage.getItem("token");


                const response = await fetch(`http://localhost:8080/api/appointments/incoming/${user.id}`, {
                    signal: controller.signal,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        //
                        "Authorization": `Bearer ${token}`
                    },

                });

                if (!response.ok) throw new Error("Failed to load appointments");

                const data = await response.json();
                setAppointments(data);
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
    }, [user]);

    // EFFECT 2: The Heartbeat
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // LOGIC: Filter and Sort
    const nextAppointment = useMemo(() => {
        // Safety check 1: If list is empty/null
        if (!appointments || appointments.length === 0) return null;

        const upcoming = appointments
            .map((appt) => {

                if (!appt || !appt.appointment) {
                    console.warn("Found malformed appointment data:", appt);
                    return null;
                }

                return {
                    ...appt,
                    dateObj: new Date(`${appt.appointment.date}T${appt.appointment.time}:00`),
                };
            })
            // Filter: Remove the nulls we just created + logic
            .filter((item) => {
                if (!item) return false; // Skip the bad data

                // Now safely filter by status and time
                return (
                    item.appointment.status !== "CANCELLED" &&
                    isAfter(item.dateObj, now)
                );
            })
            .sort((a, b) => {
                // We know a and b are safe now
                return a!.dateObj.getTime() - b!.dateObj.getTime();
            });

        return upcoming[0] || null;
    }, [appointments, now]);

    // LOGIC: Formatting the Countdown
    const timeLeft = useMemo(() => {
        if (!nextAppointment) return null;
        const diff = differenceInSeconds(nextAppointment.dateObj, now);

        if (diff <= 0) return "Starting...";

        const d = Math.floor(diff / (3600 * 24));
        const h = Math.floor((diff % (3600 * 24)) / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;

        return `${d > 0 ? `${d}d ` : ""}${h}h ${m}m ${s.toString().padStart(2, "0")}s`;
    }, [nextAppointment, now]);

    // --- RENDER ---

    if (loading) {
        return (
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-4 w-1/3 rounded bg-slate-200 mb-4"></div>
                <div className="h-8 w-1/2 rounded bg-slate-200"></div>
            </div>
        );
    }


    if (!nextAppointment) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm text-slate-500">No upcoming appointments.</p>
            </div>
        );
    }


    const { doctorName } = nextAppointment; // Extract from wrapper
    const { date, time } = nextAppointment.appointment; // Extract from inner details

    return (
        <div className="rounded-2xl border border-[#C9DBFF] bg-[#F3F7FF] p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#155EEF]">
                Next Appointment
            </h2>

            <div className="mt-4 flex flex-col gap-1">
                <div className="text-sm text-slate-600">
                    Consultation with <span className="font-bold text-slate-900">{doctorName}</span>
                </div>

                <div className="my-1 font-mono text-3xl font-extrabold tracking-tight text-slate-900">
                    {timeLeft}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="rounded-md bg-white px-2 py-1 shadow-sm">
                        {date}
                    </span>
                    <span>at</span>
                    <span className="rounded-md bg-white px-2 py-1 shadow-sm">
                        {time}
                    </span>
                </div>
                <div className="text-sm text-slate-500">
                    <button
                        onClick={() => {
                            navigate(`/appointment-details/${nextAppointment?.appointment.id}`);

                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:text-indigo-800"
                    >
                        {/* Eye Icon (Heroicons) */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        Details
                    </button>
                </div>
            </div>
        </div>
    );
}