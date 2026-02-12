package app.doctor_connect_backend.doctor;

import app.doctor_connect_backend.Review.Review;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
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
    public List<DoctorDTO> convertToDTOs(List<Doctor> doctors) {
        // Optimization: Fetch all needed Users in ONE query instead of N queries
        // This prevents the "N+1 Select Problem" which makes apps slow
        List<UUID> userIds = doctors.stream()
                .map(Doctor::getUserId)
                .toList();

        // Map: UserId -> User Entity (for fast lookup)
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        // Convert each Doctor to DTO
        return doctors.stream().map(doc -> {
            // Look up the User from our map
            User user = userMap.get(doc.getUserId());
            String fullName = (user != null) ? user.getFullName() : "Unknown Doctor";

            return new DoctorDTO(
                    doc.getUserId(),      // id
                    fullName,             // fullName (fetched from User map)
                    doc.getSpeciality(),  // speciality
                    doc.getBio(),         // bio
                    doc.getCity(),        // city
                    doc.getPriceMinCents(),
                    doc.getPriceMaxCents(),
                    doc.isVerified(),
                    doc.getRatingAvg(),
                    doc.getRatingCount()
            );
        }).toList();
    }
    public List<DoctorDTO> GetTop3RatingDoctors(){
        List<Doctor> doctors = doctorRepository.findTop3ByOrderByRatingAvgDesc();
        return convertToDTOs(doctors);

    }

}
