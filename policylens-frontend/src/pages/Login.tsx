import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";
import { ErrorBanner } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState("alex.chen@acmecorp.com");
  const [password, setPassword] = useState("••••••••");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/upload");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-slate-900 p-12 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-semibold text-white text-lg">PolicyLens</span>
        </div>
        <div>
          <blockquote className="text-white text-xl font-medium leading-relaxed mb-6">
            "PolicyLens caught a perpetual data license clause in a vendor contract that our external counsel missed. Saved us from a potential GDPR nightmare."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">MK</div>
            <div>
              <p className="text-white text-sm font-medium">Marcus Kim</p>
              <p className="text-slate-400 text-xs">General Counsel, Meridian Tech</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[["2.4M+", "Documents"], ["98.7%", "Accuracy"], ["<30s", "Analysis"]].map(([v, l]) => (
            <div key={l} className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-white font-bold text-xl">{v}</p>
              <p className="text-slate-400 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">PolicyLens</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to your PolicyLens account</p>
          </div>

          {error && <div className="mb-5"><ErrorBanner message={error} onDismiss={() => setError("")} /></div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">Remember me for 30 days</label>
            </div>

            <Button type="submit" loading={loading} className="w-full py-2.5 text-base rounded-xl">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {"Don't have an account? "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
