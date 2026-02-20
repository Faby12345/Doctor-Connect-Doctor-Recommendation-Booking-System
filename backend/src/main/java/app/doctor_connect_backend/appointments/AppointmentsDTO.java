package app.doctor_connect_backend.appointments;

import java.util.UUID;

public record AppointmentsDTO(UUID id, UUID doctorId, UUID patientId,
                              String date, String time, String status, String doctorName) {

}
