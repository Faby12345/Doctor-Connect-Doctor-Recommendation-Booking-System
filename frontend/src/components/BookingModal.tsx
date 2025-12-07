import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingModal.css";

interface Doctor {
    id: string;
    fullName: string;
}

interface BookingModalProps {
    doctor: Doctor | null;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    isLoading: boolean;
}

export default function BookingModal({ doctor, onClose, onConfirm, isLoading }: BookingModalProps) {
    // CHANGE 1: Start with null so nothing is pre-selected
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    if (!doctor) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Book Appointment</h3>
                    <p className="muted">with {doctor.fullName}</p>
                </div>

                <div className="calendar-container">
                    <label>Select Date & Time</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        showTimeSelect
                        inline
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        minDate={new Date()}
                        // Optional: Add placeholder text (though 'inline' hides this usually)
                        placeholderText="Click to select a time"
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn btnGhost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        className="btn btnPrimary"
                        disabled={isLoading || !selectedDate}
                        onClick={() => {
                            if (selectedDate) onConfirm(selectedDate);
                        }}
                    >
                        {isLoading ? "Booking..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}