
package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClauseRepository extends JpaRepository<Clause, Long> {
    List<Clause> findByDocumentId(Long documentId);
}