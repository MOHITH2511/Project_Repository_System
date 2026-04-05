package com.projectrepo.projectreposystem.dto;

import jakarta.validation.constraints.*;

public class DocumentUploadRequest {

    private Long uploaderId;

    @NotBlank(message = "File name required")
    private String fileName;

    @NotBlank(message = "Storage path required")
    private String storagePath;

    public Long getUploaderId() {
        return uploaderId;
    }

    public String getFileName() {
        return fileName;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setUploaderId(Long uploaderId) {
        this.uploaderId = uploaderId;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }
}