package com.projectrepo.projectreposystem.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectrepo.projectreposystem.repository.ProjectRepository;
import com.projectrepo.projectreposystem.repository.ReviewRepository;
import com.projectrepo.projectreposystem.repository.UserRepository;

import com.projectrepo.projectreposystem.domain.model.*;
import com.projectrepo.projectreposystem.exception.InvalidStateTransitionException;
import com.projectrepo.projectreposystem.exception.ProjectNotFoundException;
import com.projectrepo.projectreposystem.exception.UnauthorizedActionException;
import java.util.List;

@Service
public class ReviewService {

    private final ProjectRepository projectRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ReviewService(ProjectRepository projectRepository,
                         ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         AuditService auditService) {
        this.projectRepository = projectRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Review addReview(Long projectId,
                            String reviewerEmail,
                            ReviewDecision decision,
                            String comment) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (project.getStatus() != ProjectStatus.SUBMITTED) {
            throw new InvalidStateTransitionException("Only SUBMITTED project can be reviewed");
        }

        if (reviewer.getRole() != UserRole.REVIEWER) {
            throw new UnauthorizedActionException("Only REVIEWER can review projects");
        }

        Review review = new Review();
        review.setProject(project);
        review.setReviewer(reviewer);
        review.setDecision(decision);
        review.setComment(comment);

        Review savedReview = reviewRepository.save(review);

        ProjectStatus newStatus = mapDecisionToStatus(decision);
        project.setStatus(newStatus);

        projectRepository.save(project);

        recordAudit(reviewer,
                AuditActionType.REVIEW_ADDED,
                AuditTargetType.PROJECT,
                projectId,
                "Review added with decision: " + decision);

        if (decision == ReviewDecision.APPROVE) {
            recordAudit(reviewer,
                    AuditActionType.PROJECT_APPROVED,
                    AuditTargetType.PROJECT,
                    projectId,
                    "Project approved");
        }

        if (decision == ReviewDecision.REJECT) {
            recordAudit(reviewer,
                    AuditActionType.PROJECT_REJECTED,
                    AuditTargetType.PROJECT,
                    projectId,
                    "Project rejected");
        }

        return savedReview;
    }

    public List<Review> getProjectReviews(Long projectId) {

        if (!projectRepository.existsById(projectId)) {
            throw new ProjectNotFoundException(projectId);
        }

        return reviewRepository.findByProjectId(projectId);
    }

    public ProjectStatus mapDecisionToStatus(ReviewDecision decision) {

        switch (decision) {
            case APPROVE:
                return ProjectStatus.APPROVED;

            case REJECT:
                return ProjectStatus.REJECTED;

            case REQUEST_CHANGES:
                return ProjectStatus.UNDER_REVIEW;

            default:
                throw new InvalidStateTransitionException("Unsupported decision");
        }
    }

    public void recordAudit(User actor,
                            AuditActionType actionType,
                            AuditTargetType targetType,
                            Long targetId,
                            String metadata) {

        auditService.record(actor, actionType, targetType, targetId, metadata);
    }
}