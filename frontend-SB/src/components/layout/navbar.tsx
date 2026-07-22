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
                  <div className="p-8 text-center">
                    <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No notifications yet</p>
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
            <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200 overflow-hidden animate-scale-in z-50">
              <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <Avatar name={user?.name || role || "U"} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs text-red-600 hover:bg-red-50 transition-all duration-200 font-bold cursor-pointer"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

