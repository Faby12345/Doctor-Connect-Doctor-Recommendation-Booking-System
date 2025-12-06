

export type Doctor = {
  id: string;
  fullName: string;
  specialty: string;
  city: string;
  priceMinCents: number;
  priceMaxCents: number;
  verified: boolean;
  ratingAvg: number; // 0..5
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
  onBook?: (id: string) => void; // doc id
}) {
  return (
    <div
      className="card"
      role="article"
      aria-label={`${d.fullName} ${d.specialty}`}
    >
      <div className="cardHeader">
        <strong className="cardTitle">{d.fullName}</strong>
        <span className="muted">({d.specialty})</span>
        {d.verified && <span className="badgeVerified">Verified ✓</span>}
        <span
          style={{ marginLeft: "auto" }}
          className="muted"
          aria-label="rating"
        >
          ★ {d.ratingAvg.toFixed(1)} ({d.ratingCount})
        </span>
      </div>

      <div className="row">
        <span>
          City: <b>{d.city}</b>
        </span>
        <span>
          Price:{" "}
          <b>
            {formatPrice(d.priceMinCents)} – {formatPrice(d.priceMaxCents)}
          </b>
        </span>
      </div>

      <div className="btnRow">
        <button className="btn btnGhost" onClick={() => onView?.(d.id)}>
          View Profile
        </button>
        <button className="btn btnPrimary" onClick={() => onBook?.(d.id)}>
          Book
        </button>
      </div>
    </div>
  );
}
