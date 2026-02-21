package app.doctor_connect_backend.doctor;

import app.doctor_connect_backend.auth.app.AuthService; // <-- adjust if register(...) lives elsewhere
// <-- adjust to where UserResponse lives

import app.doctor_connect_backend.auth.web.DTOs.AuthResponse;
import app.doctor_connect_backend.common.exception.ResourceNotFoundException;
import app.doctor_connect_backend.user.Roles;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;

@Component
public class AddDoctorsForTesting {

    private final AuthService authService;
    private final DoctorRepository doctorRepository;
    private final Random random = new Random();

    public AddDoctorsForTesting(AuthService authService, DoctorRepository doctorRepository) {
        this.authService = authService;
        this.doctorRepository = doctorRepository;
    }

    /**
     * Seeds 50 doctors by creating a DOCTOR user first, then updating Doctor
     * profile fields.
     */
    public void addDoctors() {
        List<String> specialties = List.of(
                "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Psychiatry",
                "Neurology", "Oncology", "Endocrinology", "Radiology", "Ophthalmology");

        List<String> cities = List.of(
                "Bucharest", "Cluj", "Iasi", "Timisoara", "Constanta",
                "Brasov", "Sibiu", "Oradea", "Pitesti", "Craiova");

        for (int i = 1; i <= 50; i++) {
            String fullName = "Dr. Test " + i;
            String email = "doctor" + i + "@example.com"; // must be unique
            String password = "P@ssw0rd!" + i;

            // 1) Create the user (role = DOCTOR). Your register(...) already inserts a
            // Doctor row with that user_id
            AuthResponse savedUser = authService.register(fullName, email, password, Roles.DOCTOR);
            UUID userId = savedUser.id();

            // 2) Find the just-created Doctor by FK (user_id)
            Doctor doctor = doctorRepository.findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException("Doctor with id: " + userId + " not found" ));
            if (doctor == null) {
                // fallback: if your register does NOT auto-create a Doctor, create it now
                doctor = new Doctor();
                doctor.setUserId(Objects.requireNonNull(userId));
            }

            // 3) Fill realistic random data for the doctor profile
            String specialty = specialties.get(random.nextInt(specialties.size()));
            String city = cities.get(random.nextInt(cities.size()));
            String bio = "Experienced " + specialty + " with " + (5 + random.nextInt(21)) + " years of practice.";

            int priceMin = 5000 + random.nextInt(15001); // in cents
            int priceMax = priceMin + 3000 + random.nextInt(10001);
            boolean verified = random.nextBoolean();
            BigDecimal ratingAvg = BigDecimal
                    .valueOf(3.5 + (random.nextDouble() * 1.5)) // 3.5 .. 5.0
                    .setScale(2, RoundingMode.HALF_UP);
            int ratingCount = 5 + random.nextInt(300);

            doctor.setSpeciality(specialty); // note your entity uses 'speciality'
            doctor.setCity(city);
            doctor.setBio(bio);
            doctor.setPriceMinCents(priceMin);
            doctor.setPriceMaxCents(priceMax);
            doctor.setVerified(verified);
            doctor.setRatingAvg(ratingAvg);
            doctor.setRatingCount(ratingCount);

            doctorRepository.save(doctor);
        }

        System.out.println("✅ Seeded 50 doctors.");
    }
}
