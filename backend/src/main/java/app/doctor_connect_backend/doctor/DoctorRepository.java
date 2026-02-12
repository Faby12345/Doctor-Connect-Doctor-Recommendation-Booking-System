package app.doctor_connect_backend.doctor;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Doctor findByUserId(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE) // Stop everyone else from reading or writing this row until the current operation is done
    @Query("SELECT d FROM Doctor d WHERE d.userId = :id")
    Optional<Doctor> findByUserIdWithLock(@Param("id") UUID id);



    /**
     * Calculates a Weighted Score (Bayesian Average) to rank doctors fairly.
     * Formula: ( (rating_avg * rating_count) + (4.0 * 5) ) / (rating_count + 5)
     * Logic:
     * - We add 5 "dummy" reviews with a score of 4.0 to everyone.
     * - Doctor A (5.0 stars, 1 review) becomes: (5 + 20) / 6 = 4.16 Score
     * - Doctor B (4.9 stars, 100 reviews) becomes: (490 + 20) / 105 = 4.85 Score
     * - Result: Doctor B wins!
     */

    @Query(value = """
        SELECT * FROM doctors_profile d
        ORDER BY 
        ( (d.rating_avg * d.rating_count) + (4.0 * 5) ) / (d.rating_count + 5) DESC
        LIMIT 3
        """, nativeQuery = true)
    List<Doctor> findTop3ByOrderByRatingAvgDesc();


}
