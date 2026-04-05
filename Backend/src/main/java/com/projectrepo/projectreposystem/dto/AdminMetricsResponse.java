package com.projectrepo.projectreposystem.dto;

public class AdminMetricsResponse {

    private final long storageUsedBytes;
    private final long totalDocuments;
    private final long projectsCreatedThisMonth;

    public AdminMetricsResponse(long storageUsedBytes,
                                long totalDocuments,
                                long projectsCreatedThisMonth) {
        this.storageUsedBytes = storageUsedBytes;
        this.totalDocuments = totalDocuments;
        this.projectsCreatedThisMonth = projectsCreatedThisMonth;
    }

    public long getStorageUsedBytes() {
        return storageUsedBytes;
    }

    public long getTotalDocuments() {
        return totalDocuments;
    }

    public long getProjectsCreatedThisMonth() {
        return projectsCreatedThisMonth;
    }
}
