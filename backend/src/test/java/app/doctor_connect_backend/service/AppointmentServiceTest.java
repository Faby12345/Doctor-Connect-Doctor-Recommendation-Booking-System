package app.doctor_connect_backend.service; // Matches your new folder

import app.doctor_connect_backend.appointments.Appointments;
import app.doctor_connect_backend.appointments.AppointmentsDTO;
import app.doctor_connect_backend.appointments.AppointmentsRepo;
import app.doctor_connect_backend.appointments.AppointmentsService;

// Note: If your Service/Repo are in different packages, import them!

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentsRepo appointmentRepository;

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
}