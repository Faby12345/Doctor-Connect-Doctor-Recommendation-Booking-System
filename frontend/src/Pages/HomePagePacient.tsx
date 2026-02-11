import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentification Context/AuthContext";
import UpcomingAppointments from "../components/UpcomingAppointments"; // Import your new lego block!
import {useEffect, useState} from "react";
import type {Appointment} from "../components/RebookCard.tsx";
import {getLastAppointment} from "../services/appointmentServices.ts";
import RebookCard from "../components/RebookCard.tsx";
export default function HomePagePatient() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [lastAppointment, setLastAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // calling the endpoint for retriving the data for the last appointment
    useEffect(() => {
        const ctrl = new AbortController();
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const data = await getLastAppointment(ctrl.signal);
                setLastAppointment(data);
            } catch (e: unknown) {
                // Check if the error was "Aborted" (User left page) -> Ignore it
                if (e instanceof Error && e.name === 'AbortError') {
                    console.log("Fetch aborted");
                    return;
                }
                console.error("Failed to load appointment", e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
        return () => ctrl.abort(); // cancel the control request if it is still running
    }, []);
    const handleRebook = (doctorId: string) => {
        console.log("Re-booking doctor:", doctorId);
        // Future: navigate(`/book/${doctorId}`);
    };
    return (
        <div className="min-h-screen bg-[#F4F7FF] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* 1. WELCOME HEADER */}
                {/* We use the user's name from context to make it feel personal */}
                <header>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Good morning, <span className="text-[#155EEF]">{user?.fullName || "Patient"}</span>
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Here is what is happening with your health today.
                    </p>
                </header>

                {/* 2. THE DASHBOARD GRID */}
                {/* This is the container that holds your widgets side-by-side */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* LEFT COLUMN (2/3 width): Main Actions */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Action Card: Find a Doctor */}
                        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                            <div className="max-w-xl">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Need a specialist?
                                </h2>
                                <p className="mt-2 text-slate-600">
                                    Find verified doctors, read reviews, and book an appointment in less than 2 minutes.
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => navigate("/doctors")}
                                        className="rounded-xl bg-[#155EEF] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
                                    >
                                        Find a Doctor
                                    </button>
                                    <button
                                        onClick={() => navigate("/my-history")}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        View History
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 h-40 flex items-center justify-center text-slate-400 border-dashed">
                            Placeholder for Medical History Graph
                        </div>
                    </div>


                    <div className="space-y-6">


                        <UpcomingAppointments />

                        {isLoading ? (
                            // Optional: A simple loading skeleton
                            <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
                        ) : lastAppointment ? (
                            // If we have data, show the card
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                                <h3 className="font-semibold text-slate-900 mb-4">Quick Re-book</h3>
                                <RebookCard
                                    appointment={lastAppointment}
                                    onRebook={handleRebook}
                                />
                            </div>
                        ) : (
                            // If NO data (New User), show a helper message or nothing
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 border-dashed text-center">
                                <p className="text-sm text-slate-500">No past appointments to re-book.</p>
                            </div>
                        )}

                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                            <h3 className="font-semibold text-slate-900">Need Help?</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Call our support line for emergency inquiries.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}