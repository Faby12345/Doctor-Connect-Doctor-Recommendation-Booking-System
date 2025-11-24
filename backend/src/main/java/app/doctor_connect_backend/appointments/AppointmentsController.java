package app.doctor_connect_backend.appointments;

import app.doctor_connect_backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {
    private final AppointmentsService appointmentsService;
    private final AppointmentsRepo appointmentsRepo;

    public AppointmentsController(AppointmentsService appointmentsService, AppointmentsRepo appointmentsRepo) {
        this.appointmentsService = appointmentsService;
        this.appointmentsRepo = appointmentsRepo;
    }

    @PostMapping
    public ResponseEntity<Appointments> create(@RequestBody AppointmentsDTO dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = (User) authentication.getPrincipal();
        UUID patientId = user.getId();

        var app = new Appointments();

        app.setPatientId(patientId);
        app.setDoctorId(dto.doctorId());
        app.setDate(dto.date());
        app.setTime(dto.time());
        app.setStatus("Pending");

        Appointments saved = appointmentsRepo.save(app);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping(value = "doctor/{id}")
    public ResponseEntity<List<Appointments>> getAppForDoc(@PathVariable UUID id) {

        try {
            var res = appointmentsService.GetAllAppointmentsDoctor(id);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

}
