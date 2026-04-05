package com.projectrepo.projectreposystem.dto;

import jakarta.validation.constraints.*;
import com.projectrepo.projectreposystem.domain.model.ReviewDecision;

public class ReviewRequest {

    private Long reviewerId;

    @NotNull
    private ReviewDecision decision;

    private String comment;

    public Long getReviewerId() {
        return reviewerId;
    }

    public ReviewDecision getDecision() {
        return decision;
    }

    public String getComment() {
        return comment;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public void setDecision(ReviewDecision decision) {
        this.decision = decision;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}