import { useState } from "react";

type RatingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;

};

const RatingModal = ({isOpen, onClose, onSubmit }: RatingModalProps) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");


    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!rating) return;
        onSubmit(rating, comment);
        setRating(0);
        setComment("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                <h2 className="mb-4 text-xl font-semibold text-gray-800">
                    Rate your experience
                </h2>


                <div className="mb-4 flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                        const active = value <= (hover || rating);

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                onMouseEnter={() => setHover(value)}
                                onMouseLeave={() => setHover(0)}
                                className={`text-3xl transition ${
                                    active ? "text-yellow-400" : "text-gray-300"
                                }`}
                            >
                                ★
                            </button>
                        );
                    })}
                </div>


                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a comment (optional)"
                    className="mb-5 w-full resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />


                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!rating}
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                            rating
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "cursor-not-allowed bg-gray-400"
                        }`}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
