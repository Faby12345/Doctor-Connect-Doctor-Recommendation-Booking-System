package app.doctor_connect_backend.Review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponseDTO(
        UUID appointmentId,
        UUID patientId,
        UUID doctorId,
        int rating,
        String comment,
        Instant createdAt,
        String patientName,
        String doctorName
) {

}


