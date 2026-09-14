package com.visualmerge.config;

import com.visualmerge.dto.ApiError;
import com.visualmerge.dto.ApiErrorResponse;
import com.visualmerge.git.GitOperationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleUnknownResource(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleInvalidPayload(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Invalid request payload");
        return ResponseEntity.badRequest().body(new ApiError(400, "Bad Request", message));
    }

    /**
     * Repository failures carry a stable code and a message already written for
     * a person. The cause is logged here and never sent to the client.
     */
    @ExceptionHandler(GitOperationException.class)
    public ResponseEntity<ApiErrorResponse> handleGitFailure(GitOperationException ex) {
        HttpStatus status = statusFor(ex.code());
        if (ex.getCause() != null) {
            // The cause can carry internal detail, so it is logged and never returned.
            log.warn("Repository operation failed code={} status={}", ex.code(), status.value(),
                    ex.getCause());
        } else {
            log.info("Repository operation rejected code={} status={}", ex.code(), status.value());
        }
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(status.value(), ex.code().name(), ex.getMessage()));
    }

    private HttpStatus statusFor(GitOperationException.Code code) {
        return switch (code) {
            case INVALID_URL -> HttpStatus.BAD_REQUEST;
            case REPOSITORY_NOT_FOUND, UNKNOWN_REPOSITORY -> HttpStatus.NOT_FOUND;
            case REPOSITORY_INACCESSIBLE -> HttpStatus.FORBIDDEN;
            case REPOSITORY_TOO_LARGE -> HttpStatus.PAYLOAD_TOO_LARGE;
            case CLONE_TIMEOUT -> HttpStatus.GATEWAY_TIMEOUT;
            case NO_BRANCHES -> HttpStatus.UNPROCESSABLE_ENTITY;
            case CLONE_FAILED, WORKSPACE_ERROR -> HttpStatus.BAD_GATEWAY;
        };
    }
}
