// 1. Removed "React" default import (fixes TS6133)
import { useEffect, useMemo, useState } from "react";
// 2. Removed unused "Doctor" type import (fixes ESLint unused var)
import DoctorCard from "../components/DoctorCard";
import useDebounce from "../hooks/useDebounce";
import "./Styles/doctors.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentification Context/AuthContext";
import BookingModal from "../components/BookingModal";
import { format } from "date-fns";

export type DoctorRow = {
    id: string;
    fullName: string;
    specialty: string;
    city: string;
    priceMinCents: number;
    priceMaxCents: number;
    verified: boolean;
    ratingAvg: number;
    ratingCount: number;
};

type AppointmentRequestPayload = {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    status: string;
};

export default function DoctorsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [specialty, setSpecialty] = useState("");
    const [city, setCity] = useState("");
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");
    const [onlyVerified, setOnlyVerified] = useState(false);
    const [sort, setSort] = useState<"relevance" | "rating" | "priceAsc" | "priceDesc">("relevance");

    const debSpecialty = useDebounce(specialty, 200);
    const debCity = useDebounce(city, 200);
    const debMin = useDebounce(minPrice, 200);
    const debMax = useDebounce(maxPrice, 200);
    const debVerified = useDebounce(onlyVerified, 100);
    const debSort = useDebounce(sort, 100);

    const [rows, setRows] = useState<DoctorRow[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [bookingState, setBookingState] = useState<null | "loading" | "success" | "error">(null);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorRow | null>(null);

    useEffect(() => {
        (async () => {
            const ctrl = new AbortController();
            try {
                const res = await fetch("http://localhost:8080/api/doctor/all", {
                    cache: "no-store",
                    signal: ctrl.signal,
                    credentials: "include",
                });
                if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
                const data = (await res.json()) as DoctorRow[];
                setRows(data);
                // 3. Fixed "any" type error
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("Failed to load data");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const visible = useMemo(() => {
        if (!rows) return null;
        let list = rows;

        const spec = debSpecialty.trim().toLowerCase();
        const cty = debCity.trim().toLowerCase();
        const min = debMin === "" ? null : Number(debMin);
        const max = debMax === "" ? null : Number(debMax);

        if (spec)
            list = list.filter((d) => d.specialty.toLowerCase().includes(spec));
        if (cty) list = list.filter((d) => d.city.toLowerCase().includes(cty));
        if (min !== null) list = list.filter((d) => d.priceMinCents >= min * 100);
        if (max !== null) list = list.filter((d) => d.priceMaxCents <= max * 100);
        if (debVerified) list = list.filter((d) => d.verified);

        const copy = [...list];
        switch (debSort) {
            case "rating":
                copy.sort((a, b) => b.ratingAvg - a.ratingAvg);
                break;
            case "priceAsc":
                copy.sort((a, b) => a.priceMinCents - b.priceMinCents);
                break;
            case "priceDesc":
                copy.sort((a, b) => b.priceMinCents - a.priceMinCents);
                break;
            default:
                break;
        }

        return copy;
    }, [rows, debSpecialty, debCity, debMin, debMax, debVerified, debSort]);

    const count = visible?.length ?? 0;

    function handleBookClick(doctor: DoctorRow) {
        if (!user) {
            navigate("/");
            return;
        }
        setSelectedDoctor(doctor);
        setBookingState(null);
    }

    async function handleConfirmBooking(dateObj: Date) {
        if (!selectedDoctor || !user) return;

        const dateStr = format(dateObj, "yyyy-MM-dd");
        const timeStr = format(dateObj, "HH:mm");

        try {
            setBookingState("loading");
            setBookingError(null);

            const payload: AppointmentRequestPayload = {
                patientId: user.id,
                doctorId: selectedDoctor.id,
                date: dateStr,
                time: timeStr,
                status: "Pending",
            };

            const res = await fetch("http://localhost:8080/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setBookingState("error");
                setBookingError(`Request failed (${res.status})`);
                return;
            }

            setBookingState("success");
            setSelectedDoctor(null);

            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 4. Fixed "any" type error here as well
        } catch (err: unknown) {
            setBookingState("error");
            if (err instanceof Error) {
                setBookingError(err.message);
            } else {
                setBookingError("Unknown error");
            }
        }
    }

    return (
        <div className="pageWrap">
            <h2 className="pageTitle">Find a Doctor</h2>

            {/* 5. ADDED BACK THE FILTER INPUTS to fix "unused variable" errors */}
            <div className="filters" role="region" aria-label="filters">
                <div>
                    <label>Specialty</label>
                    <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Dermatology" />
                </div>
                <div>
                    <label>City</label>
                    <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bucharest" />
                </div>

                {/* Min Price */}
                <div>
                    <label>Min Price</label>
                    <input
                        className="input"
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                </div>

                {/* Max Price */}
                <div>
                    <label>Max Price</label>
                    <input
                        className="input"
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                </div>

                {/* Verified Checkbox */}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <label style={{marginRight: '8px'}}>Verified Only</label>
                    <input
                        type="checkbox"
                        checked={onlyVerified}
                        onChange={(e) => setOnlyVerified(e.target.checked)}
                    />
                </div>

                {/* Sort Dropdown */}
                <div>
                    <label>Sort By</label>
                    <select className="input" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                        <option value="relevance">Relevance</option>
                        <option value="rating">Highest Rated</option>
                        <option value="priceAsc">Price: Low to High</option>
                        <option value="priceDesc">Price: High to Low</option>
                    </select>
                </div>
            </div>


            <div className="toolbar" aria-live="polite">
                <span>{loading ? "Loading…" : `${count} doctors`}</span>
                <span className="spacer" />
                {bookingState === "loading" && <span className="muted">Sending request…</span>}
                {bookingState === "success" && <span className="successMsg">Request sent. Waiting for doctor ✅</span>}
                {bookingState === "error" && <span className="errorMsg">{bookingError}</span>}
            </div>

            {error && <div className="errorState">Error: {error}</div>}

            {loading ? (
                <div className="cardsGrid">Loading...</div>
            ) : (
                <div className="cardsGrid">
                    {visible?.map((r) => (
                        <DoctorCard
                            key={r.id}
                            d={r}
                            onView={() => navigate(`/doctor/${r.id}`)}
                            onBook={() => handleBookClick(r)}
                        />
                    ))}
                </div>
            )}

            {selectedDoctor && (
                <BookingModal
                    doctor={selectedDoctor}
                    onClose={() => setSelectedDoctor(null)}
                    onConfirm={handleConfirmBooking}
                    isLoading={bookingState === "loading"}
                />
            )}
        </div>
    );
}