package com.projectrepo.projectreposystem.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.validation.FieldError;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.persistence.OptimisticLockException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ProjectNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleProjectNotFound(ProjectNotFoundException ex) {
                log.warn("Project not found: {}", ex.getMessage());
        return new ErrorResponse(
                "PROJECT_NOT_FOUND",
                ex.getMessage()
        );
    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleInvalidTransition(InvalidStateTransitionException ex) {
                log.warn("Invalid state transition: {}", ex.getMessage());
        return new ErrorResponse(
                "INVALID_STATE_TRANSITION",
                ex.getMessage()
        );
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleUnauthorized(UnauthorizedActionException ex) {
                log.warn("Unauthorized action: {}", ex.getMessage());
        return new ErrorResponse(
                "UNAUTHORIZED_ACTION",
                ex.getMessage()
        );
    }

        @ExceptionHandler(IllegalArgumentException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ErrorResponse handleIllegalArgument(IllegalArgumentException ex) {
                log.warn("Bad request: {}", ex.getMessage());
                return new ErrorResponse(
                                "BAD_REQUEST",
                                ex.getMessage()
                );
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ErrorResponse handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
                log.warn("Invalid parameter value for {}", ex.getName());
                return new ErrorResponse(
                                "INVALID_PARAMETER",
                                "Invalid value for parameter: " + ex.getName()
                );
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ErrorResponse handleUnreadableBody(HttpMessageNotReadableException ex) {
                log.warn("Malformed request body", ex);
                return new ErrorResponse(
                                "INVALID_REQUEST_BODY",
                                "Malformed JSON or invalid enum value"
                );
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        @ResponseStatus(HttpStatus.CONFLICT)
        public ErrorResponse handleDataIntegrity(DataIntegrityViolationException ex) {
                log.warn("Data integrity violation", ex);
                return new ErrorResponse(
                                "DATA_INTEGRITY_VIOLATION",
                                "Requested operation violates data integrity constraints"
                );
        }

        @ExceptionHandler(MaxUploadSizeExceededException.class)
        @ResponseStatus(HttpStatus.CONTENT_TOO_LARGE)
        public ErrorResponse handleMaxUploadSize(MaxUploadSizeExceededException ex) {
                log.warn("File upload too large", ex);
                return new ErrorResponse(
                                "FILE_TOO_LARGE",
                                "Uploaded file exceeds the maximum allowed size"
                );
        }

        @ExceptionHandler(MissingServletRequestPartException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ErrorResponse handleMissingFilePart(MissingServletRequestPartException ex) {
                log.warn("Missing multipart file part: {}", ex.getRequestPartName());
                return new ErrorResponse(
                                "MISSING_FILE_PART",
                                "Multipart request must include a file part named 'file'"
                );
        }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() == null || ex.getReason().isBlank()
                ? status.getReasonPhrase()
                : ex.getReason();

        log.warn("Response status exception: {} {}", status.value(), message);

        return ResponseEntity
                .status(status)
                .body(new ErrorResponse(status.name(), message));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
                log.error("Unhandled internal error", ex);
        return new ErrorResponse(
                "INTERNAL_ERROR",
                "Unexpected system error"
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidationErrors(MethodArgumentNotValidException ex) {

        FieldError firstError = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .orElse(null);

        String message = (firstError != null)
                ? firstError.getDefaultMessage()
                : "Validation failed";

        log.warn("Validation failed: {}", message);

        return new ErrorResponse(
                "VALIDATION_FAILED",
                message
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleAccessDenied(AccessDeniedException ex) {

                log.warn("Access denied: {}", ex.getMessage());

        return new ErrorResponse(
                "ACCESS_DENIED",
                "You do not have permission to perform this action"
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleAuthFailure(AuthenticationException ex) {

                log.warn("Authentication failure: {}", ex.getMessage());

        return new ErrorResponse(
                "UNAUTHORIZED",
                "Authentication required or token invalid"
        );
    }

    @ExceptionHandler(OptimisticLockException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleOptimisticLock(OptimisticLockException ex) {

                log.warn("Optimistic lock conflict", ex);

        return new ErrorResponse(
                "CONCURRENT_MODIFICATION",
                "Resource was modified by another request. Please retry."
        );
    }
}