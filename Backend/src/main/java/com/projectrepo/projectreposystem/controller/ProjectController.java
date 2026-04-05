package com.projectrepo.projectreposystem.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import java.util.List;

import com.projectrepo.projectreposystem.service.ProjectService;
import com.projectrepo.projectreposystem.repository.UserRepository;
import com.projectrepo.projectreposystem.domain.model.*;
import com.projectrepo.projectreposystem.dto.ProjectCreateRequest;
import com.projectrepo.projectreposystem.dto.ProjectMemberRequest;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    public ProjectController(ProjectService projectService,
                             UserRepository userRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Project createProject(@Valid @RequestBody ProjectCreateRequest request,
                                 Authentication authentication) {

                String email = authentication.getName();

        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setAbstractText(request.getAbstractText());
        project.setDepartment(request.getDepartment());
        project.setAcademicYear(request.getAcademicYear());
        project.setTechnologyStack(request.getTechnologyStack());
        project.setGitRepositoryUrl(request.getGitRepositoryUrl());

        return projectService.createProject(
                project,
                actor,
                request.getFacultyGuideId(),
                request.getTeamMemberIds()
        );
    }

        @PreAuthorize("@projectSecurity.canEditProject(#projectId, authentication) or hasRole('ADMIN')")
    @PutMapping("/{projectId}")
    public Project updateProject(@PathVariable Long projectId,
                                 @Valid @RequestBody ProjectCreateRequest request,
                                 Authentication authentication) {

        User actor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setAbstractText(request.getAbstractText());
        project.setDepartment(request.getDepartment());
        project.setAcademicYear(request.getAcademicYear());
        project.setTechnologyStack(request.getTechnologyStack());
        project.setGitRepositoryUrl(request.getGitRepositoryUrl());

        return projectService.updateProject(
                projectId,
                project,
                actor,
                request.getFacultyGuideId(),
                request.getTeamMemberIds()
        );
    }

    @PreAuthorize("@projectSecurity.isProjectMember(#projectId, authentication)")
    @PostMapping("/{projectId}/submit")
    public String submitProject(@PathVariable Long projectId,
                                @RequestHeader("Idempotency-Key") String idempotencyKey,
                                Authentication authentication) {

        User actor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        projectService.submitProject(projectId, actor, idempotencyKey);

        return "Project submitted successfully";
    }

    @GetMapping
    public Page<Project> listProjects(
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return projectService.getProjects(status, page, size);
    }

    @GetMapping("/{projectId}")
    public Project getProjectById(@PathVariable Long projectId) {
        return projectService.getProjectById(projectId);
    }

    @PreAuthorize("@projectSecurity.isProjectLeader(#projectId, authentication) or hasRole('ADMIN')")
    @PostMapping("/{projectId}/members")
    public ProjectMember addProjectMember(@PathVariable Long projectId,
                                          @Valid @RequestBody ProjectMemberRequest request,
                                          Authentication authentication) {

        User actor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return projectService.addProjectMember(
                projectId,
                request.getUserId(),
                request.getMemberRole(),
                actor
        );
    }

    @PreAuthorize("@projectSecurity.isProjectMember(#projectId, authentication) or hasRole('ADMIN') or hasRole('REVIEWER')")
    @GetMapping("/{projectId}/members")
    public List<ProjectMember> getProjectMembers(@PathVariable Long projectId) {
        return projectService.getProjectMembers(projectId);
    }

    @PreAuthorize("@projectSecurity.isProjectLeader(#projectId, authentication) or hasRole('ADMIN')")
    @DeleteMapping("/{projectId}/members/{userId}")
    public String removeProjectMember(@PathVariable Long projectId,
                                      @PathVariable Long userId,
                                      Authentication authentication) {

        User actor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        projectService.removeProjectMember(projectId, userId, actor);
        return "Project member removed successfully";
    }

    @GetMapping("/search")
    public Page<Project> searchProjects(
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean canViewNonApproved =
                currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.REVIEWER;

        ProjectStatus effectiveStatus = canViewNonApproved
                ? status
                : ProjectStatus.APPROVED;

        return projectService.searchProjects(
                effectiveStatus,
                department,
                academicYear,
                keyword,
                page,
                size
        );
    }

}