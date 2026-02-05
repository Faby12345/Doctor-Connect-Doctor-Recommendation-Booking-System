package app.doctor_connect_backend.Review;

import app.doctor_connect_backend.auth.security.UserPrincipal;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/review")
public class ReviewController {
    private final ReviewService reviewService;
    private final UserService userService;

    public ReviewController(ReviewService reviewService, UserService userService) {
        this.reviewService = reviewService;
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<ReviewResponseDTO> save(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody ReviewCreateDTO dto,
            Authentication authentication) {


        String patientEmail = authentication.getName();
        User p = userService.findEmail(patientEmail);
        Review saved = reviewService.save(dto, p.getId());
        return new ResponseEntity<>(new ReviewResponseDTO(saved), HttpStatus.CREATED);
    }

    @GetMapping("/doctor/{id}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsForDoctor(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable UUID id, Authentication authentication) {

        return ResponseEntity.ok(reviewService.findAllByDoctorId(id));

    }

}
