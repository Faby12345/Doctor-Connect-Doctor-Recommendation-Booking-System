import { useEffect, useMemo, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import useDebounce from "../hooks/useDebounce";
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
  const [sort, setSort] = useState<
    "relevance" | "rating" | "priceAsc" | "priceDesc"
  >("relevance");

  const debSpecialty = useDebounce(specialty, 200);
  const debCity = useDebounce(city, 200);
  const debMin = useDebounce(minPrice, 200);
  const debMax = useDebounce(maxPrice, 200);
  const debVerified = useDebounce(onlyVerified, 100);
  const debSort = useDebounce(sort, 100);

  const [rows, setRows] = useState<DoctorRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookingState, setBookingState] = useState<
    null | "loading" | "success" | "error"
  >(null);
  const [, setBookingError] = useState<string | null>(null);
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

    if (spec) list = list.filter((d) => d.specialty.toLowerCase().includes(spec));
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
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8080/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setBookingState("error");
        setBookingError(`Request failed (${res.status})`);
        return;
      }

      setBookingState("success");
      setSelectedDoctor(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setBookingState("error");
      setBookingError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="min-h-screen bg-white py-7 pb-27 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#F4F7FF] via-white to-[#F4F7FF] px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">

          {/* Soft glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-10 h-72 w-72 rounded-full bg-[#155EEF20] blur-3xl" />
            <div className="absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1.4fr,1.3fr] items-center">

            {/* HERO TEXT */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#155EEF20] bg-[#155EEF08] px-3 py-1 text-xs font-medium text-[#155EEF] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                Book trusted specialists in minutes
              </div>

              <div className="space-y-3">
                <h1 className="text-[clamp(2.2rem,3vw,3rem)] font-extrabold leading-tight tracking-tight text-slate-900">
                  Find the right doctor,
                  <span className="text-[#155EEF]"> right now.</span>
                </h1>
                <p className="max-w-xl text-sm sm:text-base text-slate-600">
                  Use our advanced search tools to quickly find verified specialists based on specialty, city, ratings, and price.
                </p>
              </div>
            </div>

            {/* FILTERS CARD — LIGHT BLUE */}
            <div
              className="
                rounded-2xl border border-[#C9DBFF]
                bg-[#F3F7FF]
                px-5 py-6
                shadow-[0_10px_35px_rgba(0,0,0,0.06)]
                grid grid-cols-1 gap-3
                md:grid-cols-2
              "
            >
              {/* Specialty */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-700">Specialty</label>
                <input
                  className="w-full rounded-xl border border-[#C9D8FF] bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#155EEF] focus:ring-4 focus:ring-[#155EEF25]"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Dermatology, Cardiology..."
                />
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-700">City</label>
                <input
                  className="w-full rounded-xl border border-[#C9D8FF] bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#155EEF] focus:ring-4 focus:ring-[#155EEF25]"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bucharest, Cluj..."
                />
              </div>

              {/* Min Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-700">Min Price</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-[#C9D8FF] bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#155EEF] focus:ring-4 focus:ring-[#155EEF25]"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </div>

              {/* Max Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-700">Max Price</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-[#C9D8FF] bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#155EEF] focus:ring-4 focus:ring-[#155EEF25]"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </div>

              {/* Verified */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#155EEF] focus:ring-[#155EEF]"
                />
                <label className="text-xs text-slate-700">
                  Verified doctors only
                </label>
              </div>

              {/* Sort */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-700">Sort By</label>
                <select
                  className="w-full rounded-xl border border-[#C9D8FF] bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-[#155EEF] focus:ring-4 focus:ring-[#155EEF25]"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Doctor Count */}
        <div className="text-sm text-slate-600">
          {loading ? "Loading doctors…" : `${count} doctors found`}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            Error: {error}
          </div>
        )}

        {/* Doctor Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl bg-slate-100 p-6 text-sm text-slate-700 shadow-sm">
              Loading...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
