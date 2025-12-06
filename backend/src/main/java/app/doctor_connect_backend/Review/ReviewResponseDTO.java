package app.doctor_connect_backend.Review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponseDTO(
        UUID id,
        UUID appointmentId,
        UUID doctorId,
        int rating,
        String comment,
        Instant createdAt
) {
    public ReviewResponseDTO(Review r) {
        this(r.getId(), r.getAppointmentId(), r.getDoctorId(),
                r.getRating(), r.getComment(), r.getCreatedAt());
    }
}


