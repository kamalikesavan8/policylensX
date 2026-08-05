package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClauseRelationRepository extends JpaRepository<ClauseRelation, Long> {
    List<ClauseRelation> findByDocumentId(Long documentId);
}