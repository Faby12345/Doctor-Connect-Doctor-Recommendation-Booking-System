export default function StarRating ({ rating }: { rating: number })  {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
                <span
                    key={value}
                    className={`text-xl ${
                        value <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                >
          ★
        </span>
            ))}
        </div>
    );
};
