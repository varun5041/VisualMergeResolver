package com.visualmerge.git;

/**
 * A failure in a repository operation, carrying a stable error code and a
 * message that is safe to show a user.
 *
 * <p>Messages must never contain filesystem paths, credentials or raw stack
 * traces — the underlying cause is logged server-side instead.
 */
public class GitOperationException extends RuntimeException {

    public enum Code {
        INVALID_URL,
        REPOSITORY_NOT_FOUND,
        REPOSITORY_INACCESSIBLE,
        CLONE_FAILED,
        CLONE_TIMEOUT,
        REPOSITORY_TOO_LARGE,
        NO_BRANCHES,
        UNKNOWN_REPOSITORY,
        WORKSPACE_ERROR
    }

    private final Code code;

    public GitOperationException(Code code, String message) {
        super(message);
        this.code = code;
    }

    public GitOperationException(Code code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public Code code() {
        return code;
    }

    public static GitOperationException invalidUrl(String message) {
        return new GitOperationException(Code.INVALID_URL, message);
    }

    public static GitOperationException notFound(String fullName) {
        return new GitOperationException(
                Code.REPOSITORY_NOT_FOUND,
                "Repository not found: " + fullName + ". Check the URL, or the repository may be private.");
    }

    public static GitOperationException inaccessible(String fullName) {
        return new GitOperationException(
                Code.REPOSITORY_INACCESSIBLE,
                "Repository is inaccessible: " + fullName
                        + ". It may be private, or GitHub declined the request.");
    }

    public static GitOperationException cloneFailed(String fullName, Throwable cause) {
        return new GitOperationException(
                Code.CLONE_FAILED, "Unable to clone repository: " + fullName + ".", cause);
    }

    public static GitOperationException cloneTimeout(String fullName, int seconds) {
        return new GitOperationException(
                Code.CLONE_TIMEOUT,
                "Cloning " + fullName + " took longer than " + seconds + " seconds and was stopped.");
    }

    public static GitOperationException unknownRepository(String id) {
        return new GitOperationException(
                Code.UNKNOWN_REPOSITORY,
                "That repository session is no longer available. Connect the repository again.");
    }
}
