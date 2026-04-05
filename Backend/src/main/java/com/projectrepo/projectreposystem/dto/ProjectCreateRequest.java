package com.projectrepo.projectreposystem.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class ProjectCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title too long")
    private String title;

    @Size(max = 2000, message = "Abstract too long")
    private String abstractText;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private String technologyStack;
    private String gitRepositoryUrl;
    private Long facultyGuideId;
    private List<Long> teamMemberIds;

    public String getTitle() {
        return title;
    }

    public String getAbstractText() {
        return abstractText;
    }

    public String getDepartment() {
        return department;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public String getTechnologyStack() {
        return technologyStack;
    }

    public String getGitRepositoryUrl() {
        return gitRepositoryUrl;
    }

    public Long getFacultyGuideId() {
        return facultyGuideId;
    }

    public List<Long> getTeamMemberIds() {
        return teamMemberIds;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setAbstractText(String abstractText) {
        this.abstractText = abstractText;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public void setTechnologyStack(String technologyStack) {
        this.technologyStack = technologyStack;
    }

    public void setGitRepositoryUrl(String gitRepositoryUrl) {
        this.gitRepositoryUrl = gitRepositoryUrl;
    }

    public void setFacultyGuideId(Long facultyGuideId) {
        this.facultyGuideId = facultyGuideId;
    }

    public void setTeamMemberIds(List<Long> teamMemberIds) {
        this.teamMemberIds = teamMemberIds;
    }
}