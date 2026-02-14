import { useEffect, useMemo, useState, useRef } from "react";
import DoctorCard from "../components/DoctorCard";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentification Context/AuthContext";
import BookingModal from "../components/BookingModal";
import { format } from "date-fns";
// Icons (assuming you use react-icons or similar, using SVG for no-dependency copy-paste)
const SearchIcon = () => <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const PinIcon = () => <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronDown = () => <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

export type DoctorRow = {
  id: string;
  fullName: string;
  speciality: string;
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

  // --- Filter States ---
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sort, setSort] = useState<"relevance" | "rating" | "priceAsc" | "priceDesc">("relevance");

  // UI State for Dropdowns (The "Airbnb" Popovers)
  const [activePopup, setActivePopup] = useState<null | "price" | "sort"> (null);
  const priceMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // --- Debouncing ---
  const debSpecialty = useDebounce(specialty, 200);
  const debCity = useDebounce(city, 200);
  const debMin = useDebounce(minPrice, 200);
  const debMax = useDebounce(maxPrice, 200);
  const debVerified = useDebounce(onlyVerified, 100);
  const debSort = useDebounce(sort, 100);

  // --- Data Loading ---
  const [rows, setRows] = useState<DoctorRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookingState, setBookingState] = useState<null | "loading" | "success" | "error">(null);
  const [, setBookingError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRow | null>(null);

  // Close popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activePopup === "price" && priceMenuRef.current && !priceMenuRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
      if (activePopup === "sort" && sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activePopup]);

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
          if (e.name !== "AbortError") setError(e.message);
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

    // FIX 1: Add (d.specialty || "") to prevent crash if data is null
    if (spec) list = list.filter((d) => (d.speciality || "").toLowerCase().includes(spec));

    // FIX 1: Add (d.city || "") here too
    if (cty) list = list.filter((d) => (d.city || "").toLowerCase().includes(cty));

    if (min !== null) list = list.filter((d) => d.priceMinCents >= min * 100);
    if (max !== null) list = list.filter((d) => d.priceMaxCents <= max * 100);
    if (debVerified) list = list.filter((d) => d.verified);

    const copy = [...list];
    switch (debSort) {
      case "rating":
        copy.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0)); // Safety check for ratings too
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

  const hasPriceFilter = minPrice !== "" || maxPrice !== "";

  return (
      <div className="min-h-screen bg-white">

        {/* 1. CLEAN HERO SECTION */}
        <div className="bg-[#F4F7FF] pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Find a Specialist
            </h1>
            <p className="mt-2 text-lg text-slate-600 max-w-2xl">
              Book verified doctors near you. Instant confirmation.
            </p>
          </div>
        </div>

        {/* 2. STICKY FILTER BAR (The "Airbnb" Style) */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center gap-3">

              {/* A. Search Inputs (Always Visible) */}
              <div className="flex-1 flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                      type="text"
                      className="block w-full rounded-full border-0 bg-slate-100 py-2.5 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-[#155EEF] sm:text-sm sm:leading-6 transition-all group-hover:bg-slate-50"
                      placeholder="Specialty, eg. Heart..."
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                  />
                </div>
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PinIcon />
                  </div>
                  <input
                      type="text"
                      className="block w-full rounded-full border-0 bg-slate-100 py-2.5 pl-10 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-[#155EEF] sm:text-sm sm:leading-6 transition-all group-hover:bg-slate-50"
                      placeholder="City..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              {/* B. Filter Buttons (Pills) */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Price Pill */}
                <div className="relative" ref={priceMenuRef}>
                  <button
                      onClick={() => setActivePopup(activePopup === "price" ? null : "price")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                                        ${hasPriceFilter
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                      }`}
                  >
                    Price {hasPriceFilter ? "• Active" : ""}
                    <ChevronDown />
                  </button>

                  {/* Price Dropdown (Popover) */}
                  {activePopup === "price" && (
                      <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                        <h3 className="font-semibold text-slate-900 mb-4">Price Range</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">Min ($)</label>
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-lg border-slate-300 text-sm p-2"
                                placeholder="0"
                            />
                          </div>
                          <div className="text-slate-400">-</div>
                          <div className="flex-1">
                            <label className="text-xs text-slate-500 mb-1 block">Max ($)</label>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full rounded-lg border-slate-300 text-sm p-2"
                                placeholder="500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                              onClick={() => setActivePopup(null)}
                              className="text-sm font-semibold text-[#155EEF] hover:underline"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                  )}
                </div>

                {/* Sort Pill */}
                <div className="relative" ref={sortMenuRef}>
                  <button
                      onClick={() => setActivePopup(activePopup === "sort" ? null : "sort")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:border-slate-400 transition-all whitespace-nowrap"
                  >
                    Sort: <span className="text-slate-900 font-semibold">
                                        {sort === 'relevance' ? 'Relevance' :
                                            sort === 'rating' ? 'Top Rated' :
                                                sort === 'priceAsc' ? 'Lowest Price' : 'Highest Price'}
                                    </span>
                    <ChevronDown />
                  </button>

                  {activePopup === "sort" && (
                      <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                        {[
                          { label: "Relevance", val: "relevance" },
                          { label: "Highest Rated", val: "rating" },
                          { label: "Price: Low to High", val: "priceAsc" },
                          { label: "Price: High to Low", val: "priceDesc" },
                        ].map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => { setSort(opt.val as any); setActivePopup(null); }}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${sort === opt.val ? "text-[#155EEF] font-semibold bg-blue-50" : "text-slate-700"}`}
                            >
                              {opt.label}
                            </button>
                        ))}
                      </div>
                  )}
                </div>

                {/* Verified Toggle */}
                <button
                    onClick={() => setOnlyVerified(!onlyVerified)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                                    ${onlyVerified
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
                    }`}
                >
                  {onlyVerified ? "✓ Verified Only" : "Verified Only"}
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Result Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              {loading ? "Searching..." : `Showing ${count} verified specialists`}
            </p>
          </div>

          {/* Error State */}
          {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 mb-8">
                Error: {error}
              </div>
          )}

          {/* Loading State */}
          {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse" />
                ))}
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          {/* Empty State */}
          {!loading && count === 0 && (
              <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <p className="text-slate-500">No doctors match your filters.</p>
                <button
                    onClick={() => {setSpecialty(""); setCity(""); setMinPrice(""); setMaxPrice(""); setOnlyVerified(false);}}
                    className="mt-2 text-sm font-semibold text-[#155EEF] hover:underline"
                >
                  Clear all filters
                </button>
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