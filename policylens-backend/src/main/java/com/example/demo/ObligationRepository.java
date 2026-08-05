package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ObligationRepository extends JpaRepository<Obligation, Long> {
    List<Obligation> findByDocumentId(Long documentId);
}