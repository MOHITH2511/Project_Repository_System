package com.projectrepo.projectreposystem.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import java.util.List;

import com.projectrepo.projectreposystem.service.ReviewService;
import com.projectrepo.projectreposystem.domain.model.*;
import com.projectrepo.projectreposystem.dto.ReviewRequest;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PreAuthorize("@reviewSecurity.canReviewProject(#projectId, authentication)")
    @PostMapping("/{projectId}")
    public Review addReview(@PathVariable Long projectId,
                            @Valid @RequestBody ReviewRequest request,
                            Authentication authentication) {

        String email = authentication.getName();

        return reviewService.addReview(
                projectId,
                email,
                request.getDecision(),
                request.getComment()
        );
    }

    @PreAuthorize("@projectSecurity.isProjectMember(#projectId, authentication) or hasRole('ADMIN') or hasRole('REVIEWER')")
    @GetMapping("/project/{projectId}")
    public List<Review> getProjectReviews(@PathVariable Long projectId) {
        return reviewService.getProjectReviews(projectId);
    }
}