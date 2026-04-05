package com.projectrepo.projectreposystem.dto;

import com.projectrepo.projectreposystem.domain.model.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;

public class ProjectMemberRequest {

    @NotNull(message = "User id required")
    private Long userId;

    @NotNull(message = "Member role required")
    private ProjectMemberRole memberRole;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public ProjectMemberRole getMemberRole() {
        return memberRole;
    }

    public void setMemberRole(ProjectMemberRole memberRole) {
        this.memberRole = memberRole;
    }
}
