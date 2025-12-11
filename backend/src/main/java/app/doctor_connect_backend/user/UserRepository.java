package app.doctor_connect_backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);  // or findByEmailIgnoreCase if you don't normalize
    boolean existsByEmail(String email);



}
