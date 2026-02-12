package app.doctor_connect_backend.Review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Review findByAppointmentId(UUID appointmentId);
    boolean existsByAppointmentId(UUID appointmentId);
    Review findByPatientId(UUID patientId);
    Review findByDoctorId(UUID doctorId);
    List<Review> findAllByDoctorId(UUID doctorId);
}
