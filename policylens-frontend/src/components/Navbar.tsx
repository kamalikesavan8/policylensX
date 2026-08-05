import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell, Sun, Moon, Menu, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { clsx } from "clsx";

interface NavbarProps {
  onMenuClick?: () => void;
  dark: boolean;
  onToggleDark: () => void;
}

export function Navbar({ onMenuClick, dark, onToggleDark }: NavbarProps) {
  const { user, logout } = useAuth();
  const { notifications, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  const openNotifications = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    setProfileOpen(false);
    if (opening) markAllRead();
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 sticky top-0 z-20 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors">
        <Menu size={18} />
      </button>

      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-8 pr-4 py-1.5 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono bg-secondary text-muted-foreground px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={openNotifications}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No notifications yet. Analyze a document to see updates here.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-border last:border-0 hover:bg-muted transition-colors">
                      <p className="text-sm text-foreground">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">{user?.avatar}</div>
            <span className="text-sm font-medium hidden md:block">{user?.name?.split(" ")[0]}</span>
            <ChevronDown size={14} className="text-muted-foreground hidden md:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate("/app/settings"); setProfileOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => { navigate("/app/settings"); setProfileOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
              >
                Settings
              </button>
              <div className="border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setNotifOpen(false); setProfileOpen(false); }} />
      )}
    </header>
  );
}