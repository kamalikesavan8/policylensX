import { useState } from "react";
import { useNavigate } from "react-router";
import { Download, Share2, FileText, AlertTriangle, Layers, GitMerge, ClipboardList, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { RiskGauge } from "../components/RiskGauge";
import { Card, Badge, Button, Tabs, Modal, ProgressBar } from "../components/ui";
import { useDocument } from "../context/DocumentContext";
import { clsx } from "clsx";
import { useParams } from "react-router";
import { useEffect } from "react";
import { documentApi } from "../services/api";
import { toast } from "sonner";

interface UiClause {
  id: number;
  title: string;
  text: string;
  risk: "high" | "medium" | "low";
  type: string;
  section: string;
  confidence: number;
  explanation: string;
}

function ClauseCard({ clause }: { clause: UiClause }) {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className={clsx("rounded-xl border transition-all", clause.risk === "high" ? "border-red-200 bg-red-50/30" : clause.risk === "medium" ? "border-amber-200 bg-amber-50/30" : "border-green-200 bg-green-50/30")}>
        <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", clause.risk === "high" ? "bg-red-100" : clause.risk === "medium" ? "bg-amber-100" : "bg-green-100")}>
            <AlertTriangle size={15} className={clause.risk === "high" ? "text-red-600" : clause.risk === "medium" ? "text-amber-600" : "text-green-600"} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-semibold text-foreground">{clause.title}</span>
              <Badge variant={clause.risk as any}>{clause.risk.charAt(0).toUpperCase() + clause.risk.slice(1)} Risk</Badge>
              <Badge variant="default">{clause.type}</Badge>
              <span className="text-xs text-muted-foreground font-mono ml-auto">{clause.section}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{clause.text}</p>
          </div>
          <button className="text-muted-foreground shrink-0">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        </div>
        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
            <div className="bg-background rounded-lg p-3 text-sm text-foreground border border-border italic">
              "{clause.text}"
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">AI Explanation</p>
              <p className="text-xs text-blue-600">{clause.explanation}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Confidence: <span className="font-semibold text-foreground">{clause.confidence}%</span></span>
              <button onClick={() => setModalOpen(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                Full detail <ExternalLink size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={clause.title}
        footer={<Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>}
      >
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant={clause.risk as any}>{clause.risk.charAt(0).toUpperCase() + clause.risk.slice(1)} Risk</Badge>
            <Badge variant="default">{clause.type}</Badge>
            <Badge variant="info">{clause.section}</Badge>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clause Text</p>
            <blockquote className="text-sm text-foreground italic border-l-4 border-primary pl-3 bg-muted/30 py-2 pr-2 rounded-r-lg">"{clause.text}"</blockquote>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Explanation</p>
            <p className="text-sm text-foreground">{clause.explanation}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Confidence</p>
            <div className="flex items-center gap-3">
              <ProgressBar value={clause.confidence} color="blue" />
              <span className="text-sm font-semibold">{clause.confidence}%</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function Results() {
  const [tab, setTab] = useState("clauses");
  const navigate = useNavigate();
  const { currentResult,setCurrentResult } = useDocument();
  const { id } = useParams();

useEffect(() => {
  if (id && (!currentResult || String(currentResult.documentId) !== id)) {
    Promise.all([
      documentApi.getClauses(Number(id)),
      documentApi.getRelations(Number(id)),
      documentApi.getObligations(Number(id)),
    ]).then(([clauses, relations, obligations]) => {
      const doc = clauses[0]?.document || relations[0]?.document || obligations[0]?.document;
      setCurrentResult({
        documentId: Number(id),
        clauses, relations, obligations,
        overallRiskScore: doc?.overallRiskScore,
        riskReasons: doc?.riskReasons,
        document: doc,
      });
    });
  }
}, [id]);

  const clauses: UiClause[] = (currentResult?.clauses || []).map((c: any) => ({
    id: c.id,
    title: c.text.slice(0, 50) + "...",
    text: c.text,
    risk: c.ambiguityScore > 60 ? "high" : c.ambiguityScore > 30 ? "medium" : "low",
    type: "Ambiguity",
    section: `Clause ${c.clauseNumber}`,
    confidence: Math.round(c.ambiguityScore),
    explanation: `Ambiguity score: ${c.ambiguityScore}/100 based on vague language detected.`,
  }));

  const overallRisk = currentResult?.document?.overallRiskScore ?? currentResult?.overallRiskScore ?? 0;
  const riskReasons: string[] = currentResult?.riskReasons || [];

  const missingSections = (currentResult?.document?.missingSections || []).map((title: string, i: number) => ({
    id: i,
    title,
    regulation: "Expected policy section",
    required: true,
  }));

  const duplicates = (currentResult?.relations || []).map((r: any) => ({
    id: r.id,
    type: r.type,
    similarity: Math.round(r.similarity * 100),
    clause1: clauses[r.clauseIndex1]?.text || "(clause not found)",
    clause2: clauses[r.clauseIndex2]?.text || "(clause not found)",
  }));

  const obligations = (currentResult?.obligations || []).map((o: any) => ({
    id: o.id,
    entity: o.responsibleEntity,
    modal: o.modal,
    strength: o.strength.charAt(0).toUpperCase() + o.strength.slice(1),
    action: o.action,
    clause: o.sourceClause,
    risk: o.strength === "mandatory" ? "high" : o.strength === "recommended" ? "medium" : "low",
  }));

  const fileName = currentResult?.document?.fileName || currentResult?.fileName || "Analyzed Document";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate("/app/upload")} className="text-xs text-muted-foreground hover:text-foreground">Upload</button>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-medium text-foreground">Analysis Results</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{fileName}</h1>
          <p className="text-sm text-muted-foreground">{clauses.length} clauses analyzed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Share2 size={14} />} onClick={() => {
  const link = `${window.location.origin}/app/results/${currentResult?.documentId}`;
  navigator.clipboard.writeText(link);
  toast.success("Link copied to clipboard", { description: "Anyone logged into PolicyLens can open this exact analysis." });
}}>Share</Button>
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={() => navigate("/app/reports")}>Export</Button>
        </div>
      </div>

      {/* Risk overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center">
          <RiskGauge score={overallRisk} size={220} />
        </Card>
        <Card className="p-6 col-span-2">
          <h2 className="text-sm font-semibold mb-5">Risk Breakdown</h2>
          <div className="space-y-3">
            {riskReasons.length > 0 ? (
              riskReasons.map((reason, i) => (
                <p key={i} className="text-sm text-foreground">{reason}</p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No risk breakdown available yet.</p>
            )}
          </div>
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Risk Factors</p>
            <div className="space-y-2">
              {clauses.filter(c => c.risk === "high").map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm">
                  <AlertTriangle size={13} className="text-red-500 shrink-0" />
                  <span className="text-foreground">{c.title}</span>
                  <Badge variant="high" className="ml-auto">High</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "clauses", label: `Clauses (${clauses.length})`, icon: <FileText size={14} /> },
          { id: "missing", label: `Missing (${missingSections.length})`, icon: <AlertTriangle size={14} /> },
          { id: "duplicates", label: `Duplicates (${duplicates.length})`, icon: <Layers size={14} /> },
          { id: "obligations", label: `Obligations (${obligations.length})`, icon: <ClipboardList size={14} /> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* Clauses tab */}
      {tab === "clauses" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{clauses.filter(c=>c.risk==="high").length} high risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{clauses.filter(c=>c.risk==="medium").length} medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{clauses.filter(c=>c.risk==="low").length} low</span>
          </div>
          {clauses.map((c) => <ClauseCard key={c.id} clause={c} />)}
        </div>
      )}

      {/* Missing tab */}
      {tab === "missing" && (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground mb-4">The following required and recommended clauses were not found in this document.</p>
          {missingSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missing sections detected — this policy covers all expected categories.</p>
          ) : (
            <div className="space-y-3">
              {missingSections.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/20 transition-colors">
                  <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", m.required ? "bg-red-100" : "bg-amber-100")}>
                    <AlertTriangle size={14} className={m.required ? "text-red-600" : "text-amber-600"} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.regulation}</p>
                  </div>
                  <Badge variant={m.required ? "high" : "medium"}>{m.required ? "Required" : "Recommended"}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Duplicates tab */}
      {tab === "duplicates" && (
        <div className="space-y-4">
          {duplicates.length === 0 ? (
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">No duplicates or contradictions detected.</p>
            </Card>
          ) : (
            duplicates.map((d) => (
              <Card key={d.id} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GitMerge size={16} className="text-muted-foreground" />
                    <span className="text-sm font-semibold capitalize">{d.type}</span>
                  </div>
                  <Badge variant={d.similarity > 80 ? "high" : d.similarity > 65 ? "medium" : "low"}>{d.similarity}% similar</Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[d.clause1, d.clause2].map((text, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-3 text-xs text-foreground italic border border-border">
                      "{text}"
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Obligations tab */}
      {tab === "obligations" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Entity", "Modal", "Strength", "Action", "Clause", "Risk"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {obligations.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{o.entity}</td>
                    <td className="px-4 py-3 font-mono text-xs bg-muted/20 rounded">{o.modal}</td>
                    <td className="px-4 py-3">
                      <Badge variant={o.strength === "Mandatory" ? "high" : o.strength === "Recommended" ? "medium" : "default"}>
                        {o.strength}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[300px]">{o.action}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{o.clause}</td>
                    <td className="px-4 py-3"><Badge variant={o.risk}>{o.risk.charAt(0).toUpperCase() + o.risk.slice(1)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}