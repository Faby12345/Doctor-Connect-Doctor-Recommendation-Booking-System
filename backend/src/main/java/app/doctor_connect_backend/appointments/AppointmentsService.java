package app.doctor_connect_backend.appointments;

import app.doctor_connect_backend.common.exception.ResourceNotFoundException;
import app.doctor_connect_backend.common.exception.UserNotAuthorizedException;
import app.doctor_connect_backend.doctor.Doctor;
import app.doctor_connect_backend.doctor.DoctorService;
import app.doctor_connect_backend.user.Roles;
import app.doctor_connect_backend.user.User;
import app.doctor_connect_backend.user.UserService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AppointmentsService {
    private final AppointmentsRepo appointmentsRepo;
    private final UserService userService;
    public AppointmentsService(AppointmentsRepo appointmentsRepo, UserService userService) {
        this.appointmentsRepo = appointmentsRepo;
        this.userService = userService;
    }



    public List<Appointments> GetAllAppointmentsDoctor(UUID doctorId) {
        return appointmentsRepo.findAllByDoctorId(doctorId).stream().toList();
    }

    /**
     * for preventing userA access the data of userB (which is not authorized)
     * BUT the doctor the appointment CAN view it
     * */
    public void verifyDataOwnership(UUID callerId, UUID ownerId, UUID doctorId) {
        boolean isDoctor = doctorId.equals(callerId);
        boolean isPacient = ownerId.equals(callerId);
        if (!isDoctor && !isPacient) {
            throw new UserNotAuthorizedException("You are not authorized to perform this action");
        }
    }
    public List<IncommingAppointmentsDTO> GetAllIncomingAppointmentsPatient(UUID patientId){
        List<Appointments> appointments = appointmentsRepo.findAllByPatientId(patientId);
        List<IncommingAppointmentsDTO> incommingAppointments = new ArrayList<>();
        for(Appointments a : appointments){
            if(a.getStatus().equals(AppointmentsStatus.CONFIRMED.toString())) {


                User doctor = userService.findById(a.getDoctorId());
                AppointmentsDTO appointmentDTO = new AppointmentsDTO(
                        a.getId(),
                        a.getDoctorId(),
                        a.getDate(),
                        a.getTime(),
                        a.getStatus(),
                        doctor.getFullName()
                );
                IncommingAppointmentsDTO incommingDTO = new IncommingAppointmentsDTO(
                        appointmentDTO,
                        doctor.getFullName()
                );
                incommingAppointments.add(incommingDTO);
            }
        }

        return incommingAppointments;
    }

    public List<Appointments> GetAllAppointmentsPatient(UUID patientId) {
        return appointmentsRepo.findAllByPatientId(patientId).stream().toList();
    }


    /**
     * Only a pacient can cancel THEIR OWN appointment
     * */
    public void CancelAppointment(@NonNull UUID AppointmentId, UUID callerId,
                                  String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.PATIENT.toString()))
            throw new RuntimeException("You are not authorized to cancel this appointment");
        if (!app.getPatientId().equals(callerId))
            throw new RuntimeException("You are not authorized to cancel this appointment");

        app.setStatus(AppointmentsStatus.CANCELLED.toString());
        appointmentsRepo.save(app);
    }


    public void ConfirmAppointment(@NonNull UUID AppointmentId, UUID callerId, String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.DOCTOR.toString())){
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }
        if (!app.getDoctorId().equals(callerId)) {
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }

        app.setStatus(AppointmentsStatus.CONFIRMED.toString());
        appointmentsRepo.save(app);
    }
    public void RejectAppointment(@NonNull UUID AppointmentId, UUID callerId, String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.DOCTOR.toString())){
            throw new UserNotAuthorizedException("You are not authorized to cancel this appointment");
        }
        if (!app.getDoctorId().equals(callerId)) {
            throw new UserNotAuthorizedException("You are not authorized to cancel this appointment");
        }

        app.setStatus(AppointmentsStatus.REJECTED.toString());
        appointmentsRepo.save(app);
    }
    public void CompleteAppointment(@NonNull UUID AppointmentId, UUID callerId, String role) {
        Appointments app = appointmentsRepo.findById(AppointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if(!role.equals(Roles.DOCTOR.toString())){
            throw new UserNotAuthorizedException("You are not authorized to cancel this appointment");
        }
        if (!app.getDoctorId().equals(callerId)) {
            throw new UserNotAuthorizedException("You are not authorized to cancel this appointment");
        }

        app.setStatus(AppointmentsStatus.COMPLETED.toString());
        appointmentsRepo.save(app);
    }

    public Appointments createAppointment(AppointmentsDTO dto, UUID patientId) {
        var app = new Appointments();
        app.setPatientId(patientId);
        app.setDoctorId(dto.doctorId());
        app.setDate(dto.date());
        app.setTime(dto.time());
        app.setStatus(AppointmentsStatus.PENDING.toString());
        return appointmentsRepo.save(app);
    }

    public AppointmentsDTO getAppointmentDetails(UUID id, UUID callerId){
        Appointments app = appointmentsRepo.findById(id)
                .orElseThrow (() -> new ResourceNotFoundException("Appointment with id: " +  id + " not found"));


        // if the caller is the doctor, we let him view it and verify if pacientA is accesing pacientB data
        verifyDataOwnership(callerId, app.getPatientId(), app.getDoctorId());

        User user = userService.findById(app.getDoctorId());
        return new AppointmentsDTO(
                app.getId(),
                app.getDoctorId(),
                app.getDate(),
                app.getTime(),
                app.getStatus(),
                user.getFullName()
        );
    }

    public AppointmentsDTO getLastAppointmentByPatient(UUID patientId) {

            // optional handels the null excetion
            Optional<Appointments> appOptional = appointmentsRepo.findFirstByPatientIdOrderByDateDesc(patientId);

            if(appOptional.isPresent()){
                Appointments app = appOptional.get();
                User user = userService.findById(app.getDoctorId());
                return new AppointmentsDTO(
                        app.getId(),
                        app.getDoctorId(),
                        app.getDate(),
                        app.getTime(),
                        app.getStatus(),
                        user.getFullName()

                );
            } else {
                // explicit handle the not found case
                System.out.println("DEBUG: No appointment found for patient: " + patientId);
                throw new RuntimeException("No appointments found for this patient");
            }

    }

    public List<AppointmentsDTO> getHistoryAppointments(UUID patientId){
        List<Appointments> completedAppointments = appointmentsRepo.findAllByPatientIdAndStatus(patientId, AppointmentsStatus.COMPLETED.toString());
        if(completedAppointments.isEmpty()){
            return List.of();
        }

        //storing all the doctorsId uniquely
        Set<UUID> doctorIds = completedAppointments
                .stream()
                .map(Appointments::getDoctorId)
                .collect(Collectors.toSet());

        // get all the doctors (users)
        List<User> doctors = userService.findAllById(doctorIds);

        //a map for id -> user to not use the DB ofr every user
        Map<UUID, User> doctorMap = doctors.stream()
                .collect(Collectors.toMap(User::getId, doctor -> doctor));

        // Convert using the map
        return completedAppointments.stream()
                .map(appointment -> {
                    User doctor = doctorMap.get(appointment.getDoctorId());
                    String doctorName = (doctor != null) ? doctor.getFullName() : "Unknown Doctor";

                    return new AppointmentsDTO(
                            appointment.getId(),
                            appointment.getDoctorId(),
                            appointment.getDate(),
                            appointment.getTime(),
                            appointment.getStatus(),
                            doctorName
                    );
                })
                .collect(Collectors.toList());

    }

}
