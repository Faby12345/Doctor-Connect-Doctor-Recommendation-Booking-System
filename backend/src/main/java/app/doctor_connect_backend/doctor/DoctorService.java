package app.doctor_connect_backend.doctor;

import app.doctor_connect_backend.Review.Review;
import app.doctor_connect_backend.common.exception.ResourceNotFoundException;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserRepository;
import app.doctor_connect_backend.user.UserService;
import jakarta.transaction.Transactional;
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
    private final UserService userService;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository, UserService userService) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public DoctorDTO findByUserId(UUID id) {

        Doctor doctor = doctorRepository.findByUserId(id).orElseThrow(
                () -> new ResourceNotFoundException("Doctor  with id " + id + "not found"));

        User user = userService.findById(id);

        return new DoctorDTO(doctor.getUserId(), user.getFullName(), doctor.getSpeciality(),
                doctor.getBio(), doctor.getCity(), doctor.getPriceMinCents(), doctor.getPriceMaxCents(),
                doctor.isVerified(), doctor.getRatingAvg(), doctor.getRatingCount());
    }

    public List<DoctorDTO> findAll() {
        List<Doctor> doctors = doctorRepository.findAll();
        if(doctors.isEmpty()){
            return List.of();
        }
        return convertToDTOs(doctors);
    }

    @SuppressWarnings("null")
    public @NonNull Doctor save(Doctor doctor) {
        return Objects.requireNonNull(doctorRepository.save(doctor));
    }


    @Transactional // Ensures both User and Doctor update safely or rollback together
    public DoctorDTO updateDoctorProfile(UUID userId, DoctorUpdateDTO dto) {

        // Update the User's Full Name if provided
        if (dto.fullName() != null && !dto.fullName().isBlank()) {
            userService.updateUser(userId, new app.doctor_connect_backend.user.UserUpdateDTO(dto.fullName()));
        }

        //Fetch the Doctor (Fails fast if not found)
        Doctor doctor = doctorRepository.findByUserId(userId).orElseThrow(
                () -> new ResourceNotFoundException("Doctor with id " + userId + " not found"));

        // Apply Doctor updates from the DTO
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

        //  Validate the final state of the Entity before saving
        if (doctor.getPriceMinCents() < 0) {
            throw new IllegalArgumentException("Minimum price cannot be less than zero.");
        }
        if (doctor.getPriceMaxCents() < doctor.getPriceMinCents()) {
            throw new IllegalArgumentException("Maximum price cannot be lower than minimum price.");
        }

        //  Save the safely updated and validated doctor
        Doctor updatedDoctor = doctorRepository.save(doctor);

        //  Fetch the updated User so we have the fresh full name
        User updatedUser = userService.findById(userId);

        // Map to DTO and return
        return new DoctorDTO(
                updatedDoctor.getUserId(),
                updatedUser.getFullName(),
                updatedDoctor.getSpeciality(),
                updatedDoctor.getBio(),
                updatedDoctor.getCity(),
                updatedDoctor.getPriceMinCents(),
                updatedDoctor.getPriceMaxCents(),
                updatedDoctor.isVerified(),
                updatedDoctor.getRatingAvg(),
                updatedDoctor.getRatingCount()
        );
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
