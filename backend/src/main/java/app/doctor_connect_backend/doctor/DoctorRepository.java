package app.doctor_connect_backend.doctor;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Doctor findByUserId(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE) // Stop everyone else from reading or writing this row until the current operation is done
    @Query("SELECT d FROM Doctor d WHERE d.userId = :id")
    Optional<Doctor> findByUserIdWithLock(@Param("id") UUID id);
}
