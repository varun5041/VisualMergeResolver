package com.visualmerge.config;

import com.visualmerge.dto.ApiErrorResponse;
import com.visualmerge.exception.ApiException;
import com.visualmerge.git.GitOperationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Turns failures into a single error shape: {@code {status, code, message}}.
 *
 * <p>Causes are logged here and never sent to the client, so a stack trace, a
 * filesystem path or a connection string cannot leak into a response.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /** Everything VisualMerge raises deliberately: 401, 403, 404, 409, 502. */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiFailure(ApiException ex) {
        if (ex.getCause() != null) {
            log.warn("Request failed code={} status={}", ex.code(), ex.status().value(), ex.getCause());
        }
        return ResponseEntity.status(ex.status())
                .body(new ApiErrorResponse(ex.status().value(), ex.code(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidPayload(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Invalid request payload");
        return ResponseEntity.badRequest()
                .body(new ApiErrorResponse(400, "INVALID_REQUEST", message));
    }

    /**
     * The database is unreachable or rejected a statement. The user cannot act
     * on the detail, and the detail is exactly what must not be published.
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleDatabaseFailure(DataAccessException ex) {
        log.error("Database operation failed", ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiErrorResponse(
                        503,
                        "DATABASE_UNAVAILABLE",
                        "VisualMerge could not reach its database. Please try again in a moment."));
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

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleUnknownResource(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse(404, "NOT_FOUND", ex.getMessage()));
    }

    /** The last resort: log everything, say nothing specific. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled failure", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(
                        500, "INTERNAL_ERROR", "Something went wrong on the VisualMerge server."));
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
