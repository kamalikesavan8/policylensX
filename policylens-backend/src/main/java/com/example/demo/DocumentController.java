package com.example.demo;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Chunk;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import java.io.ByteArrayOutputStream;
import org.apache.tika.Tika;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "https://policylens-frontend.onrender.com")

public class DocumentController {
    @Value("${nlp.service.url}")
private String nlpServiceUrl;

    private final PolicyDocumentRepository documentRepository;
    private final ClauseRepository clauseRepository;
    private final Tika tika = new Tika();
    private final RestTemplate restTemplate = new RestTemplate();
    private final ClauseRelationRepository clauseRelationRepository;
    private final ObligationRepository obligationRepository;

public DocumentController(PolicyDocumentRepository documentRepository, ClauseRepository clauseRepository,
                           ClauseRelationRepository clauseRelationRepository, ObligationRepository obligationRepository) {
    this.documentRepository = documentRepository;
    this.clauseRepository = clauseRepository;
    this.clauseRelationRepository = clauseRelationRepository;
    this.obligationRepository = obligationRepository;
}



    

    @PostMapping("/upload")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file) {
        try {
            String text = tika.parseToString(file.getInputStream());
            PolicyDocument doc = new PolicyDocument();
            doc.setFileName(file.getOriginalFilename());
            doc.setExtractedText(text);
            documentRepository.save(doc);
            return processTextAndSave(doc, text);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Upload failed: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/analyze-text")
    public Map<String, Object> analyzeText(@RequestBody Map<String, String> body) {
        try {
            String text = body.get("text");
            PolicyDocument doc = new PolicyDocument();
            doc.setFileName("Pasted Text");
            doc.setExtractedText(text);
            documentRepository.save(doc);
            return processTextAndSave(doc, text);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Analysis failed: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/analyze-url")
public Map<String, Object> analyzeUrl(@RequestBody Map<String, String> body) {
    try {
        String url = body.get("url");
        org.jsoup.nodes.Document webPage = org.jsoup.Jsoup.connect(url)
            .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36")
            .timeout(15000)
            .get();
        String text = webPage.body().text();

        // Cap extremely long pages to keep processing time reasonable
        if (text.length() > 15000) {
            text = text.substring(0, 15000);
        }

        PolicyDocument doc = new PolicyDocument();
        doc.setFileName(url);
        doc.setExtractedText(text);
        documentRepository.save(doc);
        return processTextAndSave(doc, text);
    } catch (Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "URL analysis failed: " + e.getMessage());
        return response;
    }
}
    @GetMapping("/{id}/clauses")
    public List<Clause> getClauses(@PathVariable Long id) {
        return clauseRepository.findByDocumentId(id);
    }
    @GetMapping("/{id}/relations")
public List<ClauseRelation> getRelations(@PathVariable Long id) {
    return clauseRelationRepository.findByDocumentId(id);
}
@GetMapping("/{id}/obligations")
public List<Obligation> getObligations(@PathVariable Long id) {
    return obligationRepository.findByDocumentId(id);
}
@GetMapping
public List<PolicyDocument> getAllDocuments() {
    return documentRepository.findAll();
}
@GetMapping("/{id}/report/pdf")
public ResponseEntity<byte[]> downloadPdfReport(@PathVariable Long id) throws Exception {
    PolicyDocument doc = documentRepository.findById(id).orElseThrow();
    List<Clause> clauses = clauseRepository.findByDocumentId(id);
    List<ClauseRelation> relations = clauseRelationRepository.findByDocumentId(id);
    List<Obligation> obligations = obligationRepository.findByDocumentId(id);

    ByteArrayOutputStream out = new ByteArrayOutputStream();
    Document pdf = new Document();
    PdfWriter.getInstance(pdf, out);
    pdf.open();

    Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
    Font headingFont = new Font(Font.HELVETICA, 13, Font.BOLD);
    Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL);
    Font smallFont = new Font(Font.HELVETICA, 8, Font.NORMAL);

    pdf.add(new Paragraph("PolicyLens Analysis Report", titleFont));
    pdf.add(new Paragraph(doc.getFileName(), headingFont));
    pdf.add(new Paragraph("Generated: " + java.time.LocalDateTime.now(), smallFont));
    pdf.add(Chunk.NEWLINE);

    pdf.add(new Paragraph("Overall Risk Score: " + doc.getOverallRiskScore() + "/100", headingFont));
    pdf.add(Chunk.NEWLINE);

    pdf.add(new Paragraph("Risk Breakdown", headingFont));
    if (doc.getRiskReasons() != null) {
        for (String reason : doc.getRiskReasons()) pdf.add(new Paragraph("- " + reason, normalFont));
    }
    pdf.add(Chunk.NEWLINE);

    pdf.add(new Paragraph("Missing Sections", headingFont));
    if (doc.getMissingSections() != null && !doc.getMissingSections().isEmpty()) {
        for (String s : doc.getMissingSections()) pdf.add(new Paragraph("- " + s, normalFont));
    } else {
        pdf.add(new Paragraph("None - all expected sections present.", normalFont));
    }
    pdf.add(Chunk.NEWLINE);

    pdf.add(new Paragraph("Clauses (" + clauses.size() + ")", headingFont));
    PdfPTable clauseTable = new PdfPTable(3);
    clauseTable.setWidths(new float[]{1, 6, 2});
    clauseTable.addCell("#"); clauseTable.addCell("Text"); clauseTable.addCell("Ambiguity");
    for (Clause c : clauses) {
        clauseTable.addCell(String.valueOf(c.getClauseNumber()));
        clauseTable.addCell(c.getText());
        clauseTable.addCell(String.valueOf(Math.round(c.getAmbiguityScore())));
    }
    pdf.add(clauseTable);
    pdf.add(Chunk.NEWLINE);

    pdf.add(new Paragraph("Duplicates & Contradictions (" + relations.size() + ")", headingFont));
    if (relations.isEmpty()) pdf.add(new Paragraph("None detected.", normalFont));
    for (ClauseRelation r : relations) {
        pdf.add(new Paragraph(r.getType() + " - similarity " + r.getSimilarity() + " (clause " + r.getClauseIndex1() + " & " + r.getClauseIndex2() + ")", normalFont));
    }
    pdf.add(Chunk.NEWLINE);

    pdf.add(new Paragraph("Obligations (" + obligations.size() + ")", headingFont));
    PdfPTable oblTable = new PdfPTable(4);
    oblTable.addCell("Entity"); oblTable.addCell("Modal"); oblTable.addCell("Strength"); oblTable.addCell("Action");
    for (Obligation o : obligations) {
        oblTable.addCell(o.getResponsibleEntity());
        oblTable.addCell(o.getModal());
        oblTable.addCell(o.getStrength());
        oblTable.addCell(o.getAction());
    }
    pdf.add(oblTable);

    pdf.close();

    return ResponseEntity.ok()
        .header("Content-Disposition", "attachment; filename=policylens-report.pdf")
        .contentType(MediaType.APPLICATION_PDF)
        .body(out.toByteArray());
}

    // ---- Shared logic used by all three entry points ----
    private Map<String, Object> processTextAndSave(PolicyDocument doc, String text) {
        Map<String, Object> response = new HashMap<>();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 1. Split into clauses
        Map<String, String> nlpRequest = new HashMap<>();
        nlpRequest.put("text", text);
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(nlpRequest, headers);

        Map nlpResponse = restTemplate.postForObject(
            nlpServiceUrl + "/analyze/clauses", requestEntity, Map.class
        );
        List<Map<String, Object>> clauseList = (List<Map<String, Object>>) nlpResponse.get("clauses");

        // 2. Ambiguity score per clause
       // 2. Ambiguity score for ALL clauses in one batch call (avoids N sequential requests)
List<String> allClauseTexts = new ArrayList<>();
for (Map<String, Object> c : clauseList) {
    allClauseTexts.add((String) c.get("text"));
}

Map<String, Object> batchRequest = new HashMap<>();
batchRequest.put("clauses", allClauseTexts);
HttpEntity<Map<String, Object>> batchEntity = new HttpEntity<>(batchRequest, headers);

Map batchResponse = restTemplate.postForObject(
    nlpServiceUrl + "/analyze/ambiguity-batch", batchEntity, Map.class
);
List<Map<String, Object>> ambiguityResults = (List<Map<String, Object>>) batchResponse.get("results");

for (int i = 0; i < clauseList.size(); i++) {
    Map<String, Object> c = clauseList.get(i);
    Clause clause = new Clause();
    clause.setClauseNumber((Integer) c.get("clauseNumber"));
    clause.setText((String) c.get("text"));
    clause.setDocument(doc);
    clause.setAmbiguityScore(((Number) ambiguityResults.get(i).get("ambiguityScore")).doubleValue());
    clauseRepository.save(clause);
}

        // 3. Completeness check on the whole document
        Map completenessResponse = restTemplate.postForObject(
            nlpServiceUrl + "/analyze/completeness", requestEntity, Map.class
        );
        
        doc.setCompletenessScore(((Number) completenessResponse.get("completenessScore")).doubleValue());
        doc.setMissingSections((List<String>) completenessResponse.get("missingSections"));
        documentRepository.save(doc);
        // 4. Duplicate/contradiction detection
List<String> clauseTexts = new ArrayList<>();
for (Map<String, Object> c : clauseList) {
    clauseTexts.add((String) c.get("text"));
}
Map<String, Object> dupRequest = new HashMap<>();
dupRequest.put("clauses", clauseTexts);
HttpEntity<Map<String, Object>> dupEntity = new HttpEntity<>(dupRequest, headers);

Map dupResponse = restTemplate.postForObject(
    nlpServiceUrl + "/analyze/duplicates", dupEntity, Map.class
);
List<Map<String, Object>> relationPairs = (List<Map<String, Object>>) dupResponse.get("pairs");

for (Map<String, Object> pair : relationPairs) {
    ClauseRelation relation = new ClauseRelation();
    relation.setClauseIndex1((Integer) pair.get("clauseIndex1"));
    relation.setClauseIndex2((Integer) pair.get("clauseIndex2"));
    relation.setSimilarity(((Number) pair.get("similarity")).doubleValue());
    relation.setType((String) pair.get("type"));
    relation.setDocument(doc);
    clauseRelationRepository.save(relation);
}

response.put("relationPairsFound", relationPairs.size());
// 5. Obligation extraction
Map obligationResponse = restTemplate.postForObject(
    nlpServiceUrl + "/analyze/obligations", requestEntity, Map.class
);
List<Map<String, Object>> obligationList = (List<Map<String, Object>>) obligationResponse.get("obligations");

for (Map<String, Object> o : obligationList) {
    Obligation obligation = new Obligation();
    obligation.setResponsibleEntity((String) o.get("responsibleEntity"));
    obligation.setModal((String) o.get("modal"));
    obligation.setStrength((String) o.get("strength"));
    obligation.setAction((String) o.get("action"));
    obligation.setSourceClause((String) o.get("sourceClause"));
    obligation.setDocument(doc);
    obligationRepository.save(obligation);
}

response.put("obligationsFound", obligationList.size());
// 6. Combined Risk Score
double totalAmbiguity = 0;
List<Clause> savedClauses = clauseRepository.findByDocumentId(doc.getId());
for (Clause c : savedClauses) {
    totalAmbiguity += c.getAmbiguityScore();
}
double legalRisk = savedClauses.isEmpty() ? 0 : totalAmbiguity / savedClauses.size();

double complianceRisk = 100 - doc.getCompletenessScore();

long contradictionCount = relationPairs.stream().filter(p -> "contradiction".equals(p.get("type"))).count();
long duplicateCount = relationPairs.stream().filter(p -> "duplicate".equals(p.get("type"))).count();
double operationalRisk = Math.min((contradictionCount * 20) + (duplicateCount * 10), 100);

double overallRisk = (0.35 * legalRisk) + (0.35 * complianceRisk) + (0.30 * operationalRisk);

List<String> reasons = new ArrayList<>();
reasons.add("Legal Risk: " + Math.round(legalRisk) + "/100 (average clause ambiguity)");
reasons.add("Compliance Risk: " + Math.round(complianceRisk) + "/100 (" + doc.getMissingSections().size() + " missing sections: " + String.join(", ", doc.getMissingSections()) + ")");
reasons.add("Operational Risk: " + Math.round(operationalRisk) + "/100 (" + contradictionCount + " contradictions, " + duplicateCount + " duplicates found)");

doc.setLegalRisk(Math.round(legalRisk * 100.0) / 100.0);
doc.setComplianceRisk(Math.round(complianceRisk * 100.0) / 100.0);
doc.setOperationalRisk(Math.round(operationalRisk * 100.0) / 100.0);
doc.setOverallRiskScore(Math.round(overallRisk * 100.0) / 100.0);
doc.setRiskReasons(reasons);
documentRepository.save(doc);

response.put("overallRiskScore", doc.getOverallRiskScore());
response.put("riskReasons", reasons);

        response.put("message", "Analyzed successfully");
        response.put("documentId", doc.getId());
        response.put("totalClauses", clauseList.size());
        response.put("completenessScore", doc.getCompletenessScore());
        return response;

        
    }
}