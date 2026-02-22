package app.doctor_connect_backend.user;

import app.doctor_connect_backend.common.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User createUser(String email, String passwordHash, String fullName, Roles role) {

        String normEmail = email == null ? "" : email.trim().toLowerCase();
        String normName = fullName == null ? "" : fullName.trim();

        if (normEmail.isBlank() || !normEmail.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }
        if (normName.isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("Password hash is required");
        }
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }

        if (userRepository.existsByEmail(normEmail)) {
            throw new IllegalArgumentException("Email already exists");
        }

        try {
            User u = new User();
            u.setEmail(normEmail);
            u.setFullName(normName);
            u.setPasswordHash(passwordHash);
            u.setUserRole(role);

            return userRepository.save(u);
        } catch (DataIntegrityViolationException dup) {

            throw new IllegalArgumentException("Email already exists");
        }
    }

    public User findEmail(String email) {
        email = email.trim().toLowerCase();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public User findById(@NonNull UUID id) {
        return userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + id + " not found")
        );
    }

    @Transactional
    @SuppressWarnings("null")
    public User updateUser(@NonNull UUID id, UserUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (dto.fullName() != null && !dto.fullName().isBlank()) {
            user.setFullName(dto.fullName().trim());
        }

        return Objects.requireNonNull(userRepository.save(user));
    }
    public List<User> findAllById(Collection<UUID> ids){
        return userRepository.findAllById(ids);
    }
}
