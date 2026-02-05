package app.doctor_connect_backend.auth.web;

import app.doctor_connect_backend.auth.app.AuthService;
import app.doctor_connect_backend.auth.security.UserPrincipal;
import app.doctor_connect_backend.auth.web.DTOs.AuthResponse;
import app.doctor_connect_backend.auth.web.DTOs.LoginRequest;
import app.doctor_connect_backend.auth.web.DTOs.RegisterRequest;
import app.doctor_connect_backend.auth.web.DTOs.UserResponse;
import app.doctor_connect_backend.user.Roles;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {

        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(loginRequest.email(), loginRequest.password());
        response.addCookie(createAuthCookie(authResponse.token()));
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(registerRequest.fullName(), registerRequest.email(),
                registerRequest.password(), registerRequest.role());
        response.addCookie(createAuthCookie(authResponse.token()));
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserPrincipal me) {
        User user = userRepository.findById(me.id()).orElseThrow();
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getUserRole(), user.getCreatedAt()
        ));
    }


    private Cookie createAuthCookie(String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24 hours

        return cookie;
    }
}
