package app.doctor_connect_backend.doctor;

import app.doctor_connect_backend.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {
    private final DoctorService doctorService;
    private final UserService userService;

    public DoctorController(DoctorService doctorService, UserService userService) {
        this.doctorService = doctorService;
        this.userService = userService;
    }

    @GetMapping("/all")
    public List<DoctorDTO> findAll() {
        return doctorService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable String id) {
        try {
            var doctor = doctorService.findByUser_id(UUID.fromString(id));
            var user = userService.findById(doctor.getUserId());
            DoctorDTO dto = new DoctorDTO(doctor.getUserId(), user.getFullName(), doctor.getSpeciality(),
                    doctor.getBio(), doctor.getCity(), doctor.getPriceMinCents(), doctor.getPriceMaxCents(),
                    doctor.isVerified(), doctor.getRatingAvg(), doctor.getRatingCount());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }

    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorDTO> updateProfile(@RequestBody DoctorUpdateDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        app.doctor_connect_backend.user.User user = (app.doctor_connect_backend.user.User) authentication
                .getPrincipal();

        try {
            // Update user fullName if provided
            if (dto.fullName() != null && !dto.fullName().isBlank()) {
                userService.updateUser(user.getId(),
                        new app.doctor_connect_backend.user.UserUpdateDTO(dto.fullName()));
            }

            // Update doctor profile
            Doctor updated = doctorService.updateDoctor(user.getId(), dto);
            var updatedUser = userService.findById(user.getId());

            DoctorDTO response = new DoctorDTO(
                    updated.getUserId(),
                    updatedUser.getFullName(),
                    updated.getSpeciality(),
                    updated.getBio(),
                    updated.getCity(),
                    updated.getPriceMinCents(),
                    updated.getPriceMaxCents(),
                    updated.isVerified(),
                    updated.getRatingAvg(),
                    updated.getRatingCount());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
