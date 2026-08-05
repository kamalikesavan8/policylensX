import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, ChevronLeft, ChevronRight, ArrowUpRight, Clock } from "lucide-react";
import { Card, Badge, SearchInput, Select } from "../components/ui";
import { documentApi } from "../services/api";
import { useDocument } from "../context/DocumentContext";

const RISK_FILTER_OPTIONS = [
  { value: "all", label: "All Risk Levels" },
  { value: "high", label: "High Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "low", label: "Low Risk" },
];

const PAGE_SIZE = 5;

function riskLevelFromScore(score: number): "low" | "medium" | "high" {
  if (score <= 33) return "low";
  if (score <= 66) return "medium";
  return "high";
}

export default function History() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentResult } = useDocument();

  useEffect(() => {
    documentApi
      .getAll()
      .then((data: any[]) => {
        const mapped = data.map((doc: any) => ({
          id: doc.id,
          name: doc.fileName || "Untitled Document",
          uploadedAt: doc.uploadedAt,
          sizeKb: Math.round((doc.extractedText?.length || 0) / 1024),
          risk: Math.round(doc.overallRiskScore ?? 0),
          riskLevel: riskLevelFromScore(doc.overallRiskScore ?? 0),
        }));
        // Most recent first
        mapped.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        setDocs(mapped);
      })
      .catch((err) => setError(err.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || d.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDocument = async (id: number) => {
    try {
      const [clauses, relations, obligations] = await Promise.all([
        documentApi.getClauses(id),
        documentApi.getRelations(id),
        documentApi.getObligations(id),
      ]);
      const doc = clauses[0]?.document || relations[0]?.document || obligations[0]?.document;
      setCurrentResult({
        documentId: id,
        clauses,
        relations,
        obligations,
        overallRiskScore: doc?.overallRiskScore,
        riskReasons: doc?.riskReasons,
        document: doc,
      });
      navigate(`/app/results/${id}`);
    } catch (err: any) {
      alert("Could not open document: " + err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Document History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} documents analyzed</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search documents..." />
          </div>
          <Select value={riskFilter} onChange={(v) => { setRiskFilter(v); setPage(1); }} options={RISK_FILTER_OPTIONS} />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="px-5 py-12 text-center text-muted-foreground text-sm">Loading history...</div>
        ) : error ? (
          <div className="px-5 py-12 text-center text-red-500 text-sm">Failed to load: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Document</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Uploaded</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Size (approx)</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Risk Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">No documents match your filters</td></tr>
                ) : paginated.map((doc) => (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground truncate max-w-[220px]">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Clock size={11} />
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">{doc.sizeKb} KB</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{doc.risk}</span>
                        <Badge variant={doc.riskLevel as any}>{doc.riskLevel.charAt(0).toUpperCase() + doc.riskLevel.slice(1)}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => openDocument(doc.id)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        Open <ArrowUpRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}