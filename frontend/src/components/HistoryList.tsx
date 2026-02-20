import {useState, useEffect} from "react";
import type {AppointmentsDTO} from "../Types/Appointment.ts";
import {getAppointmentsHistory} from "../services/appointmentServices";
export default function HistoryList() {
    const [appointmentsHistory, setAppointmentsHistory] = useState<AppointmentsDTO[]>([])
    const [isLoading, setisLoading] = useState(true);

    useEffect(() => {
        const loadAppointmentsHistory = async () => {
            try{
                const data = await getAppointmentsHistory();
                setAppointmentsHistory(data);
            } catch (error) {
                console.error("Could not load appointments history", error);
            } finally {
                setisLoading(false);
            }
        };
        loadAppointmentsHistory();
    }, []);

    // loading skeleton
    if(isLoading) {
        return <div className="space-y-4 animate-pulse">
            {
                [1, 2, 3].map(
                    i => <div key={i} className="flex space-x-4 p-4 bg-white rounded-xl shadow-sm"></div>
                )
            }
        </div>
    }
    // no appointemnts found
    if(appointmentsHistory.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300 xt-gray-500">
                <p className="text-slate-500">No appointments found!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {appointmentsHistory.map((apt) => (
                <div
                    key={apt.id}
                    // STYLING MATCH: rounded-2xl, specific shadow, border-slate-100
                    className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5"
                >
                    {/* LEFT: Date & Info */}
                    <div className="flex gap-5">
                        {/* Date Box: Matches your brand blue (#155EEF) for emphasis */}
                        <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-[#F4F7FF] text-[#155EEF] border border-blue-100">
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-xl font-extrabold leading-none">
                                {new Date(apt.date).getDate()}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-lg font-bold text-slate-900">
                                    {apt.doctorName}
                                </h4>
                                <span className="sm:hidden text-xs text-slate-400">• {apt.date}</span>
                            </div>

                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                <span>🕒 {apt.time}</span>
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Status & Price */}
                    <div className="mt-4 sm:mt-0 flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium `}>
                            {apt.status}
                        </span>



                        {/* Mobile "View" chevron logic could go here */}
                    </div>
                </div>
            ))}
        </div>
    )




}