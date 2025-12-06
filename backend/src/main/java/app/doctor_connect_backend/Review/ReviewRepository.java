package app.doctor_connect_backend.Review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Review findByAppointmentId(UUID appointmentId);
    Review findByPatientId(UUID patientId);
    Review findByDoctorId(UUID doctorId);
}
