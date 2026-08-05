import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { Upload as UploadIcon, FileText, Link as LinkIcon, X, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { Card, Button, Tabs } from "../components/ui";
import { clsx } from "clsx";
import { documentApi } from "../services/api";
import { useDocument } from "../context/DocumentContext";
import { useNotifications } from "../context/NotificationContext";

const STEPS = [
  { id: "uploading", label: "Uploading document" },
  { id: "extracting", label: "Extracting text" },
  { id: "clauses", label: "Detecting clauses" },
  { id: "ai", label: "AI analysis" },
  { id: "risk", label: "Scoring risk" },
  { id: "results", label: "Generating report" },
];

export default function Upload() {
  const [tab, setTab] = useState("file");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  

  const canAnalyze = tab === "file" ? !!file : tab === "text" ? text.length > 50 : url.length > 10;

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|doc|docx|txt)$/i)) return;
    setFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const { setCurrentResult } = useDocument();

const analyze = async () => {
  setAnalyzing(true);
  setStepIdx(0);

  try {
    let result;
    if (tab === "file" && file) result = await documentApi.uploadFile(file);
    else if (tab === "text") result = await documentApi.analyzeText(text);
    else result = await documentApi.analyzeUrl(url);

    if (!result.documentId) throw new Error(result.message || "Analysis failed");

    const [clauses, relations, obligations] = await Promise.all([
      documentApi.getClauses(result.documentId),
      documentApi.getRelations(result.documentId),
      documentApi.getObligations(result.documentId),
    ]);

    setCurrentResult({ ...result, clauses, relations, obligations });
    addNotification(`${tab === "file" && file ? file.name : tab === "url" ? url : "Pasted document"} analysis complete — risk score ${result.overallRiskScore}/100`);
if (result.overallRiskScore > 66) {
  addNotification(`High risk detected in analyzed document (score ${result.overallRiskScore}/100)`);
}
    setStepIdx(STEPS.length);
    setDone(true);
    await new Promise((r) => setTimeout(r, 500));
    navigate(`/app/results/${result.documentId}`);
  } catch (err: any) {
    alert("Analysis failed: " + err.message); // replace with a proper toast later
    setAnalyzing(false);
  }
};

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analyze a Document</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload a contract or privacy policy to begin AI-powered risk analysis</p>
      </div>

      {analyzing ? (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              {done ? <CheckCircle size={32} className="text-green-500" /> : <Loader2 size={32} className="text-blue-500 animate-spin" />}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">{done ? "Analysis complete!" : "Analyzing your document..."}</h2>
              <p className="text-sm text-muted-foreground mt-1">{done ? "Redirecting to results..." : "This usually takes 15–30 seconds"}</p>
            </div>
            <div className="w-full max-w-md space-y-3">
              {STEPS.map((step, i) => {
                const isComplete = i < stepIdx;
                const isActive = i === stepIdx;
                const isPending = i > stepIdx;
                return (
                  <div key={step.id} className={clsx("flex items-center gap-3 p-3 rounded-lg transition-all", isActive && "bg-blue-50 border border-blue-100")}>
                    <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isComplete ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-muted"
                    )}>
                      {isComplete ? (
                        <CheckCircle size={14} className="text-white" />
                      ) : isActive ? (
                        <Loader2 size={12} className="text-white animate-spin" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span className={clsx("text-sm", isActive ? "text-blue-700 font-medium" : isPending ? "text-muted-foreground" : "text-foreground")}>{step.label}</span>
                    {isActive && <span className="ml-auto text-xs text-blue-500 animate-pulse">Processing...</span>}
                    {isComplete && <span className="ml-auto text-xs text-green-500">Done</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Tabs
            tabs={[
              { id: "file", label: "File Upload", icon: <UploadIcon size={15} /> },
              { id: "text", label: "Paste Text", icon: <FileText size={15} /> },
              { id: "url", label: "From URL", icon: <LinkIcon size={15} /> },
            ]}
            active={tab}
            onChange={setTab}
          />

          <Card className="overflow-hidden">
            {tab === "file" && (
              <div className="p-6">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                  className={clsx(
                    "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                    dragging ? "border-blue-400 bg-blue-50" : file ? "border-green-300 bg-green-50" : "border-border hover:border-blue-300 hover:bg-blue-50/50"
                  )}
                >
                  {file ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                        <FileText size={28} className="text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                      >
                        <X size={14} /> Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <UploadIcon size={28} className="text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">Drop your document here</p>
                        <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, DOCX, TXT · Max 50MB</p>
                      </div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={onFileChange} />

                {/* Demo: add a sample */}
                {!file && (
                  <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-3">
                    <AlertTriangle size={14} className="text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground flex-1">
                      For demo purposes, you can upload any file or use the Paste Text tab.
                    </p>
                    <button
                      onClick={() => {
                        const dummy = new File(["Sample policy content..."], "sample-privacy-policy.pdf", { type: "application/pdf" });
                        setFile(dummy);
                      }}
                      className="text-xs text-primary font-medium hover:underline shrink-0"
                    >
                      Load sample
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "text" && (
              <div className="p-6">
                <label className="text-sm font-medium text-foreground block mb-2">Paste your document text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-64 rounded-xl border border-border bg-input-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  placeholder="Paste the full text of your privacy policy or contract here..."
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{text.length} characters {text.length < 50 && text.length > 0 && "— add more text to analyze"}</p>
                  {text.length < 100 && (
                    <button
                      onClick={() => setText(`PRIVACY POLICY\n\nLast Updated: January 15, 2024\n\n1. DATA COLLECTION\nThe Company reserves the right to collect, process, and retain user data for any business purpose without restriction. By using our service, you grant the Company a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, and distribute any content you submit.\n\n2. MODIFICATION OF TERMS\nThe Company reserves the right to modify these terms at any time without prior notice to the user. Continued use of the service constitutes acceptance of the modified terms.\n\n3. ARBITRATION\nUsers waive the right to participate in class action lawsuits. All disputes must be resolved through individual binding arbitration under AAA rules.\n\n4. GOVERNING LAW\nThis agreement shall be governed by the laws of the State of Delaware.\n\n5. DATA RETENTION\nCompany will retain user data for five (5) years following account termination for business and legal compliance purposes.`)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Load sample text
                    </button>
                  )}
                </div>
              </div>
            )}

            {tab === "url" && (
              <div className="p-6">
                <label className="text-sm font-medium text-foreground block mb-2">Document URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-border bg-input-background rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="https://example.com/privacy-policy"
                    />
                  </div>
                  <Button variant="secondary" onClick={() => setUrl("https://www.example.com/privacy-policy")}>Load sample</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Publicly accessible URLs only. Authentication-gated pages are not supported.</p>
              </div>
            )}
          </Card>

          {/* Analysis options */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">Analysis Options</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: "gdpr", label: "GDPR Compliance Check", desc: "EU data protection regulations" },
                { id: "ccpa", label: "CCPA Compliance Check", desc: "California Consumer Privacy Act" },
                { id: "hipaa", label: "HIPAA Compliance Check", desc: "Healthcare data regulations" },
                { id: "obligations", label: "Obligation Extraction", desc: "Party-by-party obligation mapping" },
              ].map(({ id, label, desc }) => (
                <label key={id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Analysis typically takes 15–30 seconds</p>
            <Button onClick={analyze} disabled={!canAnalyze} size="lg" className="px-8">
              <UploadIcon size={16} />
              Analyze Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
