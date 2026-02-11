export interface Appointment {
    id: string,
    doctorId: string,
    date: string,
    time: string,
    status: string,
}

interface RebookCardProps {
    appointment: Appointment;
    onRebook : (doctorId: string) => void;
    //on rebook we will call a book endpoint that will take the doctorId as an arg
}
export default function RebookCard({appointment, onRebook}: RebookCardProps) {
    return (
        <div className="bg-white rounded-l p-5 shadow-sm border border-slate-100 ">
            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                   LAST VISIT
                </span>
                <span className="text-sm text-gray-500">
                    {appointment.date}
                </span>
            </div>
            <div className="mb-4">
                <h3 className="font-bold text-slate-900 text-lg">
                    Doctor Test {/* We will fix this ID later */}
                </h3>
                <p className="text-sm text-slate-500">
                    General Practitioner
                </p>
            </div>
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
                onClick = {() => onRebook(appointment.doctorId)}>
                Rebook
            </button>
        </div>
    )
}

