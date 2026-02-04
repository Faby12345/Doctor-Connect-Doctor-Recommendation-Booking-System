package app.doctor_connect_backend.appointments;

import app.doctor_connect_backend.user.Roles;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class AppointmentsService {
    private final AppointmentsRepo appointmentsRepo;

    public AppointmentsService(AppointmentsRepo appointmentsRepo) {
        this.appointmentsRepo = appointmentsRepo;
    }

    @SuppressWarnings("null")
    public @NonNull Appointments save(Appointments appointments) {
        return Objects.requireNonNull(appointmentsRepo.save(appointments));
    }

    public List<Appointments> GetAllAppointmentsDoctor(UUID doctorId) {
        return appointmentsRepo.findAllByDoctorId(doctorId).stream().toList();
    }
    public List<Appointments> GetAllIncomingAppointmentsPatient(UUID patientId){
        List<Appointments> appointments = appointmentsRepo.findAllByPatientId(patientId);
        return appointments.stream().filter(a -> a.getStatus().equals("CONFIRMED")).toList();
    }

    public List<Appointments> GetAllAppointmentsPatient(UUID patientId) {
        return appointmentsRepo.findAllByPatientId(patientId).stream().toList();
    }

    public Boolean SetAppointmentStatus(@NonNull UUID AppointmentId, AppointmentsStatus status, UUID doctorId) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        app.setStatus(status.toString());
        appointmentsRepo.save(app);
        return true;
    }
    /**
     * Only a pacient can cancel THEIR OWN appointment
     * */
    public void CancelAppointment(@NonNull UUID AppointmentId, UUID callerId,
                                  String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.PATIENT.toString()))
            throw new RuntimeException("You are not authorized to cancel this appointment");
        if (!app.getPatientId().equals(callerId))
            throw new RuntimeException("You are not authorized to cancel this appointment");

        app.setStatus(AppointmentsStatus.CANCELLED.toString());
    }


    public void ConfirmAppointment(@NonNull UUID AppointmentId, UUID callerId, String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.DOCTOR.toString())){
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }
        if (!app.getDoctorId().equals(callerId)) {
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }

        app.setStatus(AppointmentsStatus.CONFIRMED.toString());
    }
    public void RejectAppointment(@NonNull UUID AppointmentId, UUID callerId, String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.DOCTOR.toString())){
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }
        if (!app.getDoctorId().equals(callerId)) {
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }

        app.setStatus(AppointmentsStatus.REJECTED.toString());
    }
    public void CompleteAppointment(@NonNull UUID AppointmentId, UUID callerId, String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.DOCTOR.toString())){
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }
        if (!app.getDoctorId().equals(callerId)) {
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }

        app.setStatus(AppointmentsStatus.COMPLETED.toString());
    }

    public Appointments createAppointment(AppointmentsDTO dto, UUID patientId) {
        var app = new Appointments();
        app.setPatientId(patientId);
        app.setDoctorId(dto.doctorId());
        app.setDate(dto.date());
        app.setTime(dto.time());
        app.setStatus(AppointmentsStatus.PENDING.toString());
        return appointmentsRepo.save(app);
    }

}
