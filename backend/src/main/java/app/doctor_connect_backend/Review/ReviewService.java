package app.doctor_connect_backend.Review;

import app.doctor_connect_backend.appointments.Appointments;
import app.doctor_connect_backend.appointments.AppointmentsRepo;
import app.doctor_connect_backend.appointments.AppointmentsStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final AppointmentsRepo appointmentsRepo;
    public ReviewService(ReviewRepository reviewRepository, AppointmentsRepo appointmentsRepo) {
        this.reviewRepository = reviewRepository;
        this.appointmentsRepo = appointmentsRepo;
    }
    public Review save(ReviewCreateDTO dto, UUID patientId) {
        Appointments appointment = appointmentsRepo.findById(dto.appointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
//        if (!appointment.getPatientId().equals(patientId)) {
//            throw new RuntimeException("You can only review your own appointments");
//        }
//        if(!appointment.getStatus().equals(AppointmentsStatus.COMPLETED.toString())){
//            throw new RuntimeException("You can only review completed appointments");
//        }

        try{
            Review r = new Review();
            r.setAppointmentId(dto.appointmentId());
            r.setRating(dto.rating());
            r.setComment(dto.comment());
            r.setPatientId(patientId);
            r.setDoctorId(appointment.getDoctorId());
            r.setCreatedAt(java.time.Instant.now());

            return reviewRepository.save(r);
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
    public Review findByDoctorId(UUID doctorId) {
        return reviewRepository.findByDoctorId(doctorId);
    }

}
