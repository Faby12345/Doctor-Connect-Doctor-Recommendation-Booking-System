package app.doctor_connect_backend.doctor;

public record DoctorUpdateDTO(
        String fullName,
        String speciality,
        String city,
        String bio,
        Integer priceMinCents,
        Integer priceMaxCents) {
}
