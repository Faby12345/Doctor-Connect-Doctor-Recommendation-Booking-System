package app.doctor_connect_backend.Review;
import java.util.UUID;

public record ReviewCreateDTO(
        UUID appointmentId,
        int rating,
        String comment
) {
}
