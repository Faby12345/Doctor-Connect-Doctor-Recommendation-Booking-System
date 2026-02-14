import type {Appointment} from "../components/RebookCard.tsx";
import type {AppointmentRequestPayload, AppointmentsHistoryDTO} from "../Types/Appointment.ts";
const API_URL = "http://localhost:8080/api/appointments";

export const getLastAppointment = async (signal?: AbortSignal): Promise<Appointment | null> => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/last-completed`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        signal: signal // attached the signal
    });
    if(response.status === 404){
        return null;
    }
    if(!response.ok){
        throw new Error("Failed to load last appointment");
    }
    return await response.json();
}

export default async function createAppointment(payload: AppointmentRequestPayload, signal?: AbortSignal): Promise<Appointment> {

    const token = localStorage.getItem("token");
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: signal
    })
    if(!res.ok){
        throw new Error("Failed to create appointment");
    }
    return await res.json();
}

export const getAppointmentsHistory = async () : Promise<AppointmentsHistoryDTO[]> => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/history`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });
    if(!response.ok){
        throw new Error("Failed to load appointments history");
    }
    return await response.json();
}
