package app.doctor_connect_backend.doctor;

import app.doctor_connect_backend.auth.security.UserPrincipal;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {
    private final DoctorService doctorService;


    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/all")
    public List<DoctorDTO> findAll() {
        return doctorService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable UUID id) {
       return ResponseEntity.ok(doctorService.findByUserId(id));

    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorDTO> updateProfile(@RequestBody DoctorUpdateDTO dto,
                                                   @AuthenticationPrincipal UserPrincipal me) {
        DoctorDTO updatedDoctor = doctorService.updateDoctorProfile(me.id(), dto);
        return ResponseEntity.ok(updatedDoctor);

    }
    @GetMapping("/get-top-3-doctors")
    public ResponseEntity<List<DoctorDTO>> getTop3DoctorsByRating(){
        List<DoctorDTO> topDoctors = doctorService.GetTop3RatingDoctors();
        return ResponseEntity.ok(topDoctors);

    }


}
