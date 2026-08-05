import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, TrendingUp, AlertTriangle, ListChecks, ArrowUpRight, Clock } from "lucide-react";
import { Card, Badge } from "../components/ui";
import { documentApi } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={17} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

function riskLevel(score: number): "low" | "medium" | "high" {
  if (score <= 33) return "low";
  if (score <= 66) return "medium";
  return "high";
}

const RCOLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentApi
      .getAll()
      .then((data: any[]) => setDocs(data || []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const totalDocuments = docs.length;
  const avgRisk = totalDocuments === 0 ? 0 : Math.round(docs.reduce((sum, d) => sum + (d.overallRiskScore ?? 0), 0) / totalDocuments);
  const highRiskDocs = docs.filter((d) => (d.overallRiskScore ?? 0) > 66).length;
  const avgMissingSections = totalDocuments === 0 ? 0 : Math.round((docs.reduce((sum, d) => sum + (d.missingSections?.length ?? 0), 0) / totalDocuments) * 10) / 10;

  // Risk distribution
  const dist = { low: 0, medium: 0, high: 0 };
  docs.forEach((d) => dist[riskLevel(d.overallRiskScore ?? 0)]++);
  const riskDistributionData = [
    { name: "Low (0-33)", value: totalDocuments ? Math.round((dist.low / totalDocuments) * 100) : 0 },
    { name: "Medium (34-66)", value: totalDocuments ? Math.round((dist.medium / totalDocuments) * 100) : 0 },
    { name: "High (67-100)", value: totalDocuments ? Math.round((dist.high / totalDocuments) * 100) : 0 },
  ];

  // Upload activity by month
  const monthMap: Record<string, number> = {};
  docs.forEach((d) => {
    if (!d.uploadedAt) return;
    const m = new Date(d.uploadedAt).toLocaleDateString("en-US", { month: "short" });
    monthMap[m] = (monthMap[m] || 0) + 1;
  });
  const uploadActivityData = Object.entries(monthMap).map(([month, uploads]) => ({ month, uploads }));

  // Average risk trend by month
  const riskByMonth: Record<string, number[]> = {};
  docs.forEach((d) => {
    if (!d.uploadedAt) return;
    const m = new Date(d.uploadedAt).toLocaleDateString("en-US", { month: "short" });
    if (!riskByMonth[m]) riskByMonth[m] = [];
    riskByMonth[m].push(d.overallRiskScore ?? 0);
  });
  const riskTrendData = Object.entries(riskByMonth).map(([month, scores]) => ({
    month,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  const recentDocs = [...docs]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your document analysis activity</p>
      </div>

      {loading ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">Loading dashboard...</Card>
      ) : totalDocuments === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted-foreground">No documents analyzed yet. Analyze your first document to see stats here.</p>
        </Card>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Documents" value={totalDocuments} icon={FileText} color="bg-blue-500" />
            <StatCard label="Average Risk Score" value={avgRisk} icon={TrendingUp} color="bg-amber-500" />
            <StatCard label="High Risk Docs" value={highRiskDocs} sub={`${Math.round((highRiskDocs / totalDocuments) * 100)}% of total`} icon={AlertTriangle} color="bg-red-500" />
            <StatCard label="Avg Missing Sections" value={avgMissingSections} sub="Per document" icon={ListChecks} color="bg-purple-500" />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-5">
              <h2 className="text-sm font-semibold mb-4">Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={riskDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {riskDistributionData.map((_, i) => (
                      <Cell key={i} fill={RCOLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {riskDistributionData.map(({ name, value }, i) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: RCOLORS[i] }} />
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{value}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold mb-4">Upload Activity</h2>
              {uploadActivityData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={uploadActivityData} barSize={20}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="uploads" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold mb-4">Average Risk Trend</h2>
              {riskTrendData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} name="Avg Risk" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Recent uploads */}
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Recent Documents</h2>
              <button onClick={() => navigate("/app/history")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                View all <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Document</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Uploaded</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Risk</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground" />
                  </tr>
                </thead>
                <tbody>
                  {recentDocs.map((doc) => {
                    const score = Math.round(doc.overallRiskScore ?? 0);
                    const level = riskLevel(score);
                    return (
                      <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <FileText size={14} className="text-blue-500" />
                            </div>
                            <span className="font-medium text-foreground truncate max-w-[200px]">{doc.fileName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={level as any}>{score} — {level.charAt(0).toUpperCase() + level.slice(1)}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => navigate("/app/history")}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            View <ArrowUpRight size={11} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}