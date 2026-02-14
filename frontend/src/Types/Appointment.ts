export type AppointmentRequestPayload = {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    status: string;
};
export type AppointmentsHistoryDTO = {
    id: string;
    doctorId: string;
    date: string;
    time: string;
    status: "COMPLETED";
    doctorName: string
}