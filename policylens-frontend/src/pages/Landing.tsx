import { Link } from "react-router";
import { Shield, ArrowRight, Upload, Cpu, AlertTriangle, BarChart3, CheckCircle, FileSearch, Scale, Zap, Lock, Globe, Users, ChevronRight } from "lucide-react";

const STEPS = [
  { icon: Upload, label: "Upload", desc: "PDF, DOCX, TXT, or paste text directly. URL import supported." },
  { icon: Cpu, label: "AI Analysis", desc: "GPT-4 powered deep NLP analysis of every clause and sentence." },
  { icon: FileSearch, label: "Clause Detection", desc: "Automatic extraction and categorization of all contractual clauses." },
  { icon: AlertTriangle, label: "Risk Assessment", desc: "Multi-dimensional scoring across legal, compliance, and operational axes." },
  { icon: BarChart3, label: "Report", desc: "Exportable PDF/JSON/CSV report with full explainability." },
];

const FEATURES = [
  {
    icon: AlertTriangle,
    title: "Ambiguity Detection",
    desc: "Identifies vague or subjective language that could be interpreted in multiple ways, flagging clauses that expose you to unforeseen obligations.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: FileSearch,
    title: "Missing Sections",
    desc: "Cross-references your document against regulatory requirements (GDPR, CCPA, HIPAA) to surface mandatory clauses that are absent.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Scale,
    title: "Duplicate & Contradiction",
    desc: "Detects redundant clauses and contradictory provisions within the same document that could invalidate key terms.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: CheckCircle,
    title: "Obligation Extraction",
    desc: "Maps every \"shall\", \"must\", \"will\", and \"may\" to the responsible party with strength classification and risk level.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: BarChart3,
    title: "Explainable Risk Score",
    desc: "A 0–100 composite score built from legal, compliance, and operational sub-scores with per-clause reasoning you can audit.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    desc: "Complete end-to-end analysis in under 30 seconds for documents up to 100 pages. No waiting, no queue.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
];

const BENEFITS = [
  { icon: Lock, title: "Enterprise-grade Security", desc: "SOC 2 Type II, GDPR compliant. Your documents never leave our encrypted infrastructure." },
  { icon: Globe, title: "Multi-jurisdiction Support", desc: "GDPR, CCPA, HIPAA, PIPEDA, and more. Jurisdiction-aware analysis out of the box." },
  { icon: Users, title: "Team Collaboration", desc: "Share reports, annotate clauses, and track document history across your entire legal team." },
];

const STATS = [
  { value: "2.4M+", label: "Documents analyzed" },
  { value: "98.7%", label: "Clause detection accuracy" },
  { value: "<30s", label: "Average analysis time" },
  { value: "180+", label: "Regulation frameworks" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-base">PolicyLens</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {["Features", "How It Works", "Pricing", "Docs"].map((item) => (
              <a key={item} href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{item}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-700 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              AI-Powered Legal Risk Analysis
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Read every clause.{" "}
              <span className="text-blue-600">Catch every risk.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              PolicyLens uses advanced AI to analyze privacy policies and contracts in seconds — detecting ambiguous clauses, missing sections, contradictions, and compliance gaps.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-700 font-medium px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Sign in
                <ChevronRight size={16} />
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-4">No credit card required · 50 free analyses / month</p>
          </div>

          {/* Hero illustration — mock risk dashboard */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                {["bg-red-400", "bg-amber-400", "bg-green-400"].map((c, i) => (
                  <span key={i} className={`w-3 h-3 rounded-full ${c}`} />
                ))}
                <span className="text-xs text-slate-400 ml-2">Acme Corp Privacy Policy v3.2.pdf</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Risk Score</p>
                    <p className="text-4xl font-bold text-red-500 mt-0.5">78<span className="text-lg text-slate-400">/100</span></p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200">High Risk</span>
                </div>
                {[
                  { label: "Legal Compliance", score: 62, color: "bg-amber-400" },
                  { label: "Data Privacy", score: 38, color: "bg-red-500" },
                  { label: "Operational Risk", score: 81, color: "bg-green-500" },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-mono font-semibold text-slate-700">{score}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  {[
                    { text: "Unilateral modification of terms without notice", risk: "bg-red-100 text-red-700" },
                    { text: "Perpetual irrevocable data license granted", risk: "bg-red-100 text-red-700" },
                    { text: "Arbitration class-action waiver", risk: "bg-amber-100 text-amber-700" },
                  ].map(({ text, risk }) => (
                    <div key={text} className="flex items-center gap-2">
                      <AlertTriangle size={12} className="text-slate-400 shrink-0" />
                      <p className="text-xs text-slate-600 flex-1">{text}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk}`}>High</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold text-white mb-1">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-4xl font-bold text-slate-900">From upload to insight in seconds</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {STEPS.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="relative flex flex-col items-center text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-px bg-gradient-to-r from-blue-200 to-transparent" />
                )}
                <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 relative">
                  <Icon size={28} className="text-blue-600" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-bold text-slate-900">Everything legal teams need</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">Deep clause intelligence designed for legal, compliance, and procurement teams at modern enterprises.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-8">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-start gap-3 p-6 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Icon size={18} className="text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Start analyzing documents today</h2>
          <p className="text-blue-100 text-lg mb-8">Join 5,000+ legal teams who trust PolicyLens to protect their organizations from contractual risk.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Get started for free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 text-white border border-white/30 font-medium px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="font-semibold text-white">PolicyLens</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-slate-400">
              {["Product", "Company", "Resources", "Legal"].map((section) => (
                <div key={section}>
                  <p className="font-medium text-white mb-3">{section}</p>
                  {["Features", "Pricing", "Changelog"].map((item) => (
                    <a key={item} href="#" className="block hover:text-white transition-colors mb-1.5">{item}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>© 2024 PolicyLens, Inc. All rights reserved.</p>
            <p>SOC 2 Type II · GDPR Compliant · ISO 27001</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
