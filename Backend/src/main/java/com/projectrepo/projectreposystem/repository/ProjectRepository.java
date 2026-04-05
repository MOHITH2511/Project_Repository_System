package com.projectrepo.projectreposystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.*;
import java.time.LocalDateTime;
import com.projectrepo.projectreposystem.domain.model.Project;
import com.projectrepo.projectreposystem.domain.model.ProjectStatus;

public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

    Page<Project> findByDepartment(String department, Pageable pageable);

    long countByCreatedAtAfter(LocalDateTime createdAt);

}