import { useEffect, useState } from "react";
import { getTopRatedDoctors } from "../services/doctorService";
import type { Doctor } from "../Types/Doctor.ts"; // or from "../types" depending on where you put it

export default function TopDoctorsSection() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                // Artificial delay to see the skeleton (remove in production)
                // await new Promise(r => setTimeout(r, 1000));
                const data = await getTopRatedDoctors();
                setDoctors(data);
            } catch (error) {
                console.error("Could not load top doctors", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocs();
    }, []);

    // 1. Loading State: Show 3 Skeleton Cards instead of text
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse p-5">
                        <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                        <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    // 2. Error/Empty State
    if (!doctors.length) return <div className="text-slate-500 text-sm">No doctors found.</div>;

    // 3. Success State
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
                <div
                    key={doc.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
                >
                    {/* Header: Avatar & Badge */}
                    <div className="mb-4 flex items-start justify-between">
                        {/* Avatar Placeholder (Initials) */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-lg">
                            {doc.fullName.charAt(0)}
                        </div>
                        {doc.verified && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1" title={doc.fullName}>
                            {doc.fullName}
                        </h3>
                        <p className="text-sm font-medium text-blue-600 mt-1">
                            {doc.speciality}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {doc.city}
                        </p>
                    </div>

                    {/* Footer: Rating */}
                    <div className="mt-4 flex items-center border-t border-slate-50 pt-3">
                        <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-bold text-slate-900">
                            {doc.ratingAvg.toFixed(1)}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">
                            ({doc.ratingCount} reviews)
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}