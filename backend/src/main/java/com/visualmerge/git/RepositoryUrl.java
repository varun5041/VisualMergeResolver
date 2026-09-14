package com.visualmerge.git;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * A validated GitHub repository URL.
 *
 * <p>This is the trust boundary for user-supplied repository input. Only
 * {@code https://github.com/<owner>/<repo>} is accepted, and the owner and
 * repository segments are restricted to the character set GitHub itself allows.
 * That keeps the parsed values safe to use as path segments later on and means
 * no user-controlled text ever reaches a shell — the clone runs through JGit.
 *
 * <p>Phase 1 supports public repositories only. Private repositories will be
 * added by attaching credentials to the transport, not by widening this parser.
 */
public final class RepositoryUrl {

    /** GitHub allows letters, digits, hyphen, underscore and period. */
    private static final Pattern SEGMENT = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,99}");

    private static final String HOST = "github.com";

    private final String owner;
    private final String name;

    private RepositoryUrl(String owner, String name) {
        this.owner = owner;
        this.name = name;
    }

    public String owner() {
        return owner;
    }

    public String name() {
        return name;
    }

    /** e.g. {@code octocat/Hello-World} */
    public String fullName() {
        return owner + "/" + name;
    }

    /** The canonical clone URL, rebuilt from the parsed parts rather than the raw input. */
    public String cloneUrl() {
        return "https://" + HOST + "/" + owner + "/" + name + ".git";
    }

    /** The canonical web URL. */
    public String webUrl() {
        return "https://" + HOST + "/" + owner + "/" + name;
    }

    /**
     * Parses and validates user input.
     *
     * @throws GitOperationException with {@code INVALID_URL} if the input is not
     *                               a usable public GitHub repository URL
     */
    public static RepositoryUrl parse(String rawInput) {
        if (rawInput == null || rawInput.isBlank()) {
            throw GitOperationException.invalidUrl("Enter a GitHub repository URL.");
        }

        String candidate = rawInput.trim();
        if (candidate.length() > 300) {
            throw GitOperationException.invalidUrl("That URL is too long to be a repository URL.");
        }

        // Reject SSH/SCP syntax explicitly so the message is useful.
        if (candidate.startsWith("git@") || candidate.startsWith("ssh://")) {
            throw GitOperationException.invalidUrl(
                    "SSH URLs are not supported yet. Use the https://github.com/owner/repo form.");
        }

        // Be forgiving about a missing scheme, but never about the host.
        if (!candidate.contains("://")) {
            candidate = "https://" + candidate;
        }

        URI uri;
        try {
            uri = new URI(candidate);
        } catch (URISyntaxException e) {
            throw GitOperationException.invalidUrl("That does not look like a valid URL.");
        }

        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        if (!scheme.equals("https")) {
            throw GitOperationException.invalidUrl("Only https:// GitHub URLs are supported.");
        }

        // Credentials embedded in a URL would end up in logs and on disk.
        if (uri.getUserInfo() != null) {
            throw GitOperationException.invalidUrl(
                    "Remove the credentials from the URL. Private repositories are not supported yet.");
        }

        if (uri.getPort() != -1) {
            throw GitOperationException.invalidUrl("Only github.com URLs are supported.");
        }

        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
        if (host.startsWith("www.")) {
            host = host.substring(4);
        }
        if (!host.equals(HOST)) {
            throw GitOperationException.invalidUrl(
                    "Only github.com repositories are supported right now.");
        }

        String path = uri.getPath() == null ? "" : uri.getPath();
        String[] segments = path.split("/");
        // path starts with "/", so segments[0] is empty.
        if (segments.length < 3) {
            throw GitOperationException.invalidUrl(
                    "Include the owner and repository, for example https://github.com/owner/repo.");
        }

        String owner = segments[1];
        String name = stripGitSuffix(segments[2]);

        // Anything past owner/repo (tree/blob/pull links, or traversal attempts).
        if (segments.length > 3) {
            for (int i = 3; i < segments.length; i++) {
                if (!segments[i].isBlank()) {
                    throw GitOperationException.invalidUrl(
                            "Link directly to the repository, not to a file, branch or pull request.");
                }
            }
        }

        if (!SEGMENT.matcher(owner).matches() || !SEGMENT.matcher(name).matches()) {
            throw GitOperationException.invalidUrl(
                    "That owner or repository name contains characters GitHub does not allow.");
        }
        if (name.equals(".") || name.equals("..") || owner.equals(".") || owner.equals("..")) {
            throw GitOperationException.invalidUrl("That is not a valid repository path.");
        }

        return new RepositoryUrl(owner, name);
    }

    private static String stripGitSuffix(String segment) {
        return segment.endsWith(".git") ? segment.substring(0, segment.length() - 4) : segment;
    }

    @Override
    public String toString() {
        return webUrl();
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof RepositoryUrl url
                && url.owner.equals(owner)
                && url.name.equals(name);
    }

    @Override
    public int hashCode() {
        return fullName().hashCode();
    }
}
