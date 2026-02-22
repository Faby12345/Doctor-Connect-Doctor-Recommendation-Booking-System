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


    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping()
    public ResponseEntity<ReviewResponseDTO> save(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody ReviewCreateDTO dto) {

        ReviewResponseDTO saved = reviewService.save(dto, me.id());

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/doctor/{id}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsForDoctor(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.findAllByDoctorId(id));
    }

}
