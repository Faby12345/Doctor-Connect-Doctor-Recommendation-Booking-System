package app.doctor_connect_backend.Review;


import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody ReviewCreateDTO dto,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String patientEmail= authentication.getName();
        User p = userService.findEmail(patientEmail);
        Review saved = reviewService.save(dto, p.getId());
        return new ResponseEntity<>(new ReviewResponseDTO(saved), HttpStatus.CREATED);
    }


    /** VARIANTA DE TEST API */
//    @PostMapping
//    public ResponseEntity<ReviewResponseDTO> save(@RequestBody ReviewCreateDTO dto) {
//        // TEMP: hardcoded patient for testing
//        try{
//            UUID patientId = UUID.fromString("af87ffdc-946d-4b58-9bf2-d861be110171");
//
//            Review saved = reviewService.save(dto, patientId);
//            ReviewResponseDTO res = new ReviewResponseDTO(saved);
//
//            return ResponseEntity.status(HttpStatus.CREATED).body(res);
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//
//    }
}
