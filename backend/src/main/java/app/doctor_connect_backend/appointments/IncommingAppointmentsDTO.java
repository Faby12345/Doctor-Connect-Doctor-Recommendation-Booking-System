package app.doctor_connect_backend.appointments;

public record IncommingAppointmentsDTO(
        AppointmentsDTO appointment,
        String doctorName
) {
}
