package com.projectrepo.projectreposystem.repository.spec;

import org.springframework.data.jpa.domain.Specification;
import com.projectrepo.projectreposystem.domain.model.*;

public class ProjectSpecifications {

    public static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, query, cb) ->
                status == null ? null :
                        cb.equal(root.get("status"), status);
    }

    public static Specification<Project> hasDepartment(String department) {
        return (root, query, cb) ->
                department == null ? null :
                        cb.equal(root.get("department"), department);
    }

    public static Specification<Project> hasAcademicYear(String year) {
        return (root, query, cb) ->
                year == null ? null :
                        cb.equal(root.get("academicYear"), year);
    }

    public static Specification<Project> titleContains(String keyword) {
        return (root, query, cb) ->
                keyword == null ? null :
                        cb.like(cb.lower(root.get("title")),
                                "%" + keyword.toLowerCase() + "%");
    }
}