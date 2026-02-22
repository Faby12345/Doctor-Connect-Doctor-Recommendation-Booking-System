package app.doctor_connect_backend.Review;

import app.doctor_connect_backend.appointments.Appointments;
import app.doctor_connect_backend.appointments.AppointmentsRepo;
import app.doctor_connect_backend.auth.web.DTOs.UserResponse;
import app.doctor_connect_backend.common.exception.ResourceNotFoundException;
import app.doctor_connect_backend.common.exception.UserNotAuthorizedException;
import app.doctor_connect_backend.doctor.Doctor;
import app.doctor_connect_backend.doctor.DoctorRepository;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserRepository;
import app.doctor_connect_backend.user.UserService;
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
    private final UserService userService;

    public ReviewService(ReviewRepository reviewRepository, AppointmentsRepo appointmentsRepo, DoctorRepository doctorRepository, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.appointmentsRepo = appointmentsRepo;
        this.doctorRepository = doctorRepository;
        this.userService = userService;
    }
    @Transactional
    protected void calculateAvgRateForDoctor(int rating, UUID doctorId) {
        Doctor doctor = doctorRepository
                .findByUserIdWithLock(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));


        int currentCount =  doctor.getRatingCount();
        BigDecimal currentSum, avarage;
        if(currentCount == 0){
            currentSum = BigDecimal.valueOf(rating);
            avarage = currentSum;
            currentCount++;
        } else {
            currentSum = doctor.getRatingAvg().multiply(BigDecimal.valueOf(currentCount));
            currentCount++;
            currentSum = currentSum.add(BigDecimal.valueOf(rating));
            avarage = currentSum.divide(BigDecimal.valueOf(currentCount), 2, BigDecimal.ROUND_HALF_UP);
        }
        doctor.setRatingCount(currentCount);
        doctor.setRatingAvg(avarage);
        doctorRepository.save(doctor);

    }

    @Transactional
    public ReviewResponseDTO save(ReviewCreateDTO dto, UUID patientId) {
        Appointments appointment = appointmentsRepo.findById(Objects.requireNonNull(dto.appointmentId()))
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // 1. Security check!
        if (!appointment.getPatientId().equals(patientId)) {
            throw new UserNotAuthorizedException("You can only review your own appointments.");
        }

        if (reviewRepository.existsByAppointmentId(dto.appointmentId())) {
            throw new IllegalStateException("You have already reviewed this appointment.");
        }

        User patient = userService.findById(patientId);

        Doctor doctor = doctorRepository.findById(appointment.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));


        User doctorUser = userService.findById(doctor.getUserId());
        String doctorName = doctorUser.getFullName();


            // save the entity
            Review reviewEntity = new Review();
            reviewEntity.setAppointmentId(dto.appointmentId());
            reviewEntity.setRating(dto.rating());
            reviewEntity.setComment(dto.comment());
            reviewEntity.setPatientId(patientId);
            reviewEntity.setDoctorId(appointment.getDoctorId());
            reviewEntity.setCreatedAt(java.time.Instant.now());
            Review savedReview = reviewRepository.save(reviewEntity);


            calculateAvgRateForDoctor(dto.rating(), appointment.getDoctorId());

         // returning the DTO
            return new ReviewResponseDTO(
                    savedReview.getAppointmentId(),
                    savedReview.getPatientId(),
                    savedReview.getDoctorId(),
                    savedReview.getRating(),
                    savedReview.getComment(),
                    savedReview.getCreatedAt(),
                    patient.getFullName(),
                    doctorName
            );
    }


    public List<ReviewResponseDTO> findAllByDoctorId(UUID doctorId) {
        // Get the raw entities from the DB
        List<Review> reviews = reviewRepository.findAllByDoctorId(doctorId);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        User doctorUser = userService.findById(doctor.getUserId());


        // Convert each entity to a DTO (fetching names as needed)
        return reviews.stream().map(review -> {

            User patient = userService.findById(review.getPatientId());

            return new ReviewResponseDTO(
                    review.getAppointmentId(),
                    review.getPatientId(),
                    review.getDoctorId(),
                    review.getRating(),
                    review.getComment(),
                    review.getCreatedAt(),
                    patient.getFullName(),
                    doctorUser.getFullName()
            );
        }).toList();
    }

}
