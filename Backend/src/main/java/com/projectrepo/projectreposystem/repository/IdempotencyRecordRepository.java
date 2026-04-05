package com.projectrepo.projectreposystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectrepo.projectreposystem.domain.model.IdempotencyRecord;

public interface IdempotencyRecordRepository extends JpaRepository<IdempotencyRecord, Long> {

    boolean existsByIdempotencyKey(String idempotencyKey);
}