package com.projectrepo.projectreposystem.domain.model;

public enum AuditActionType {
    PROJECT_CREATED,
    PROJECT_UPDATED,
    PROJECT_SUBMITTED,
    PROJECT_APPROVED,
    PROJECT_REJECTED,

    DOCUMENT_UPLOADED,

    USER_CREATED,
    USER_DEACTIVATED,

    REVIEW_ADDED
}