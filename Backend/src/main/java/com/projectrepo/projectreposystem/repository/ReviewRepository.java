package com.projectrepo.projectreposystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectrepo.projectreposystem.domain.model.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProjectId(Long projectId);

    List<Review> findByReviewerId(Long reviewerId);

    boolean existsByProjectIdAndReviewerEmail(Long projectId, String email);

    boolean existsByIdAndReviewerEmail(Long reviewId, String email);
}