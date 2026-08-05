package com.example.demo;

import jakarta.persistence.*;

@Entity
@Table(name = "obligations")
public class Obligation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String responsibleEntity;
    private String modal;
    private String strength;
    private String action;

    @Column(columnDefinition = "TEXT")
    private String sourceClause;

    @ManyToOne
    @JoinColumn(name = "document_id")
    private PolicyDocument document;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResponsibleEntity() { return responsibleEntity; }
    public void setResponsibleEntity(String responsibleEntity) { this.responsibleEntity = responsibleEntity; }

    public String getModal() { return modal; }
    public void setModal(String modal) { this.modal = modal; }

    public String getStrength() { return strength; }
    public void setStrength(String strength) { this.strength = strength; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getSourceClause() { return sourceClause; }
    public void setSourceClause(String sourceClause) { this.sourceClause = sourceClause; }

    public PolicyDocument getDocument() { return document; }
    public void setDocument(PolicyDocument document) { this.document = document; }
}