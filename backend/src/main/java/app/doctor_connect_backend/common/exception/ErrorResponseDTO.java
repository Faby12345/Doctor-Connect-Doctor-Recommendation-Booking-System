package app.doctor_connect_backend.common.exception;

public record  ErrorResponseDTO (
        int statusCode,
        String message,
        String timeStamp
){ }
