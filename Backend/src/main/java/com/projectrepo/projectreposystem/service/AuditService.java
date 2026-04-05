package com.projectrepo.projectreposystem.service;

import org.springframework.stereotype.Service;

import com.projectrepo.projectreposystem.repository.AuditLogRepository;
import com.projectrepo.projectreposystem.domain.model.*;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void record(User actor,
                       AuditActionType actionType,
                       AuditTargetType targetType,
                       Long targetId,
                       String description) {

        AuditLog log = new AuditLog();
        log.setActor(actor);
        log.setActionType(actionType);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setMetadata(description);

        auditLogRepository.save(log);
    }
}