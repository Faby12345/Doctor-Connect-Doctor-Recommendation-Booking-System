import { useEffect, useState, type ReactNode } from "react";
import ReviewsDoctorView from "../../components/DoctorReviews";
// export type DoctorMe = {
//   id: string;
//   fullName: string;
//   specialty: string;
//   avatarUrl?: string | null;
//   bio?: string | null;
//   yearsOfExperience?: number | null;
//   languages?: string[] | null;
//   contact: { email: string; phone?: string | null; website?: string | null };
//   clinic?: {
//     name: string;
//     addressLine1?: string | null;
//     addressLine2?: string | null;
//     city?: string | null;
//     state?: string | null;
//     zip?: string | null;
//     country?: string | null;
//   } | null;
//   availability?: Array<{
//     dayOfWeek: number;
//     start: string;
//     end: string;
//   }> | null;
//   stats?: {
//     patientsCount?: number | null;
//     appointmentsToday?: number | null;
//     rating?: number | null;
//   } | null;
// };

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

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/60 to-slate-100 px-4 py-8 pb-27 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}

export default function DoctorProfile_outside({ id }: { id: string }) {
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

  if (error) {
    return (
      <Shell>
        <div className="transform-gpu rounded-3xl border border-red-200/70 bg-red-50/95 px-6 py-4 text-base text-red-800 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <p className="font-semibold">Couldn’t load profile.</p>
          <p className="mt-2 text-sm opacity-90">{error}</p>
        </div>
      </Shell>
    );
  }

  if (!doctor) {
    // Skeleton loading state
    return (
      <Shell>
        <div className="transform-gpu rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="h-28 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="flex-1 space-y-4">
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="flex flex-wrap gap-3 pt-1">
                <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
                <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="h-7 w-32 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </Shell>
    );
  }

  const specialty = (doctor as any).specialty ?? doctor.speciality;

  return (
    <Shell>
      {/* Header */}
      <header className="mb-7 grid grid-cols-[112px,1fr] items-center gap-6">
        <div className="transform-gpu grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:rotate-2 hover:scale-105 hover:shadow-[0_18px_45px_rgba(30,64,175,0.35)]">
          {/* Placeholder avatar with initials */}
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700 text-4xl font-extrabold text-white">
            {initials(doctor.fullName)}
          </div>
        </div>

        <div className="transform-gpu rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {doctor.fullName}
          </h1>
          <p className="mt-2 text-base text-slate-500">{specialty}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100">
              <span className="text-base">★</span>
              {doctor.ratingAvg.toFixed(1)} ({doctor.ratingCount})
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100">
              {doctor.city}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100">
              {formatPrice(doctor.priceMinCents)} –{" "}
              {formatPrice(doctor.priceMaxCents)}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100">
              {doctor.verified ? "Verified ✓" : "Unverified"}
            </span>
          </div>
        </div>
      </header>

      {/* At a glance / Stats + Bio card */}
      <section className="transform-gpu rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          At a glance
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="transform-gpu flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50/90 hover:shadow-xl">
            <div className="text-2xl font-semibold text-indigo-700">
              {doctor.city}
            </div>
            <div className="mt-1 text-sm text-slate-500">City</div>
          </div>

          <div className="transform-gpu flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50/90 hover:shadow-xl">
            <div className="text-2xl font-semibold text-indigo-700">
              {doctor.verified ? "Yes" : "No"}
            </div>
            <div className="mt-1 text-sm text-slate-500">Verified</div>
          </div>

          <div className="transform-gpu flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50/90 hover:shadow-xl">
            <div className="text-2xl font-semibold text-indigo-700">
              {formatPrice(doctor.priceMinCents)} –{" "}
              {formatPrice(doctor.priceMaxCents)}
            </div>
            <div className="mt-1 text-sm text-slate-500">Price range</div>
          </div>
        </div>

        {/* Bio */}
        {doctor.bio && (
          <div className="mt-6 transform-gpu rounded-2xl bg-slate-50/80 px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-100/90">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Bio
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 md:text-base">
              {doctor.bio}
            </p>
          </div>
        )}
      </section>

      {/* Reviews */}
      <div className="mt-8 transform-gpu rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <ReviewsDoctorView id={doctor.id} />
      </div>
    </Shell>
  );
}
