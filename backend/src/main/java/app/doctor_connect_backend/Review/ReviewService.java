package app.doctor_connect_backend.Review;

import app.doctor_connect_backend.appointments.Appointments;
import app.doctor_connect_backend.appointments.AppointmentsRepo;
import app.doctor_connect_backend.auth.web.DTOs.UserResponse;
import app.doctor_connect_backend.doctor.Doctor;
import app.doctor_connect_backend.doctor.DoctorRepository;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserRepository;
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
    private void calculateAvgRateForDoctor(Review review) {
        Doctor doctor = doctorRepository.findById(review.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setRatingCount(doctor.getRatingCount() + 1);
        List<ReviewResponseDTO> reviews = reviewRepository.findAllByDoctorId(doctor.getUserId());

        if(reviews.isEmpty()){
            doctor.setRatingAvg(BigDecimal.ZERO);
        } else {
            int intS = 0;
            for(ReviewResponseDTO r : reviews){
                intS += r.rating();
            }
            BigDecimal sum = BigDecimal.valueOf(intS);

            BigDecimal count = BigDecimal.valueOf(reviews.size());
            doctor.setRatingAvg(sum.divide(count, 2, BigDecimal.ROUND_HALF_UP));
        }
        doctorRepository.save(doctor);
    }

    public Review save(ReviewCreateDTO dto, UUID patientId) {
        Appointments appointment = appointmentsRepo.findById(Objects.requireNonNull(dto.appointmentId()))
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        // if (!appointment.getPatientId().equals(patientId)) {
        // throw new RuntimeException("You can only review your own appointments");
        // }
        // if(!appointment.getStatus().equals(AppointmentsStatus.COMPLETED.toString())){
        // throw new RuntimeException("You can only review completed appointments");
        // }

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
