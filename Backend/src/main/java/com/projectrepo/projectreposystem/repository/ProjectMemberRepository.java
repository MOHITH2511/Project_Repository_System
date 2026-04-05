package com.projectrepo.projectreposystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectrepo.projectreposystem.domain.model.ProjectMember;
import com.projectrepo.projectreposystem.domain.model.ProjectMemberRole;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProjectId(Long projectId);

    List<ProjectMember> findByUserId(Long userId);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    boolean existsByProjectIdAndUserEmail(Long projectId, String email);

    boolean existsByProjectIdAndUserEmailAndMemberRole(
            Long projectId,
            String email,
            ProjectMemberRole role
    );

    long countByUserId(Long userId);
}