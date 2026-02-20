import HistoryList from "../components/HistoryList.tsx";
import {useNavigate} from "react-router-dom";
import {VscArrowLeft} from "react-icons/vsc";

export default function AppointmentsHistoryPage() {
    const navigate = useNavigate();
    return (
        // 1. Exact Background match
        <div className="min-h-screen bg-[#F4F7FF] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">

                {/* 2. Header Area */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="group mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#155EEF]"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 group-hover:ring-[#155EEF]/30">
                                <VscArrowLeft className="h-4 w-4" />
                            </div>
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Medical History
                        </h1>
                        <p className="mt-2 text-slate-600">
                            A complete timeline of your past visits and procedures.
                        </p>
                    </div>

                    {/* Optional: Filter Button matching your 'Secondary' button style */}
                    <button className="hidden sm:block rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                        Download Report
                    </button>
                </div>

                {/* 3. The List Component */}
                <HistoryList />
            </div>
        </div>
    );

}