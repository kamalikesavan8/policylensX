import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, forwardRef, useState } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-blue-700 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-slate-200 border border-border",
    ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-red-700",
    outline: "border border-border bg-transparent hover:bg-accent text-foreground",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-destructive focus:ring-destructive/30",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-card rounded-xl border border-border shadow-sm",
        hover && "hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeVariant = "high" | "medium" | "low" | "info" | "default";

export function Badge({ variant = "default", children, className }: { variant?: BadgeVariant; children: ReactNode; className?: string }) {
  const styles: Record<BadgeVariant, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-green-100 text-green-700 border-green-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    default: "bg-secondary text-secondary-foreground border-border",
  };
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", styles[variant], className)}>
      {children}
    </span>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

export function Spinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "w-3 h-3", md: "w-5 h-5", lg: "w-8 h-8" };
  return (
    <div className={clsx("animate-spin rounded-full border-2 border-current border-t-transparent", sizes[size], className)} />
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse bg-muted rounded-md", className)} />;
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      {icon && <div className="text-muted-foreground mb-2">{icon}</div>}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ─── ErrorBanner ─────────────────────────────────────────────────────────────

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && <button onClick={onDismiss} className="shrink-0 hover:text-red-900"><X size={14} /></button>}
    </div>
  );
}

// ─── SuccessBanner ───────────────────────────────────────────────────────────

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
      <CheckCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
    </div>
  );
}

// ─── InfoBanner ──────────────────────────────────────────────────────────────

export function InfoBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
      <Info size={16} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─── WarningBanner ───────────────────────────────────────────────────────────

export function WarningBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
      <AlertTriangle size={16} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─── Modal / Dialog ──────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] flex flex-col">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold">{title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; icon?: ReactNode }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150",
            active === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, max = 100, color = "blue" }: { value: number; max?: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div className={clsx("h-full rounded-full transition-all duration-700", colors[color] || "bg-blue-500")} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Password Strength ───────────────────────────────────────────────────────

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-blue-400", "bg-green-500"];

  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={clsx("h-1 flex-1 rounded-full transition-all", i <= score ? colors[score] : "bg-secondary")} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium text-foreground">{labels[score] || "Too short"}</span>
      </p>
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        className={clsx("relative w-9 h-5 rounded-full transition-colors duration-200", checked ? "bg-primary" : "bg-switch-background")}
        onClick={() => onChange(!checked)}
      >
        <span className={clsx("absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200", checked && "translate-x-4")} />
      </div>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}

// ─── SearchInput ─────────────────────────────────────────────────────────────

export function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" strokeWidth="2"/><path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 w-full rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
      />
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export function Tooltip({ children, content }: { children: ReactNode; content: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-foreground text-background text-xs rounded-md shadow-lg whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}
