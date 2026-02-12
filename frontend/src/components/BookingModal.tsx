import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// We define the styles for the React Datepicker internals using a small style object
// or global CSS, but since you want to avoid CSS files, we can use a wrapper
// with Tailwind's arbitrary values to override the datepicker colors to match your theme.
const datePickerCustomStyles = `
  /* 1. General Container Styles */
  .react-datepicker { 
      font-family: inherit; 
      border: 1px solid #e2e8f0; 
      border-radius: 0.75rem; 
      box-shadow: none; 
      border: none; /* Remove default border to look cleaner */
  }
  .react-datepicker__header { 
      background-color: white; 
      border-bottom: 1px solid #e2e8f0; 
      padding-top: 1rem; 
  }
  .react-datepicker__triangle { display: none; }

  /* 2. The Selected Date (Blue Background) */
  .react-datepicker__day--selected { 
      background-color: #2563EB !important; 
      color: white !important;
      border-radius: 0.5rem; 
  }

  /* 3. THE FIX: The Selected Date ON HOVER */
  /* This prevents it from turning white/light blue when you mouse over it */
  .react-datepicker__day--selected:hover { 
      background-color: #1d4ed8 !important; /* A slightly darker blue for interaction feedback */
      color: white !important;
  }

  /* 4. Normal Dates on Hover (Light Blue) */
  /* We use :not() to ensure this ONLY applies to unselected dates */
  .react-datepicker__day:not(.react-datepicker__day--selected):hover { 
      background-color: #EFF6FF !important; 
      color: #1e293b !important;
      border-radius: 0.5rem; 
  }

  /* 5. Time Column Styles */
  .react-datepicker__time-container { border-left: 1px solid #e2e8f0; }
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
      background-color: #2563EB !important;
      color: white !important;
  }
`;

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
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    if (!doctor) return null;

    return (
        // 1. OVERLAY: Fixed, full screen, semi-transparent black, blurred background
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">

            {/* Inject custom overrides for the datepicker library */}
            <style>{datePickerCustomStyles}</style>

            {/* 2. MODAL CONTENT: White box, rounded corners, shadow */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">

                {/* 3. HEADER */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">
                        Book Appointment
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Consultation with <span className="font-semibold text-blue-600">{doctor.fullName}</span>
                    </p>
                </div>

                {/* 4. CALENDAR CONTAINER */}
                <div className="p-6 flex flex-col items-center justify-center bg-white">
                    <label className="block w-full text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
                        Select Date & Time
                    </label>

                    {/* The DatePicker itself */}
                    <div className="p-1">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            showTimeSelect
                            inline
                            timeIntervals={30}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            minDate={new Date()}
                        />
                    </div>
                </div>

                {/* 5. FOOTER ACTIONS */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={isLoading || !selectedDate}
                        onClick={() => {
                            if (selectedDate) onConfirm(selectedDate);
                        }}
                        className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                {/* Simple Loading Spinner SVG */}
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Booking...
                            </>
                        ) : (
                            "Confirm Booking"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}