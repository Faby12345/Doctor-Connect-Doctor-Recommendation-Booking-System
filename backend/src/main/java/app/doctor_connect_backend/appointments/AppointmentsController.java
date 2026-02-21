package app.doctor_connect_backend.appointments;

import app.doctor_connect_backend.auth.security.UserPrincipal;
import app.doctor_connect_backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {
    private final AppointmentsService appointmentsService;



    public AppointmentsController(AppointmentsService appointmentsService, AppointmentsRepo appointmentsRepo) {
        this.appointmentsService = appointmentsService;
    }
    @GetMapping("/details/{id}")
    public ResponseEntity<AppointmentsDTO> getAppointmentDetails(@AuthenticationPrincipal UserPrincipal me,
                                                                 @PathVariable @NonNull UUID id) {
        return ResponseEntity.ok(appointmentsService.getAppointmentDetails(id, me.id()));
    }

    @PostMapping
    public ResponseEntity<Appointments> create(@AuthenticationPrincipal UserPrincipal me, @RequestBody AppointmentsDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentsService.createAppointment(dto, me.id()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Boolean> cancelAppointment(@AuthenticationPrincipal UserPrincipal me, @PathVariable @NonNull UUID id) {
        appointmentsService.CancelAppointment(id, me.id(), me.role());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Boolean> confirmAppointment(@AuthenticationPrincipal UserPrincipal me, @PathVariable @NonNull UUID id) {
        appointmentsService.ConfirmAppointment(id, me.id(), me.role());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Boolean> rejectAppointment(@AuthenticationPrincipal UserPrincipal me, @PathVariable @NonNull UUID id) {
        appointmentsService.RejectAppointment(id, me.id(), me.role());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/completed")
    public ResponseEntity<Boolean> completeAppointment(@AuthenticationPrincipal UserPrincipal me, @PathVariable @NonNull UUID id) {
        appointmentsService.CompleteAppointment(id, me.id(), me.role());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("doctor/{id}")
    public ResponseEntity<List<AppointmentsDTO>> getAppForDoc(@AuthenticationPrincipal UserPrincipal me, @PathVariable UUID id) {
        var res = appointmentsService.GetAllAppointmentsDoctor(id, me.id());
        return ResponseEntity.ok(res);
    }

    @GetMapping( "patient/{id}")
    public ResponseEntity<List<AppointmentsDTO>> getAppForPatient(@AuthenticationPrincipal UserPrincipal me, @PathVariable UUID id) {
        var res = appointmentsService.GetAllAppointmentsPatient(id, me.id());
        return ResponseEntity.ok(res);

    }
    @GetMapping( "incoming/{id}")
    public ResponseEntity<List<AppointmentsDTO>> getIncomingAppForPatient(@AuthenticationPrincipal UserPrincipal me, @PathVariable UUID id) {
        var res = appointmentsService.GetAllIncomingAppointmentsPatient(id, me.id());
        return ResponseEntity.ok(res);
    }
    @GetMapping( "/test")
    public String getTest(){
        return "OK";
    }

    @GetMapping("/last-completed")
    public ResponseEntity<AppointmentsDTO>
    getLastCompletedAppointemnt(@AuthenticationPrincipal UserPrincipal me) {
        AppointmentsDTO appDTO = appointmentsService.getLastAppointmentByPatient(me.id());
        return ResponseEntity.ok(appDTO);

    }
    @GetMapping("/history")
    public ResponseEntity<List<AppointmentsDTO>> getHistory(@AuthenticationPrincipal UserPrincipal me) {
        List<AppointmentsDTO> historyAppDTO = appointmentsService.getHistoryAppointments(me.id());
        return ResponseEntity.ok(historyAppDTO);
    }

}
