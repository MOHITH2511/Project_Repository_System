package com.projectrepo.projectreposystem.security;

import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;

import com.projectrepo.projectreposystem.repository.*;
import com.projectrepo.projectreposystem.domain.model.*;

@Component("projectSecurity")
public class ProjectSecurity {

    private final ProjectMemberRepository memberRepository;
    private final ProjectRepository projectRepository;

        public ProjectSecurity(ProjectMemberRepository memberRepository,
                              ProjectRepository projectRepository) {
        this.memberRepository = memberRepository;
        this.projectRepository = projectRepository;
    }

    public boolean isProjectMember(Long projectId,
                                   Authentication authentication) {

        String email = authentication.getName();

        return memberRepository
                .existsByProjectIdAndUserEmail(projectId, email);
    }

    public boolean isProjectLeader(Long projectId,
                                   Authentication authentication) {

        String email = authentication.getName();

        return memberRepository
            .existsByProjectIdAndUserEmailAndMemberRole(
                        projectId,
                        email,
                        ProjectMemberRole.LEADER
                );
    }

    public boolean canEditProject(Long projectId,
                                  Authentication authentication) {

        if (isProjectLeader(projectId, authentication)) {
            return true;
        }

        if (!isProjectMember(projectId, authentication)) {
            return false;
        }

        return projectRepository.findById(projectId)
                .map(project -> project.getStatus() == ProjectStatus.UNDER_REVIEW)
                .orElse(false);
    }
}