import { useState } from "react";
import { User, Bell, Shield, Palette, Save, Camera } from "lucide-react";
import { Card, Button, Input, Toggle, Tabs } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

function DisplayPref({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked: boolean }) {
  const [v, setV] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Toggle checked={v} onChange={setV} />
    </div>
  );
}

export default function Settings() {
  const { user, updateName } = useAuth();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifs, setNotifs] = useState({ analysis: true, highRisk: true, weekly: false, tips: true });
  const [appearance, setAppearance] = useState("system");
  

  const handleSave = () => {
  if (tab === "profile") {
    updateName(name);
    toast.success("Profile updated", { description: "Name saved locally — job title/company aren't backed yet." });
  } else {
    toast.success("Settings saved successfully");
  }
};

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences and configuration</p>
      </div>

      <Tabs
        tabs={[
          { id: "profile", label: "Profile", icon: <User size={14} /> },
          { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
          { id: "security", label: "Security", icon: <Shield size={14} /> },
          { id: "appearance", label: "Appearance", icon: <Palette size={14} /> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "profile" && (
        <div className="space-y-5">
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-5">Profile Information</h2>
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-xl font-bold text-white">
                  {user?.avatar}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <Camera size={11} className="text-muted-foreground" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1.5 border border-blue-200">{user?.plan}</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              <Input label="Email Address" type="email" value={email} disabled placeholder="you@company.com" />
              <Input label="Job Title" placeholder="Your role (not yet saved)" />
              <Input label="Company" placeholder="Company name (not yet saved)" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Name, job title, and company are not yet persisted to the backend — these fields are for future use once the User profile is extended server-side.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-5">Account Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[["Plan", user?.plan], ["Email", user?.email], ["Role", "User"]].map(([l, v]) => (
                <div key={String(l)}>
                  <p className="text-xs text-muted-foreground mb-1">{l}</p>
                  <p className="text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSave} icon={<Save size={14} />}>Save Changes</Button>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-5">Email Notifications</h2>
            <div className="space-y-5">
              {[
                { key: "analysis" as const, label: "Analysis complete", desc: "Notify me when document analysis finishes" },
                { key: "highRisk" as const, label: "High risk alerts", desc: "Immediately alert me when high risk clauses are detected" },
                { key: "weekly" as const, label: "Weekly digest", desc: "Weekly summary of documents analyzed and risk trends" },
                { key: "tips" as const, label: "Product tips", desc: "Tips on how to get the most out of PolicyLens" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Toggle checked={notifs[key]} onChange={(v) => setNotifs({ ...notifs, [key]: v })} />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Note: these preferences are not yet sent to a backend — no emails are actually triggered yet.</p>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSave} icon={<Save size={14} />}>Save Preferences</Button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-5">Change Password</h2>
            <div className="space-y-4 max-w-sm">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="Min. 8 characters" />
              <Input label="Confirm New Password" type="password" placeholder="Repeat new password" />
            </div>
            <Button onClick={() => toast.info("Password change endpoint not yet built")} className="mt-4" variant="secondary">Update Password</Button>
          </Card>
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-2">Two-Factor Authentication</h2>
            <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account with 2FA.</p>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Authenticator App</p>
                  <p className="text-xs text-muted-foreground">Not configured</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => toast.info("2FA setup coming soon")}>Enable</Button>
            </div>
          </Card>
        </div>
      )}

      {tab === "appearance" && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-5">Theme</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", preview: "bg-white border-slate-200" },
                { id: "dark", label: "Dark", preview: "bg-slate-900 border-slate-700" },
                { id: "system", label: "System", preview: "bg-gradient-to-br from-white to-slate-900 border-slate-300" },
              ].map(({ id, label, preview }) => (
                <button
                  key={id}
                  onClick={() => setAppearance(id)}
                  className={`border-2 rounded-xl p-3 text-center transition-all ${appearance === id ? "border-primary" : "border-border hover:border-primary/40"}`}
                >
                  <div className={`h-14 rounded-lg border mb-2 ${preview}`} />
                  <p className="text-xs font-medium text-foreground">{label}</p>
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-5">Display Preferences</h2>
            <div className="space-y-0">
              <DisplayPref label="Compact mode" desc="Show more content with reduced spacing" defaultChecked={false} />
              <DisplayPref label="Animate transitions" desc="Smooth animations between pages and states" defaultChecked={true} />
              <DisplayPref label="Show confidence scores" desc="Display AI confidence percentage on each clause" defaultChecked={true} />
            </div>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSave} icon={<Save size={14} />}>Save Preferences</Button>
          </div>
        </div>
      )}
    </div>
  );
}