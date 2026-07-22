import { NavLink, Link, useNavigate } from "react-router-dom";
import React from "react";
import {
  LayoutDashboard, Store, ClipboardList, Bell, ShieldCheck, Users,
  FileSearch, Activity, ChevronLeft, LogOut, MessageSquareWarning,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth_context";
import { cn } from "@/lib/utils";

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

interface NavItem { to: string; label: string; icon: React.ReactNode; roles: string[]; }

const navItems: NavItem[] = [
  { to: "/admin",               label: "Dashboard",    icon: <LayoutDashboard   size={20} />, roles: ["admin"] },
  { to: "/admin/users",         label: "Users",        icon: <Users             size={20} />, roles: ["admin"] },
  { to: "/admin/restaurants",   label: "Restaurants",  icon: <Store             size={20} />, roles: ["admin"] },
  { to: "/admin/verification",  label: "Verification", icon: <ShieldCheck       size={20} />, roles: ["admin"] },
  { to: "/admin/activity",      label: "Activity",     icon: <Activity          size={20} />, roles: ["admin"] },
  { to: "/admin/notifications", label: "Notifications",icon: <Bell              size={20} />, roles: ["admin"] },

  { to: "/customer",                  label: "Dashboard",    icon: <LayoutDashboard      size={20} />, roles: ["customer"] },
  { to: "/customer/restaurants",      label: "Restaurants",  icon: <Store                size={20} />, roles: ["customer"] },
  { to: "/customer/complaints",       label: "Complaints",   icon: <MessageSquareWarning size={20} />, roles: ["customer"] },
  { to: "/customer/notifications",    label: "Notifications",icon: <Bell                 size={20} />, roles: ["customer"] },

  { to: "/owner",                  label: "Dashboard",    icon: <LayoutDashboard size={20} />, roles: ["owner"] },
  { to: "/owner/restaurants",      label: "Restaurants",  icon: <Store           size={20} />, roles: ["owner"] },
  { to: "/owner/certificates",     label: "Certificates", icon: <FileSearch      size={20} />, roles: ["owner"] },
  { to: "/owner/complaints",       label: "Complaints",   icon: <ClipboardList   size={20} />, roles: ["owner"] },
  { to: "/owner/notifications",    label: "Notifications",icon: <Bell            size={20} />, roles: ["owner"] },

  { to: "/inspector",                  label: "Dashboard",   icon: <LayoutDashboard size={20} />, roles: ["inspector"] },
  { to: "/inspector/inspections",      label: "Inspections", icon: <FileSearch      size={20} />, roles: ["inspector"] },
  { to: "/inspector/restaurants",      label: "Restaurants", icon: <Store           size={20} />, roles: ["inspector"] },
  { to: "/inspector/notifications",    label: "Notifications",icon: <Bell           size={20} />, roles: ["inspector"] },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems.filter((i) => i.roles.includes(role || ""));

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out z-30",
        "bg-slate-950 border-r border-slate-800/80 shadow-2xl",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        "flex items-center h-16 shrink-0 border-b border-slate-800/80",
        collapsed ? "justify-center px-0" : "gap-3 px-4"
      )}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={20} className="text-white" strokeWidth={2.2} />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight truncate">
              Safe<span className="text-emerald-400 font-black">Bite</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={20} className="text-white" strokeWidth={2.2} />
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "hidden lg:flex items-center justify-center w-7 h-7 rounded-lg",
            "text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-3 no-scrollbar">
        {collapsed && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full h-9 mb-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        )}
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split("/").length <= 2}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-3.5 rounded-xl transition-all duration-200 group font-semibold",
              collapsed ? "justify-center px-0 py-3" : "px-3.5 py-3",
              isActive
                ? "bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/80"
            )}
          >
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight truncate">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Session */}
      <div className={cn(
        "shrink-0 border-t border-slate-800/80 py-4",
        collapsed ? "px-2" : "px-3"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-2xl bg-slate-900/60 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-extrabold text-sm">
              {(role || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{roleLabel}</p>
              <p className="text-xs text-slate-400 font-medium leading-tight mt-0.5">Active session</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl transition-all duration-200 cursor-pointer font-semibold",
            "text-slate-400 hover:text-red-400 hover:bg-red-500/15",
            collapsed ? "justify-center px-0 py-3" : "px-3.5 py-2.5 text-sm"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

