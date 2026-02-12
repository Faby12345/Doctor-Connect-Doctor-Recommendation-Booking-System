


export interface Appointment {
    id: string;
    doctorId: string;
    date: string;
    time: string;
    status: string;
    // TODO 'doctorName?: string;' here later when you update the Backend!
}

interface RebookCardProps {
    appointment: Appointment;
    onRebook: (doctorId: string) => void;
}


export default function RebookCard({ appointment, onRebook }: RebookCardProps) {
    return (

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">

            {/* Header: Date & Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                   LAST VISIT
                </span>
                <span className="text-xs font-medium text-slate-400">
                    {appointment.date}
                </span>
            </div>

            {/* Content: Doctor Details */}
            <div className="mb-5">
                <h3 className="font-bold text-slate-900 text-lg">
                    {/* Fallback to ID until backend sends name */}
                    Dr. {appointment.doctorId}
                </h3>
                <p className="text-sm text-slate-500">
                    General Practitioner
                </p>
            </div>

            {/* Footer: Button */}
            <button
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
                onClick={() => onRebook(appointment.doctorId)}
            >
                Rebook
            </button>
        </div>
    )
}