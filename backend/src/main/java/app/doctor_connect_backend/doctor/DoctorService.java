package app.doctor_connect_backend.doctor;

import app.doctor_connect_backend.Review.Review;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.Objects;

@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Doctor findByUser_id(UUID id) {
        return doctorRepository.findByUserId(id);
    }

    public List<DoctorDTO> findAll() {
        return doctorRepository.findAll().stream()
                .map(d -> new DoctorDTO(
                        d.getUserId(),
                        null, // or fetch fullName if available
                        d.getSpeciality(),
                        d.getBio(),
                        d.getCity(),
                        d.getPriceMinCents(),
                        d.getPriceMaxCents(),
                        d.isVerified(),
                        d.getRatingAvg(),
                        d.getRatingCount()))
                .toList();

    }

    @SuppressWarnings("null")
    public @NonNull Doctor save(Doctor doctor) {
        return Objects.requireNonNull(doctorRepository.save(doctor));
    }

    public Doctor updateDoctor(UUID userId, DoctorUpdateDTO dto) {
        Doctor doctor = doctorRepository.findByUserId(userId);
        if (doctor == null) {
            throw new IllegalArgumentException("Doctor profile not found");
        }

        if (dto.speciality() != null && !dto.speciality().isBlank()) {
            doctor.setSpeciality(dto.speciality().trim());
        }
        if (dto.city() != null && !dto.city().isBlank()) {
            doctor.setCity(dto.city().trim());
        }
        if (dto.bio() != null && !dto.bio().isBlank()) {
            doctor.setBio(dto.bio().trim());
        }
        if (dto.priceMinCents() != null) {
            doctor.setPriceMinCents(dto.priceMinCents());
        }
        if (dto.priceMaxCents() != null) {
            doctor.setPriceMaxCents(dto.priceMaxCents());
        }

        return doctorRepository.save(doctor);
    }

}
