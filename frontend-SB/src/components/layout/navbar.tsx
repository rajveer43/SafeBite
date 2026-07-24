import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Sun, Menu, LogOut, ChevronDown, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth_context";
import { useDarkMode } from "@/contexts/theme_context";
import { useNotifications } from "@/hooks/useNotifications";
import Avatar from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";

interface NavbarProps { onMenuClick: () => void; title?: string; }

export default function Navbar({ onMenuClick, title }: NavbarProps) {
  const { user, role, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

  return (
    <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shrink-0 shadow-xs">
      {/* Left: menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <Menu size={20} />
        </button>
        {title && (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-slate-400 text-base font-medium hidden sm:block">/</span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate hidden sm:block tracking-tight">
              {title}
            </h1>
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-500 hover:text-slate-900 cursor-pointer"
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-14 w-84 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200 overflow-hidden animate-scale-in z-50">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors cursor-pointer"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 24px", gap: 12 }}>
                    <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 14, background: "#f1f5f9", color: "#94a3b8" }}>
                      <Bell size={22} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>No notifications yet</p>
                      <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>You're all caught up.</p>
                    </div>
                  </div>
                ) : notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors",
                      !n.is_read && "bg-primary-50/40 border-l-2 border-primary-500"
                    )}
                  >
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={() => { setShowNotif(false); navigate(`/${role}/notifications`); }}
                  className="w-full text-center text-xs text-primary-600 font-bold py-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer"
          >
            <Avatar name={user?.name || role || "U"} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || "User"}</p>
              <p className="text-xs font-medium text-slate-500 leading-tight mt-0.5">{roleLabel}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div
              className="absolute right-0 top-14 bg-white overflow-hidden animate-scale-in z-50"
              style={{ width: 288, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 12px 32px -8px rgba(15,23,42,0.18)" }}
            >
              <div className="flex items-center" style={{ gap: 12, padding: 16, borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
                <Avatar name={user?.name || role || "U"} size="sm" />
                <div className="min-w-0">
                  <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{user?.name || "User"}</p>
                  <p className="truncate" style={{ fontSize: 13, color: "#64748b", lineHeight: 1.3, marginTop: 2 }}>{user?.email || roleLabel}</p>
                </div>
              </div>
              <div style={{ padding: 8 }}>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="flex items-center w-full transition-colors duration-200 cursor-pointer"
                  style={{ gap: 10, height: 40, padding: "0 12px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#dc2626" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

