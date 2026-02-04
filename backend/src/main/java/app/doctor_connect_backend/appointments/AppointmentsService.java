package app.doctor_connect_backend.appointments;

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

    public Boolean SetAppointmentStatus(@NonNull UUID id, AppointmentsStatus status) {
        Appointments app = appointmentsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        app.setStatus(status.toString());
        appointmentsRepo.save(app);
        return true;
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
