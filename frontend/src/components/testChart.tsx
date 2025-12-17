import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const mockData = [
    { day: "Mon", appointments: 12 },
    { day: "Tue", appointments: 19 },
    { day: "Wed", appointments: 15 },
    { day: "Thu", appointments: 22 },
    { day: "Fri", appointments: 30 },
    { day: "Sat", appointments: 18 },
    { day: "Sun", appointments: 8 },
];

export default function WeeklyAppointmentsChart() {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Weekly Appointments
            </h2>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="appointments"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
