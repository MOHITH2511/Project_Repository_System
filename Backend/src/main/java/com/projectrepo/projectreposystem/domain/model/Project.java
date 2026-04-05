package com.projectrepo.projectreposystem.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects",
       indexes = {
               @Index(name = "idx_project_status", columnList = "status"),
               @Index(name = "idx_project_department", columnList = "department"),
               @Index(name = "idx_project_created", columnList = "createdAt")
       } )
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "abstract_text", length = 2000)
    private String abstractText;

    @Column(nullable = false)
    private String department;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "technology_stack")
    private String technologyStack;

    @Column(name = "git_repository_url")
    private String gitRepositoryUrl;

    @ManyToOne
    @JoinColumn(name = "faculty_guide_id")
    private User facultyGuide;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_modified_at", nullable = false)
    private LocalDateTime lastModifiedAt;

    public Project() {
        this.status = ProjectStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
        this.lastModifiedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public String getAbstractText() {
        return abstractText;
    }

    public void setAbstractText(String abstractText) {
        this.abstractText = abstractText;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public String getTechnologyStack() {
        return technologyStack;
    }

    public void setTechnologyStack(String technologyStack) {
        this.technologyStack = technologyStack;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public String getGitRepositoryUrl() {
        return gitRepositoryUrl;
    }

    public void setGitRepositoryUrl(String gitRepositoryUrl) {
        this.gitRepositoryUrl = gitRepositoryUrl;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public User getFacultyGuide() {
        return facultyGuide;
    }

    public void setFacultyGuide(User facultyGuide) {
        this.facultyGuide = facultyGuide;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
        this.lastModifiedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getLastModifiedAt() {
        return lastModifiedAt;
    }
}