package app.doctor_connect_backend.user;

import java.util.UUID;

public record UserResponseDTO(UUID id, String fullName, String email, String role, String createdAt) {
}
