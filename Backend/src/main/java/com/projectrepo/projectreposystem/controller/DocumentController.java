package com.projectrepo.projectreposystem.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.util.List;
import java.nio.file.Path;

import com.projectrepo.projectreposystem.service.DocumentService;
import com.projectrepo.projectreposystem.repository.UserRepository;
import com.projectrepo.projectreposystem.domain.model.*;
import com.projectrepo.projectreposystem.dto.DocumentUploadRequest;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    public DocumentController(DocumentService documentService,
                              UserRepository userRepository) {
        this.documentService = documentService;
        this.userRepository = userRepository;
    }

    @PreAuthorize("(hasRole('CONTRIBUTOR') and @projectSecurity.isProjectMember(#projectId, authentication)) or hasRole('ADMIN')")
    @PostMapping(value = "/{projectId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public DocumentVersion uploadDocumentFile(@PathVariable Long projectId,
                                              @RequestPart("file") MultipartFile file,
                                              Authentication authentication) {

        String email = authentication.getName();

        User uploader = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return documentService.uploadDocument(projectId, uploader, file);
    }

    @PreAuthorize("(hasRole('CONTRIBUTOR') and @projectSecurity.isProjectMember(#projectId, authentication)) or hasRole('ADMIN')")
    @PostMapping("/{projectId}")
    public DocumentVersion uploadDocument(@PathVariable Long projectId,
                                          @Valid @RequestBody DocumentUploadRequest request,
                                          Authentication authentication) {

        String email = authentication.getName();

        User uploader = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return documentService.uploadDocument(
                projectId,
                uploader,
                request.getFileName(),
                request.getStoragePath()
        );
    }

    @PreAuthorize("@projectSecurity.isProjectMember(#projectId, authentication) or hasRole('ADMIN') or hasRole('REVIEWER')")
    @GetMapping("/{projectId}")
    public List<DocumentVersion> getProjectDocuments(@PathVariable Long projectId) {
        return documentService.getProjectDocuments(projectId);
    }

    @PreAuthorize("@projectSecurity.isProjectMember(#projectId, authentication) or hasRole('ADMIN') or hasRole('REVIEWER')")
    @GetMapping("/{projectId}/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long projectId,
                                                     @PathVariable Long documentId) {

        Path filePath = documentService.resolveDocumentPath(projectId, documentId);
        Resource resource;

        try {
            resource = new UrlResource(filePath.toUri());
        } catch (Exception e) {
            throw new RuntimeException("Unable to load document", e);
        }

        String fileName = filePath.getFileName().toString();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}