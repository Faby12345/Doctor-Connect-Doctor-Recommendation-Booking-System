export type Doctor = {
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
  return (
    <div
      role="article"
      aria-label={`${d.fullName} ${d.speciality}`}
      className="
        border border-slate-200 rounded-xl bg-white
        p-6 flex flex-col h-full
        shadow-sm hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
      "
    >
      {/* HEADER */}
      <div
        className="
          flex flex-wrap items-center gap-2
          pb-3 border-b border-dashed border-slate-200
        "
      >
        <strong className="text-lg font-semibold text-slate-800 relative">
          {d.fullName}
          <span className="block absolute left-0 -bottom-1 w-6 h-[2px] bg-blue-600/30 rounded"></span>
        </strong>

        <span className="text-slate-500 text-sm">({d.speciality})</span>

        {d.verified && (
          <span
            className="
              text-xs border border-emerald-500 text-emerald-600
              bg-emerald-50 px-2 py-[2px] rounded-full
            "
          >
            Verified ✓
          </span>
        )}

        <span className="ml-auto text-slate-500 text-sm">
          ★ {d.ratingAvg.toFixed(1)} ({d.ratingCount})
        </span>
      </div>

      {/* CITY + PRICE */}
      <div
        className="
          flex justify-between flex-wrap
          text-slate-600 text-sm mt-4
        "
      >
        <span>
          City: <b className="text-slate-700">{d.city}</b>
        </span>

        <span>
          Price:{" "}
          <b className="text-blue-600 font-semibold">
            {formatPrice(d.priceMinCents)} – {formatPrice(d.priceMaxCents)}
          </b>
        </span>
      </div>

      {/* 🟦 EXTRA EMPTY SPACE (the only thing added) */}
      <div className="mt-24"></div>

      {/* BUTTONS (unchanged size, unchanged layout) */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => onView?.(d.id)}
          className="
            flex-1 px-4 py-2.5 rounded-lg border border-slate-300
            bg-white text-slate-700 font-semibold
            hover:shadow-md transition-all active:scale-[0.98]
          "
        >
          View Profile
        </button>

        <button
          onClick={() => onBook?.(d.id)}
          className="
            flex-1 px-4 py-2.5 rounded-lg
            bg-blue-600 text-white font-semibold
            shadow-md hover:bg-blue-700 hover:shadow-xl
            transition-all active:scale-[0.98]
          "
        >
          Book
        </button>
      </div>
    </div>
  );
}
