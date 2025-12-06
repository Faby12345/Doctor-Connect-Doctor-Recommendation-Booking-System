// 1. Removed "React" from the import. Now it only imports "useState".
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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
                        onChange={(date) => date && setSelectedDate(date)}
                        showTimeSelect
                        inline
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        minDate={new Date()}
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn btnGhost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        className="btn btnPrimary"
                        onClick={() => onConfirm(selectedDate)}
                        disabled={isLoading}
                    >
                        {isLoading ? "Booking..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}