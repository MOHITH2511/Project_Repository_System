package com.projectrepo.projectreposystem.service;

import com.projectrepo.projectreposystem.dto.AdminMetricsResponse;
import com.projectrepo.projectreposystem.repository.DocumentVersionRepository;
import com.projectrepo.projectreposystem.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AdminService {

    private final DocumentVersionRepository documentVersionRepository;
    private final ProjectRepository projectRepository;
    private final Path storageRoot;

    public AdminService(DocumentVersionRepository documentVersionRepository,
                        ProjectRepository projectRepository,
                        @Value("${app.documents.storage-dir:uploads/documents}") String storageDir) {
        this.documentVersionRepository = documentVersionRepository;
        this.projectRepository = projectRepository;
        this.storageRoot = Path.of(storageDir).toAbsolutePath().normalize();
    }

    public AdminMetricsResponse getMetrics() {
        long storageUsedBytes = calculateDirectorySize(storageRoot);
        long totalDocuments = documentVersionRepository.count();

        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long projectsCreatedThisMonth = projectRepository.countByCreatedAtAfter(monthStart);

        return new AdminMetricsResponse(storageUsedBytes, totalDocuments, projectsCreatedThisMonth);
    }

    private long calculateDirectorySize(Path dir) {
        if (!Files.exists(dir)) {
            return 0L;
        }

        try (var paths = Files.walk(dir)) {
            return paths
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException e) {
                            return 0L;
                        }
                    })
                    .sum();
        } catch (IOException e) {
            return 0L;
        }
    }
}
