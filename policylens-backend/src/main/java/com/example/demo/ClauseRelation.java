
package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "clause_relations")
public class ClauseRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int clauseIndex1;
    private int clauseIndex2;
    private double similarity;
    private String type; // "duplicate" or "contradiction"

    @ManyToOne
    @JoinColumn(name = "document_id")
    private PolicyDocument document;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getClauseIndex1() { return clauseIndex1; }
    public void setClauseIndex1(int clauseIndex1) { this.clauseIndex1 = clauseIndex1; }

    public int getClauseIndex2() { return clauseIndex2; }
    public void setClauseIndex2(int clauseIndex2) { this.clauseIndex2 = clauseIndex2; }

    public double getSimilarity() { return similarity; }
    public void setSimilarity(double similarity) { this.similarity = similarity; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public PolicyDocument getDocument() { return document; }
    public void setDocument(PolicyDocument document) { this.document = document; }
}