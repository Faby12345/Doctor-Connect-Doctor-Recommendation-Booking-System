export type AppointmentRequestPayload = {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    status: string;
};
export type AppointmentsDTO = {
    id: string;
    doctorId: string;
    patientId: string;
    date: string;
    time: string;
    status: string;
    doctorName: string
}