package com.projectrepo.projectreposystem.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;


import com.projectrepo.projectreposystem.repository.*;

import com.projectrepo.projectreposystem.domain.model.*;
import com.projectrepo.projectreposystem.exception.InvalidStateTransitionException;
import com.projectrepo.projectreposystem.exception.ProjectNotFoundException;

import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.io.IOException;
import java.io.InputStream;

@Service
public class DocumentService {

    private final ProjectRepository projectRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final AuditService auditService;
    private final Path storageRoot;

    public DocumentService(ProjectRepository projectRepository,
                           DocumentVersionRepository documentVersionRepository,
                           AuditService auditService,
                           @Value("${app.documents.storage-dir:uploads/documents}") String storageDir) {
        this.projectRepository = projectRepository;
        this.documentVersionRepository = documentVersionRepository;
        this.auditService = auditService;
        this.storageRoot = Path.of(storageDir).toAbsolutePath().normalize();
    }

    @Transactional
    public DocumentVersion uploadDocument(Long projectId,
                                          User uploader,
                                          MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (!isUploadAllowedStatus(project.getStatus())) {
            throw new InvalidStateTransitionException("Documents can only be uploaded when project is in DRAFT or UNDER_REVIEW");
        }

        int nextVersion = computeNextVersion(projectId);
        String originalName = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String fileName = Path.of(originalName).getFileName().toString();

        Path projectDir = storageRoot.resolve("project-" + projectId).normalize();
        String storedFileName = "v" + nextVersion + "-" + System.currentTimeMillis() + "-" + fileName;
        Path targetFile = projectDir.resolve(storedFileName).normalize();

        if (!targetFile.startsWith(projectDir)) {
            throw new IllegalArgumentException("Invalid file path");
        }

        try {
            Files.createDirectories(projectDir);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store document", e);
        }

        DocumentVersion doc = new DocumentVersion();
        doc.setProject(project);
        doc.setUploadedBy(uploader);
        doc.setVersionNumber(nextVersion);
        doc.setFileName(fileName);
        doc.setStoragePath(targetFile.toString());

        DocumentVersion savedDoc = documentVersionRepository.save(doc);

        recordAudit(uploader,
                AuditActionType.DOCUMENT_UPLOADED,
                AuditTargetType.PROJECT,
                projectId,
                "Uploaded document version " + nextVersion);

        return savedDoc;
    }

    @Transactional
    public DocumentVersion uploadDocument(Long projectId,
                                          User uploader,
                                          String fileName,
                                          String storagePath) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        if (!isUploadAllowedStatus(project.getStatus())) {
            throw new InvalidStateTransitionException("Documents can only be uploaded when project is in DRAFT or UNDER_REVIEW");
        }

        int nextVersion = computeNextVersion(projectId);

        DocumentVersion doc = new DocumentVersion();
        doc.setProject(project);
        doc.setUploadedBy(uploader);
        doc.setVersionNumber(nextVersion);
        doc.setFileName(fileName);
        doc.setStoragePath(storagePath);

        DocumentVersion savedDoc = documentVersionRepository.save(doc);

        recordAudit(uploader,
                AuditActionType.DOCUMENT_UPLOADED,
                AuditTargetType.PROJECT,
                projectId,
                "Uploaded document version " + nextVersion);

        return savedDoc;
    }

    public Path resolveDocumentPath(Long projectId,
                                    Long documentId) {

        DocumentVersion document = documentVersionRepository
                .findByIdAndProjectId(documentId, projectId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found for project"));

        Path path = Path.of(document.getStoragePath()).normalize();

        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            throw new IllegalArgumentException("Document file does not exist");
        }

        return path;
    }

    public List<DocumentVersion> getProjectDocuments(Long projectId) {

        if (!projectRepository.existsById(projectId)) {
            throw new ProjectNotFoundException(projectId);
        }

        return documentVersionRepository.findByProjectId(projectId);
    }

    private int computeNextVersion(Long projectId) {

        Optional<DocumentVersion> latest =
                documentVersionRepository.findTopByProjectIdOrderByVersionNumberDesc(projectId);

        return latest.map(document -> document.getVersionNumber() + 1)
                .orElse(1);
    }

    private boolean isUploadAllowedStatus(ProjectStatus status) {
        return status == ProjectStatus.DRAFT || status == ProjectStatus.UNDER_REVIEW;
    }

    private void recordAudit(User actor,
                             AuditActionType actionType,
                             AuditTargetType targetType,
                             Long targetId,
                             String metadata) {

        auditService.record(actor, actionType, targetType, targetId, metadata);
    }
}