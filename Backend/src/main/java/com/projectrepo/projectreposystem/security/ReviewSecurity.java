package com.projectrepo.projectreposystem.security;

import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;

import com.projectrepo.projectreposystem.repository.*;
import com.projectrepo.projectreposystem.domain.model.*;

@Component("reviewSecurity")
public class ReviewSecurity {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

        public ReviewSecurity(ReviewRepository reviewRepository,
                          UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public boolean canReviewProject(Long projectId,
                                    Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.REVIEWER) {
            return false;
        }

        return true;
    }

    public boolean isReviewOwner(Long reviewId,
                                 Authentication authentication) {

        String email = authentication.getName();

        return reviewRepository
                    .existsByIdAndReviewerEmail(reviewId, email);
    }
}