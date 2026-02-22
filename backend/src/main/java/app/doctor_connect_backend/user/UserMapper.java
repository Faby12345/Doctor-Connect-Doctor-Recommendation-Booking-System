package app.doctor_connect_backend.user;

public class UserMapper {
    public static UserResponseDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return new UserResponseDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                // Convert Enum to String securely
                user.getUserRole() != null ? user.getUserRole().name() : null,
                // Convert Instant to ISO-8601 String securely
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }
}
