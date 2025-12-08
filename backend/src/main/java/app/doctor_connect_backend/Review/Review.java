package app.doctor_connect_backend.Review;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue
    @Column(nullable = false, name = "id")
    private UUID id;

    @Column(nullable = false, name = "appointment_id")
    private UUID appointmentId;

    @Column(nullable = false, name = "patient_id")
    private UUID patientId;

    @Column(nullable = false, name = "doctor_id")
    private UUID doctorId;

    @Column(nullable = false, name = "rating")
    private int rating;

    @Column(nullable = false, name = "comment")
    private String comment;

    @Column(nullable = false, name = "created_at", updatable = false)
    private Instant createdAt;


}
