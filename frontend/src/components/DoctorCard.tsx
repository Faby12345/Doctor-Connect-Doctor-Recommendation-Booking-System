import type {Doctor} from "../Types/Doctor.ts";

// Icons
const StarIcon = () => (
    <svg className="w-4 h-4 fill-amber-400 stroke-amber-500" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const VerifiedBadge = () => (
    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(0)} RON`;
}

export default function DoctorCard({
                                     d,
                                     onView,
                                     onBook,
                                   }: {
  d: Doctor;
  onView?: (id: string) => void;
  onBook?: (id: string) => void;
}) {
  // Generate initials for avatar
  const initials = d.fullName
      ? d.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "DR";

  return (
      <div
          role="article"
          aria-label={`${d.fullName} - ${d.speciality} specialist in ${d.city}`}
          className="
        group relative
        border border-slate-200 rounded-2xl bg-white
        overflow-hidden
        shadow-sm hover:shadow-2xl hover:border-slate-300
        transition-all duration-300 ease-out
        flex flex-col h-full
      "
      >
        {/* Verified Badge - Top Right Corner */}
        {d.verified && (
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
                <VerifiedBadge />
                <span>Verified</span>
              </div>
            </div>
        )}

        {/* Header Section with Avatar */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-4 ring-blue-50">
                {initials}
              </div>
            </div>

            {/* Name & Specialty */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
                {d.fullName || "Dr. Unknown"}
              </h3>
              <p className="text-sm font-medium text-blue-600 mb-2">
                {d.speciality}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <StarIcon />
                <span className="text-sm font-semibold text-slate-900">
                {d.ratingAvg.toFixed(1)}
              </span>
                <span className="text-xs text-slate-500">
                ({d.ratingCount} {d.ratingCount === 1 ? "review" : "reviews"})
              </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>

        {/* Info Section */}
        <div className="p-6 pt-4 flex-1">
          {/* Location */}
          <div className="flex items-center gap-2 mb-4">
            <LocationIcon />
            <span className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{d.city}</span>
          </span>
          </div>

          {/* Price Range */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Consultation Fee
            </div>
            <div className="text-lg font-bold text-slate-900">
              {formatPrice(d.priceMinCents)}
              <span className="text-slate-400 font-normal"> – </span>
              {formatPrice(d.priceMaxCents)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 mt-auto">
          <div className="flex gap-3">
            <button
                onClick={() => onView?.(d.id)}
                className="
              flex-1 px-4 py-2.5 rounded-xl
              border-2 border-slate-200
              bg-white text-slate-700 font-semibold text-sm
              hover:border-slate-300 hover:bg-slate-50
              transition-all duration-200
              active:scale-[0.98]
            "
            >
              View Profile
            </button>

            <button
                onClick={() => onBook?.(d.id)}
                className="
              flex-1 px-4 py-2.5 rounded-xl
              bg-gradient-to-r from-blue-600 to-blue-700
              text-white font-semibold text-sm
              shadow-md hover:shadow-xl hover:from-blue-700 hover:to-blue-800
              transition-all duration-200
              active:scale-[0.98]
            "
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Hover Effect - Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
      </div>
  );
}
