package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "clauses")
public class Clause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int clauseNumber;
    private double ambiguityScore;

    @Column(columnDefinition = "TEXT")
    private String text;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private PolicyDocument document;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getClauseNumber() { return clauseNumber; }
    public void setClauseNumber(int clauseNumber) { this.clauseNumber = clauseNumber; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public PolicyDocument getDocument() { return document; }
    public void setDocument(PolicyDocument document) { this.document = document; }
    public double getAmbiguityScore() { return ambiguityScore; }
    public void setAmbiguityScore(double ambiguityScore) { this.ambiguityScore = ambiguityScore; }

}