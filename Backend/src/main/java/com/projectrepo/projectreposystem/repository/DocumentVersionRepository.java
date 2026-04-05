package com.projectrepo.projectreposystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectrepo.projectreposystem.domain.model.DocumentVersion;

import java.util.List;
import java.util.Optional;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    List<DocumentVersion> findByProjectId(Long projectId);

    Optional<DocumentVersion> findByProjectIdAndVersionNumber(Long projectId, int versionNumber);

    Optional<DocumentVersion> findByIdAndProjectId(Long id, Long projectId);

    Optional<DocumentVersion> findTopByProjectIdOrderByVersionNumberDesc(Long projectId);
}