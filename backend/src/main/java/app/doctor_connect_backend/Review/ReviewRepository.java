package app.doctor_connect_backend.Review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByAppointmentId(UUID appointmentId);
    List<Review> findAllByDoctorId(UUID doctorId);
}
