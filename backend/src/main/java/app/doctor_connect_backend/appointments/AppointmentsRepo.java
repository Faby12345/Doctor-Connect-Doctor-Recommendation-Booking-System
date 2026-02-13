package app.doctor_connect_backend.appointments;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.lang.NonNull;

public interface AppointmentsRepo extends JpaRepository<Appointments, UUID> {
    @Override
    @NonNull
    <S extends Appointments> S save(@NonNull S entity);


    Optional<Appointments> findFirstByPatientIdOrderByDateDesc(UUID patientId);

    List<Appointments> findAllByDoctorId(UUID doctorId);

    List<Appointments> findAllByPatientId(UUID patientId);
    // Appointments findByDoctorIdAndPatientId(UUID doctorId, UUID patientId);

    List<Appointments> findAllByPatientIdAndStatus(UUID patientId, String status);

}
