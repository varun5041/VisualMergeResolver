package com.visualmerge.service;

import com.visualmerge.model.Branch;
import com.visualmerge.model.Project;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Mock project catalogue. The prototype ships with a single demo repository —
 * CauseKind — and no persistence of any kind.
 */
@Service
public class ProjectService {

    public static final String DEMO_PROJECT_ID = "causekind";

    private final List<Project> projects = List.of(
            new Project(
                    DEMO_PROJECT_ID,
                    "CauseKind",
                    "causekind/causekind-web",
                    "Donation platform for grassroots causes and community fundraisers.",
                    "TypeScript · React",
                    "main",
                    new Branch(
                            "ganpati-theme",
                            "Branch A",
                            "aarav.m",
                            7,
                            "feat(nav): animate ganpati logo on scroll",
                            "2 hours ago",
                            "amber"),
                    new Branch(
                            "navbar-feature",
                            "Branch B",
                            "priya.s",
                            5,
                            "feat(nav): profile menu + notification tray",
                            "40 minutes ago",
                            "violet"),
                    "Updated 40 minutes ago"
            )
    );

    public List<Project> findAll() {
        return projects;
    }

    public Optional<Project> findById(String id) {
        return projects.stream().filter(p -> p.id().equals(id)).findFirst();
    }

    public Project requireById(String id) {
        return findById(id).orElseThrow(
                () -> new IllegalArgumentException("Unknown project: " + id));
    }
}
