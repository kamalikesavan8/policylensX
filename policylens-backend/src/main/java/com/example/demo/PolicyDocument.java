package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_documents")
public class PolicyDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private LocalDateTime uploadedAt = LocalDateTime.now();
    private double completenessScore;
    
    @ElementCollection
    private java.util.List<String> missingSections;

    private double legalRisk;
    private double complianceRisk;
    private double operationalRisk;
    private double overallRiskScore;
    @ElementCollection
    private java.util.List<String> riskReasons;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public double getCompletenessScore() { return completenessScore; }
    public void setCompletenessScore(double completenessScore) { this.completenessScore = completenessScore; }

    public java.util.List<String> getMissingSections() { return missingSections; }
    public void setMissingSections(java.util.List<String> missingSections) { this.missingSections = missingSections; }

    public double getLegalRisk() { return legalRisk; }
    public void setLegalRisk(double legalRisk) { this.legalRisk = legalRisk; }

    public double getComplianceRisk() { return complianceRisk; }
    public void setComplianceRisk(double complianceRisk) { this.complianceRisk = complianceRisk; }

    public double getOperationalRisk() { return operationalRisk; }
    public void setOperationalRisk(double operationalRisk) { this.operationalRisk = operationalRisk; }

    public double getOverallRiskScore() { return overallRiskScore; }
    public void setOverallRiskScore(double overallRiskScore) { this.overallRiskScore = overallRiskScore; }

    public java.util.List<String> getRiskReasons() { return riskReasons; }
    public void setRiskReasons(java.util.List<String> riskReasons) { this.riskReasons = riskReasons; }
}