package app.doctor_connect_backend.appointments;

import app.doctor_connect_backend.doctor.Doctor;
import app.doctor_connect_backend.doctor.DoctorService;
import app.doctor_connect_backend.user.Roles;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class AppointmentsService {
    private final AppointmentsRepo appointmentsRepo;
    private final UserService userService;
    public AppointmentsService(AppointmentsRepo appointmentsRepo, UserService userService) {
        this.appointmentsRepo = appointmentsRepo;
        this.userService = userService;
    }

    @SuppressWarnings("null")
    public @NonNull Appointments save(Appointments appointments) {
        return Objects.requireNonNull(appointmentsRepo.save(appointments));
    }

    public List<Appointments> GetAllAppointmentsDoctor(UUID doctorId) {
        return appointmentsRepo.findAllByDoctorId(doctorId).stream().toList();
    }
    public List<IncommingAppointmentsDTO> GetAllIncomingAppointmentsPatient(UUID patientId){
        List<Appointments> appointments = appointmentsRepo.findAllByPatientId(patientId);
        List<IncommingAppointmentsDTO> incommingAppointments = new ArrayList<>();
        for(Appointments a : appointments){
            if(a.getStatus().equals(AppointmentsStatus.CONFIRMED.toString())) {


                User doctor = userService.findById(a.getDoctorId());
                AppointmentsDTO appointmentDTO = new AppointmentsDTO(
                        a.getId(),
                        a.getDoctorId(),
                        a.getDate(),
                        a.getTime(),
                        a.getStatus()
                );
                IncommingAppointmentsDTO incommingDTO = new IncommingAppointmentsDTO(
                        appointmentDTO,
                        doctor.getFullName()
                );
                incommingAppointments.add(incommingDTO);
            }
        }

        return incommingAppointments;
    }

    public List<Appointments> GetAllAppointmentsPatient(UUID patientId) {
        return appointmentsRepo.findAllByPatientId(patientId).stream().toList();
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
        appointmentsRepo.save(app);
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
        appointmentsRepo.save(app);
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
        appointmentsRepo.save(app);
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
        appointmentsRepo.save(app);
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
