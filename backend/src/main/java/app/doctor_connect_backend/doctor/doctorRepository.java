package app.doctor_connect_backend.doctor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Doctor findByUserId(UUID id);
}
