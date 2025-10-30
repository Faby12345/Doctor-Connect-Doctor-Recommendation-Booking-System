import React, { useEffect, useMemo, useState } from "react";
import DoctorCard from "./components/DoctorCard";
import useDebounce from "./hooks/useDebounce";
import "./doctors.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

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
  date: string; // "2025-10-30"
  time: string; // "14:30"
  status: string; // "Pending"
};

export default function DoctorsPage() {
  const navigate = useNavigate();

  // This is the logged-in patient ID.
  // In production you'd get this from auth context or JWT.
  const { user } = useAuth();

  // ---------- filter state ----------
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

  // ---------- API data ----------
  const [rows, setRows] = useState<DoctorRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // booking status banner
  const [bookingState, setBookingState] = useState<
    null | "loading" | "success" | "error"
  >(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // load doctors list
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
      } catch (e: any) {
        setError(e?.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // client-side filtering/sorting (same logic you already had)
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

  async function handleBook(doctorId: string) {
    if (!user) {
      console.error("user is null");
      navigate("/");
      return;
    }
    // Step 1: ask the user when they want the appointment
    const pickedDate = window.prompt("Choose date (YYYY-MM-DD):", "2025-10-30");
    if (!pickedDate) return;

    const pickedTime = window.prompt("Choose time (HH:MM, 24h):", "14:30");
    if (!pickedTime) return;

    try {
      setBookingState("loading");
      setBookingError(null);

      // Step 2: build the body we're going to send to backend
      const payload: AppointmentRequestPayload = {
        patientId: user.id,
        doctorId: doctorId,
        date: pickedDate,
        time: pickedTime,
        status: "Pending", // waiting for doctor approval
      };

      // Step 3: POST to backend
      const res = await fetch("http://localhost:8080/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setBookingState("error");
        setBookingError(`Request failed (${res.status})`);
        return;
      }

      setBookingState("success");
    } catch (err: any) {
      setBookingState("error");
      setBookingError(err?.message ?? "Unknown error");
    }
  }

  return (
    <div className="pageWrap">
      <h2 className="pageTitle">Find a Doctor</h2>

      <div className="filters" role="region" aria-label="filters">
        <div>
          <label>Specialty</label>
          <input
            className="input"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Dermatology"
          />
        </div>
        <div>
          <label>City</label>
          <input
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Bucharest"
          />
        </div>
        <div>
          <label>Min Price (RON)</label>
          <input
            className="input"
            inputMode="numeric"
            pattern="[0-9]*"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
        <div>
          <label>Max Price (RON)</label>
          <input
            className="input"
            inputMode="numeric"
            pattern="[0-9]*"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
        <div>
          <label>Sort</label>
          <select
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
          </select>
        </div>
        <label className="checkboxRow">
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => setOnlyVerified(e.target.checked)}
          />
          Only verified
        </label>
      </div>

      {/* Booking status / feedback to the user */}
      <div className="toolbar" aria-live="polite">
        <span>{loading ? "Loading…" : `${count} doctors`}</span>
        <span className="spacer" />
        {bookingState === "loading" && (
          <span className="muted">Sending request…</span>
        )}
        {bookingState === "success" && (
          <span className="successMsg">
            Request sent. Waiting for doctor ✅
          </span>
        )}
        {bookingState === "error" && (
          <span className="errorMsg">{bookingError}</span>
        )}
      </div>

      {/* Results list */}
      {error && <div className="errorState">Error: {error}</div>}
      {loading ? (
        <div className="cardsGrid" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeletonCard">
              <div className="shimmer lg" />
              <div className="shimmer md" />
              <div className="shimmer md" />
              <div className="shimmer sm" />
            </div>
          ))}
        </div>
      ) : visible && visible.length === 0 ? (
        <div className="emptyState">No doctors match your filters.</div>
      ) : (
        <div className="cardsGrid">
          {visible?.map((r) => (
            <DoctorCard
              key={r.id}
              d={r}
              onView={(id) => navigate(`/doctor/${id}`)}
              onBook={(id) => handleBook(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
