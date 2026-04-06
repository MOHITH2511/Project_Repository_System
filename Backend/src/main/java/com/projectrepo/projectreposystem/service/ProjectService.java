package com.projectrepo.projectreposystem.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import static com.projectrepo.projectreposystem.repository.spec.ProjectSpecifications.*;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

import com.projectrepo.projectreposystem.domain.model.*;
import com.projectrepo.projectreposystem.exception.InvalidStateTransitionException;
import com.projectrepo.projectreposystem.exception.ProjectNotFoundException;
import com.projectrepo.projectreposystem.exception.UnauthorizedActionException;
import com.projectrepo.projectreposystem.repository.IdempotencyRecordRepository;
import com.projectrepo.projectreposystem.repository.ProjectMemberRepository;
import com.projectrepo.projectreposystem.repository.ProjectRepository;
import com.projectrepo.projectreposystem.repository.UserRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final UserRepository userRepository;
    private final IdempotencyRecordRepository idempotencyRecordRepository;
    private final AuditService auditService;

    public ProjectService(ProjectRepository projectRepository,
                                                  ProjectMemberRepository projectMemberRepository,
                                                  UserRepository userRepository,
                          IdempotencyRecordRepository idempotencyRecordRepository,
                          AuditService auditService) {
        this.projectRepository = projectRepository;
                this.projectMemberRepository = projectMemberRepository;
                this.userRepository = userRepository;
        this.idempotencyRecordRepository = idempotencyRecordRepository;
        this.auditService = auditService;
    }

        public Project createProject(Project project,
                                                                 User actor,
                                                                 Long facultyGuideId,
                                                                 List<Long> teamMemberIds) {

                User facultyGuide = resolveFacultyGuide(facultyGuideId);
                project.setFacultyGuide(facultyGuide);

        Project savedProject = projectRepository.save(project);

                ProjectMember creatorMembership = new ProjectMember();
                creatorMembership.setProject(savedProject);
                creatorMembership.setUser(actor);
                creatorMembership.setMemberRole(ProjectMemberRole.LEADER);
                projectMemberRepository.save(creatorMembership);

        addTeamMembers(savedProject, actor.getId(), teamMemberIds);

        recordAudit(actor,
                AuditActionType.PROJECT_CREATED,
                AuditTargetType.PROJECT,
                savedProject.getId(),
                "Project Created"
                );
        return savedProject;
    }

        @Transactional
        public Project updateProject(Long projectId,
                                                                 Project updatedProject,
                                                                 User actor,
                                                                 Long facultyGuideId,
                                                                 List<Long> teamMemberIds) {

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ProjectNotFoundException(projectId));

                if (project.getStatus() != ProjectStatus.DRAFT &&
                                project.getStatus() != ProjectStatus.REJECTED &&
                                project.getStatus() != ProjectStatus.UNDER_REVIEW) {
                        throw new InvalidStateTransitionException("Only DRAFT, REJECTED, or UNDER_REVIEW projects can be edited");
                }

                project.setTitle(updatedProject.getTitle());
                project.setAbstractText(updatedProject.getAbstractText());
                project.setDepartment(updatedProject.getDepartment());
                project.setAcademicYear(updatedProject.getAcademicYear());
                project.setTechnologyStack(updatedProject.getTechnologyStack());
                project.setGitRepositoryUrl(updatedProject.getGitRepositoryUrl());
                project.setFacultyGuide(resolveFacultyGuide(facultyGuideId));

                Project savedProject = projectRepository.save(project);

                if (teamMemberIds != null) {
                        syncTeamMembers(savedProject, actor.getId(), teamMemberIds);
                }

                recordAudit(actor,
                                AuditActionType.PROJECT_UPDATED,
                                AuditTargetType.PROJECT,
                                projectId,
                                "Project updated");

                return savedProject;
        }

        private User resolveFacultyGuide(Long facultyGuideId) {
                if (facultyGuideId == null) {
                        return null;
                }

                User facultyGuide = userRepository.findById(facultyGuideId)
                                .orElseThrow(() -> new IllegalArgumentException("Faculty guide not found"));

                if (facultyGuide.getRole() != UserRole.REVIEWER) {
                        throw new IllegalArgumentException("Selected faculty guide must be a REVIEWER");
                }

                if (!facultyGuide.isActive()) {
                        throw new IllegalArgumentException("Selected faculty guide is inactive");
                }

                return facultyGuide;
        }

        private void addTeamMembers(Project project,
                                                                Long creatorId,
                                                                List<Long> teamMemberIds) {

                if (teamMemberIds == null || teamMemberIds.isEmpty()) {
                        return;
                }

                Set<Long> uniqueIds = new HashSet<>(teamMemberIds);

                for (Long memberId : uniqueIds) {
                        if (memberId == null || memberId.equals(creatorId)) {
                                continue;
                        }

                        User memberUser = userRepository.findById(memberId)
                                        .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + memberId));

                        if (memberUser.getRole() != UserRole.CONTRIBUTOR) {
                                throw new IllegalArgumentException("Team members must have CONTRIBUTOR role");
                        }

                        if (!memberUser.isActive()) {
                                throw new IllegalArgumentException("Team member is inactive: " + memberUser.getEmail());
                        }

                        if (projectMemberRepository.findByProjectIdAndUserId(project.getId(), memberId).isPresent()) {
                                continue;
                        }

                        ProjectMember projectMember = new ProjectMember();
                        projectMember.setProject(project);
                        projectMember.setUser(memberUser);
                        projectMember.setMemberRole(ProjectMemberRole.CONTRIBUTOR);
                        projectMemberRepository.save(projectMember);
                }
        }

        private void syncTeamMembers(Project project,
                                                                 Long leaderId,
                                                                 List<Long> requestedTeamMemberIds) {

                List<ProjectMember> existingMembers = projectMemberRepository.findByProjectId(project.getId());

                Set<Long> requestedIds = requestedTeamMemberIds == null
                                ? new HashSet<>()
                                : requestedTeamMemberIds.stream()
                                .filter(id -> id != null && !id.equals(leaderId))
                                .collect(Collectors.toSet());

                for (ProjectMember member : existingMembers) {
                        if (member.getMemberRole() == ProjectMemberRole.LEADER) {
                                continue;
                        }

                        Long memberId = member.getUser().getId();
                        if (!requestedIds.contains(memberId)) {
                                projectMemberRepository.delete(member);
                        }
                }

                addTeamMembers(project, leaderId, requestedTeamMemberIds);
        }

    @Transactional
    public void submitProject(Long projectId,
                              User actor,
                              String idempotencyKey) {

        if (idempotencyRecordRepository.existsByIdempotencyKey(idempotencyKey)) {
            return;
        }

        idempotencyRecordRepository.save(
                new IdempotencyRecord(idempotencyKey, "SUBMIT_PROJECT")
        );

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (project.getStatus() == ProjectStatus.SUBMITTED) {
            return;
        }

        if (project.getStatus() != ProjectStatus.DRAFT &&
                project.getStatus() != ProjectStatus.UNDER_REVIEW &&
                project.getStatus() != ProjectStatus.REJECTED) {
            throw new InvalidStateTransitionException(
                    "Only DRAFT, UNDER_REVIEW, or REJECTED projects can be submitted"
            );
        }

        project.setStatus(ProjectStatus.SUBMITTED);

        projectRepository.save(project);

        recordAudit(actor,
                AuditActionType.PROJECT_SUBMITTED,
                AuditTargetType.PROJECT,
                projectId,
                "Project submitted for review");
    }

    public Page<Project> getProjects(ProjectStatus status,
                                     int page,
                                     int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

                if (status == null) {
                        return projectRepository.findAll(pageable);
                }

                return projectRepository.findByStatus(status, pageable);
    }

        public Page<Project> getProjectsAssignedToReviewer(User reviewer,
                                                                                                           ProjectStatus status,
                                                                                                           int page,
                                                                                                           int size) {

                Pageable pageable = PageRequest.of(
                                page,
                                size,
                                Sort.by("createdAt").descending()
                );

                if (reviewer.getRole() == UserRole.ADMIN) {
                        return getProjects(status, page, size);
                }

                if (reviewer.getRole() != UserRole.REVIEWER) {
                        throw new UnauthorizedActionException("Only REVIEWER can query assigned projects");
                }

                if (status == null) {
                        return projectRepository.findByFacultyGuideId(reviewer.getId(), pageable);
                }

                return projectRepository.findByFacultyGuideIdAndStatus(reviewer.getId(), status, pageable);
        }

        public Project getProjectById(Long projectId) {
                return projectRepository.findById(projectId)
                                .orElseThrow(() -> new ProjectNotFoundException(projectId));
        }

        public List<ProjectMember> getProjectMembers(Long projectId) {
                if (!projectRepository.existsById(projectId)) {
                        throw new ProjectNotFoundException(projectId);
                }

                return projectMemberRepository.findByProjectId(projectId);
        }

        @Transactional
        public ProjectMember addProjectMember(Long projectId,
                                                                                  Long userId,
                                                                                  ProjectMemberRole memberRole,
                                                                                  User actor) {

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ProjectNotFoundException(projectId));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent()) {
                        throw new IllegalArgumentException("User is already a project member");
                }

                ProjectMember member = new ProjectMember();
                member.setProject(project);
                member.setUser(user);
                member.setMemberRole(memberRole);

                ProjectMember savedMember = projectMemberRepository.save(member);

                recordAudit(actor,
                                AuditActionType.PROJECT_UPDATED,
                                AuditTargetType.PROJECT,
                                projectId,
                                "Added project member userId=" + userId + ", role=" + memberRole);

                return savedMember;
        }

        @Transactional
        public void removeProjectMember(Long projectId,
                                                                        Long userId,
                                                                        User actor) {

                if (!projectRepository.existsById(projectId)) {
                        throw new ProjectNotFoundException(projectId);
                }

                ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                                .orElseThrow(() -> new IllegalArgumentException("Project member not found"));

                projectMemberRepository.delete(member);

                recordAudit(actor,
                                AuditActionType.PROJECT_UPDATED,
                                AuditTargetType.PROJECT,
                                projectId,
                                "Removed project member userId=" + userId);
        }

    public Page<Project> searchProjects(ProjectStatus status,
                                        String department,
                                        String academicYear,
                                        String keyword,
                                        int page,
                                        int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        Specification<Project> spec = Specification
                .where(hasStatus(status))
                .and(hasDepartment(department))
                .and(hasAcademicYear(academicYear))
                .and(titleContains(keyword));

        return projectRepository.findAll(spec, pageable);
    }

    public void recordAudit(User actor,
                            AuditActionType actionType,
                            AuditTargetType targetType,
                            Long targetId,
                            String metadata) {
        auditService.record(actor, actionType, targetType, targetId, metadata);
    }
}