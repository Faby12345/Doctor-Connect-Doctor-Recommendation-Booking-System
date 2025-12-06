import {  useEffect, useState } from "react";

import "./DoctorsProfilePage.css";
import { useAuth } from "../../Authentification Context/AuthContext.tsx";
import AppointmentsDoctorView from "../../components/AppointmentsDoctorView";

export type DoctorMe = {
  id: string;
  fullName: string;
  specialty: string;
  avatarUrl?: string | null;
  bio?: string | null;
  yearsOfExperience?: number | null;
  languages?: string[] | null;
  contact: { email: string; phone?: string | null; website?: string | null };
  clinic?: {
    name: string;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  } | null;
  availability?: Array<{
    dayOfWeek: number;
    start: string;
    end: string;
  }> | null;
  stats?: {
    patientsCount?: number | null;
    appointmentsToday?: number | null;
    rating?: number | null;
  } | null;
};


function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(0)} RON`;
}
interface DoctorDTO {
  id: string;
  fullName: string;
  speciality: string;
  bio: string;
  city: string;
  priceMinCents: number;
  priceMaxCents: number;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
}

export default function DoctorProfile() {
  const { user } = useAuth();

  const id = user?.id;
  const [doctor, setDoctor] = useState<DoctorDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Missing doctor id");
      return;
    }
    const ctrl = new AbortController();

    fetch(`http://localhost:8080/api/doctor/${id}`, {
      signal: ctrl.signal,
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load profile (${r.status})`);
        return r.json();
      })
      .then((data) => {
        // If backend uses "speciality", normalize:
        const normalized = data.specialty
          ? data
          : { ...data, specialty: data.speciality };
        setDoctor(normalized);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });

    return () => ctrl.abort();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!doctor) return <div>Loading...</div>;
  function initials(name: string) {
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?"
    );
  }

  // after you setDoctor(normalized) in your effect, use this render:

  if (error)
    return (
      <div className="doctor-profile">
        <div className="card card--error">
          <strong>Couldn’t load profile.</strong>
          <div className="card__spacer" />
          {error}
        </div>
      </div>
    );
  if (!doctor)
    return (
      <div className="doctor-profile">
        <div className="card">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--text" />
          <div className="skeleton skeleton--text" />
        </div>
      </div>
    );

  // prefer normalized "specialty" if present
  const specialty = (doctor as any).specialty ?? doctor.speciality;

  return (
    <div className="doctor-profile">
      {/* Header */}
      <header className="doctor-profile__header">
        <div className="doctor-profile__avatar">
          {/* No avatarUrl in this API, so show initials */}
          <div className="doctor-profile__avatar-fallback">
            {initials(doctor.fullName)}
          </div>
        </div>

        <div className="doctor-profile__meta">
          <h1 className="doctor-profile__name">{doctor.fullName}</h1>
          <div className="doctor-profile__specialty">{specialty}</div>

          <div className="doctor-profile__chips">
            <span className="chip">
              ★ {doctor.ratingAvg.toFixed(1)} ({doctor.ratingCount})
            </span>
            <span className="chip">{doctor.city}</span>
            <span className="chip">
              {formatPrice(doctor.priceMinCents)} –{" "}
              {formatPrice(doctor.priceMaxCents)}
            </span>
            <span className="chip">
              {doctor.verified ? "Verified ✓" : "Unverified"}
            </span>
          </div>
        </div>
      </header>

      {/* Basic details card (uses only available fields) */}
      <section className="card">
        <h2>At a glance</h2>
        <div className="stats">
          <div className="stat">
            <div className="stat__value">{doctor.city}</div>
            <div className="stat__label">City</div>
          </div>
          <div className="stat">
            <div className="stat__value">{doctor.verified ? "Yes" : "No"}</div>
            <div className="stat__label">Verified</div>
          </div>
          <div className="stat">
            <div className="stat__value">
              {formatPrice(doctor.priceMinCents)}–
              {formatPrice(doctor.priceMaxCents)}
            </div>
            <div className="stat__label">Price range</div>
          </div>
          <div className="bio">
            <h2 className="bio_header">Bio</h2>
            {doctor.bio}
          </div>
        </div>
      </section>

      <AppointmentsDoctorView />

    </div>
  );
}
