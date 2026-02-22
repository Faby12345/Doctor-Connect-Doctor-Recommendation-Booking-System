package app.doctor_connect_backend.common.exception;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(ResourceNotFoundException ex) {
        logger.error("Resource not found: {}", ex.getMessage());
        ErrorResponseDTO errorResponseDTO = new ErrorResponseDTO(404, ex.getMessage(), String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.status(404).body(errorResponseDTO);
    }
    @ExceptionHandler(UserNotAuthorizedException.class)
    public ResponseEntity<ErrorResponseDTO> handleUserNotAuthorizedException(UserNotAuthorizedException ex) {
        logger.error("User not authorized: {}", ex.getMessage());
        ErrorResponseDTO errorResponseDTO = new ErrorResponseDTO(401, ex.getMessage(), String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.status(401).body(errorResponseDTO);
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.error("Illegal argument: {}", ex.getMessage());
        ErrorResponseDTO errorResponseDTO = new ErrorResponseDTO(400, ex.getMessage(), String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.status(400).body(errorResponseDTO);
    }
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(IllegalStateException ex) {
        logger.error("State conflict: {}", ex.getMessage());
        // 409 Conflict is the perfect status code for duplicates!
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(409, ex.getMessage(), String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.status(409).body(errorResponse);
    }
}
