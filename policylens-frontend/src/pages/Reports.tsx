import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Printer, Share2, Eye, FileText, AlertTriangle, Tag } from "lucide-react";
import { Card, Button, Badge, Modal } from "../components/ui";
import { RiskGauge } from "../components/RiskGauge";
import { useDocument } from "../context/DocumentContext";
import { toast } from "sonner";
import { documentApi } from "../services/api";

function ExportCard({ icon: Icon, format, desc, color, bg, onClick }: any) {
  return (
    <Card hover className="p-5" onClick={onClick}>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
        <Icon size={22} className={color} />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{format}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">
        <Button variant="secondary" size="sm" className="w-full" icon={<Download size={13} />}>
          Export {format}
        </Button>
      </div>
    </Card>
  );
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export default function Reports() {
  const { currentResult } = useDocument();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [recentExports, setRecentExports] = useState<{ name: string; format: string; date: string }[]>([]);

  const fileName = currentResult?.document?.fileName || currentResult?.fileName || "Untitled Document";
  const clauses = currentResult?.clauses || [];
  const obligations = currentResult?.obligations || [];
  const relations = currentResult?.relations || [];
  const missingSections = currentResult?.document?.missingSections || [];
  const overallRisk = Math.round(currentResult?.document?.overallRiskScore ?? currentResult?.overallRiskScore ?? 0);
  const riskReasons: string[] = currentResult?.riskReasons || [];
  const highRiskCount = clauses.filter((c: any) => c.ambiguityScore > 60).length;

  const logExport = (format: string) => {
    setRecentExports((prev) => [{ name: fileName, format, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...prev]);
  };

  const handleExportJson = () => {
    if (!currentResult) return;
    downloadBlob(JSON.stringify(currentResult, null, 2), `${fileName}-report.json`, "application/json");
    logExport("JSON");
    toast.success("JSON report exported successfully", { description: fileName });
  };

  const handleExportCsv = () => {
    if (!currentResult) return;
    const clauseRows = [
      ["Clause Number", "Text", "Ambiguity Score"],
      ...clauses.map((c: any) => [c.clauseNumber, c.text, c.ambiguityScore]),
    ];
    const obligationRows = [
      [],
      ["Responsible Entity", "Modal", "Strength", "Action", "Source Clause"],
      ...obligations.map((o: any) => [o.responsibleEntity, o.modal, o.strength, o.action, o.sourceClause]),
    ];
    const csv = toCsv(clauseRows as any) + "\n" + toCsv(obligationRows as any);
    downloadBlob(csv, `${fileName}-report.csv`, "text/csv");
    logExport("CSV");
    toast.success("CSV report exported successfully", { description: fileName });
  };

 const handleExportPdf = async () => {
  if (!currentResult?.documentId) return;
  try {
    const blob = await documentApi.downloadPdf(currentResult.documentId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    logExport("PDF");
    toast.success("PDF report exported successfully", { description: fileName });
  } catch (err: any) {
    toast.error("PDF export failed: " + err.message);
  }
};

  if (!currentResult) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Reports</h1>
        <p className="text-sm text-muted-foreground mb-6">Export and share analysis reports</p>
        <Card className="p-10 text-center">
          <p className="text-sm text-muted-foreground">No document analyzed yet. Analyze a document or open one from History to export a report.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Export and share analysis reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>Print</Button>
          <Button variant="outline" size="sm" icon={<Share2 size={14} />} onClick={() => toast.success("Share link copied!")}>Share</Button>
          <Button size="sm" icon={<Eye size={14} />} onClick={() => setPreviewOpen(true)}>Preview Report</Button>
        </div>
      </div>

      {/* Current document */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText size={22} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{fileName}</h2>
            <p className="text-sm text-muted-foreground">{clauses.length} clauses · {relations.length} duplicates/contradictions · {obligations.length} obligations</p>
          </div>
          <Badge variant={overallRisk > 66 ? "high" : overallRisk > 33 ? "medium" : "low"}>{overallRisk} — {overallRisk > 66 ? "High" : overallRisk > 33 ? "Medium" : "Low"} Risk</Badge>
        </div>
      </Card>

      {/* Export formats */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Export Formats</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ExportCard icon={FileText} format="PDF" desc="Opens the browser print dialog — choose 'Save as PDF' (full formatted PDF generation is planned)" color="text-red-500" bg="bg-red-50" onClick={handleExportPdf} />
          <ExportCard icon={FileJson} format="JSON" desc="Full structured analysis data — clauses, obligations, duplicates, risk scores" color="text-blue-500" bg="bg-blue-50" onClick={handleExportJson} />
          <ExportCard icon={FileSpreadsheet} format="CSV" desc="Tabular clause and obligation data compatible with Excel and Google Sheets" color="text-green-500" bg="bg-green-50" onClick={handleExportCsv} />
        </div>
      </div>

      {/* Recent reports */}
      <Card>
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Exports (this session)</h2>
        </div>
        <div className="divide-y divide-border">
          {recentExports.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No exports yet this session.</div>
          ) : (
            recentExports.map((r, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Download size={13} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.format} · {r.date}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Report Preview — ${fileName}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button size="sm" icon={<Download size={13} />} onClick={() => { handleExportPdf(); setPreviewOpen(false); }}>Export PDF</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">PolicyLens Analysis Report</p>
              <p className="font-semibold text-foreground">{fileName}</p>
            </div>
            <RiskGauge score={overallRisk} size={120} />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[[String(clauses.length), "Clauses"], [String(highRiskCount), "High Risk"], [String(missingSections.length), "Missing"]].map(([v, l]) => (
              <div key={l} className="bg-muted rounded-lg py-3">
                <p className="text-lg font-bold text-foreground">{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Key Findings</p>
            <div className="space-y-2">
              {riskReasons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No risk reasons available.</p>
              ) : (
                riskReasons.map((reason, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={13} className="text-amber-500" />
                    <span className="flex-1 text-foreground">{reason}</span>
                  </div>
                ))
              )}
              {missingSections.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag size={13} className="text-red-500" />
                  <span className="flex-1 text-foreground">{missingSections.length} required sections missing: {missingSections.join(", ")}</span>
                  <Badge variant="high">high</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}