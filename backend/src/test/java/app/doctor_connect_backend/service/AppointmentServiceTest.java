package app.doctor_connect_backend.service; // Matches your new folder

import app.doctor_connect_backend.appointments.Appointments;
import app.doctor_connect_backend.appointments.AppointmentsDTO;
import app.doctor_connect_backend.appointments.AppointmentsRepo;
import app.doctor_connect_backend.appointments.AppointmentsService;

// Note: If your Service/Repo are in different packages, import them!

import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentsRepo appointmentRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private AppointmentsService appointmentService;

    @Test
    void testGetLastAppointment_Success() {
        // 1. GIVEN
        UUID patientId = UUID.randomUUID();
        UUID doctorId = UUID.randomUUID();

        Appointments mockAppointment = new Appointments();
        mockAppointment.setId(UUID.randomUUID());
        mockAppointment.setPatientId(patientId);
        mockAppointment.setDoctorId(doctorId);
        mockAppointment.setDate(java.time.LocalDate.now().toString());
        mockAppointment.setStatus("COMPLETED");

        // Mock the database behavior
        when(appointmentRepository.findFirstByPatientIdOrderByDateDesc(patientId))
                .thenReturn(Optional.of(mockAppointment));

        // 2. WHEN
        AppointmentsDTO result = appointmentService.getLastAppointmentByPatient(patientId);

        // 3. THEN
        assertNotNull(result);
        assertEquals(doctorId, result.doctorId());
        System.out.println("✅ Test Passed! Found doctor: " + result.doctorId());
    }
    @Test
    void getHistoryAppointments_shouldReturnMappedDTOs() {
        // --- ARRANGE ---
        UUID patientId = UUID.randomUUID();
        UUID doctorId1 = UUID.randomUUID();
        UUID doctorId2 = UUID.randomUUID();

        // 1. Mock Appointments
        Appointments app1 = new Appointments();
        app1.setId(UUID.randomUUID());
        app1.setDoctorId(doctorId1);
        app1.setPatientId(patientId);
        app1.setStatus("COMPLETED");
        app1.setDate("2023-10-01");
        app1.setTime("10:00");

        Appointments app2 = new Appointments();
        app2.setId(UUID.randomUUID());
        app2.setDoctorId(doctorId2); // Different doctor
        app2.setPatientId(patientId);
        app2.setStatus("COMPLETED");
        app2.setDate("2023-10-02");
        app2.setTime("11:00");

        // 2. Mock Doctors (Users)
        User doctor1 = new User();
        doctor1.setId(doctorId1);
        doctor1.setFullName("John Doe");


        User doctor2 = new User();
        doctor2.setId(doctorId2);
        doctor2.setFullName("Jane Smith");
        // 3. Define Mock Behavior
        when(appointmentRepository.findAllByPatientIdAndStatus(patientId, "COMPLETED"))
                .thenReturn(List.of(app1, app2));

        // Use any() or specific set matching for the IDs
        when(userService.findAllById(anySet()))
                .thenReturn(List.of(doctor1, doctor2));

        // --- ACT ---
        List<AppointmentsDTO> result = appointmentService.getHistoryAppointments(patientId);

        // --- ASSERT ---
        assertEquals(2, result.size());

        // Check first appointment mapping
        AppointmentsDTO dto1 = result.stream().filter(d -> d.id().equals(app1.getId())).findFirst().orElseThrow();
        assertEquals("John Doe", dto1.doctorName()); // Assuming getFullName() returns "John Doe"
        assertEquals("COMPLETED", dto1.status());

        // Check second appointment mapping
        AppointmentsDTO dto2 = result.stream().filter(d -> d.id().equals(app2.getId())).findFirst().orElseThrow();
        assertEquals("Jane Smith", dto2.doctorName());

        // Verify interactions (Optional but good practice)
        verify(appointmentRepository, times(1)).findAllByPatientIdAndStatus(patientId, "COMPLETED");
        verify(userService, times(1)).findAllById(anySet());
    }

    @Test
    void getHistoryAppointments_shouldHandleUnknownDoctor() {
        // --- ARRANGE ---
        UUID patientId = UUID.randomUUID();
        UUID doctorId = UUID.randomUUID();

        Appointments app = new Appointments();
        app.setId(UUID.randomUUID());
        app.setDoctorId(doctorId);
        app.setStatus("COMPLETED");

        // Mock Repo to return appointment
        when(appointmentRepository.findAllByPatientIdAndStatus(patientId, "COMPLETED"))
                .thenReturn(List.of(app));

        // Mock UserService to return EMPTY list (Doctor deleted or not found)
        when(userService.findAllById(anySet())).thenReturn(Collections.emptyList());

        // --- ACT ---
        List<AppointmentsDTO> result = appointmentService.getHistoryAppointments(patientId);

        // --- ASSERT ---
        assertEquals(1, result.size());
        assertEquals("Unknown Doctor", result.get(0).doctorName());
    }
}