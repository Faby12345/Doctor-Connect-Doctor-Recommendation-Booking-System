package app.doctor_connect_backend.Review;

import app.doctor_connect_backend.appointments.Appointments;
import app.doctor_connect_backend.appointments.AppointmentsRepo;
import app.doctor_connect_backend.auth.web.DTOs.UserResponse;
import app.doctor_connect_backend.doctor.Doctor;
import app.doctor_connect_backend.doctor.DoctorRepository;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final AppointmentsRepo appointmentsRepo;
    private final DoctorRepository doctorRepository;

    public ReviewService(ReviewRepository reviewRepository, AppointmentsRepo appointmentsRepo, DoctorRepository doctorRepository) {
        this.reviewRepository = reviewRepository;
        this.appointmentsRepo = appointmentsRepo;
        this.doctorRepository = doctorRepository;
    }
    @Transactional
    protected void calculateAvgRateForDoctor(Review review) {
        Doctor doctor = doctorRepository
                .findByUserIdWithLock(review.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));


        int currentCount =  doctor.getRatingCount();
        BigDecimal currentSum, avarage;
        if(currentCount == 0){
            currentSum = BigDecimal.valueOf(review.getRating());
            avarage = currentSum;
            currentCount++;
        } else {
            currentSum = doctor.getRatingAvg().multiply(BigDecimal.valueOf(currentCount));
            currentCount++;
            currentSum = currentSum.add(BigDecimal.valueOf(review.getRating()));
            avarage = currentSum.divide(BigDecimal.valueOf(currentCount), 2, BigDecimal.ROUND_HALF_UP);
        }
        doctor.setRatingCount(currentCount);
        doctor.setRatingAvg(avarage);
        doctorRepository.save(doctor);

    }

    @Transactional
    public Review save(ReviewCreateDTO dto, UUID patientId) {
        Appointments appointment = appointmentsRepo.findById(Objects.requireNonNull(dto.appointmentId()))
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        try {
            Review r = new Review();
            r.setAppointmentId(dto.appointmentId());
            r.setRating(dto.rating());
            r.setComment(dto.comment());
            r.setPatientId(patientId);
            r.setDoctorId(appointment.getDoctorId());
            r.setCreatedAt(java.time.Instant.now());
            Review savedReview = reviewRepository.save(r);
            calculateAvgRateForDoctor(r);

            return savedReview;

        } catch (Exception e) {
            throw new RuntimeException("Error saving review");
        }

    }

    public Review findByAppointmentId(UUID appointmentId) {
        return reviewRepository.findByAppointmentId(appointmentId);
    }

    public Review findByPatientId(UUID patientId) {
        return reviewRepository.findByPatientId(patientId);
    }

    public List<ReviewResponseDTO> findAllByDoctorId(UUID doctorId) {
        return reviewRepository.findAllByDoctorId(doctorId);
    }

}
