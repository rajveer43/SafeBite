import { NavLink, Link, useNavigate } from "react-router-dom";
import React from "react";
import {
  LayoutDashboard, Store, ClipboardList, Bell, ShieldCheck, Users,
  FileSearch, Activity, ChevronLeft, LogOut, MessageSquareWarning,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth_context";

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

/* Enterprise SaaS design tokens */
const C = {
  sidebar: "#020817",
  card: "#111827",
  border: "rgba(255,255,255,0.06)",
  hover: "rgba(255,255,255,0.04)",
  green: "#10B981",
  greenActiveBg: "rgba(16,185,129,0.12)",
  greenActiveBorder: "rgba(16,185,129,0.25)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textHover: "#CBD5E1",
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems.filter((i) => i.roles.includes(role || ""));

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col transition-[width] duration-300 ease-in-out z-30"
      style={{
        width: collapsed ? 76 : 288,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      {/* ── Header / Logo (72px, aligned to 20px gutter) ── */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: 72,
          padding: collapsed ? "0 14px" : "0 20px",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed ? (
          <>
            <Link to="/" className="flex items-center min-w-0" style={{ gap: 16 }}>
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: C.green,
                  boxShadow: "0 6px 16px -6px rgba(16,185,129,0.5)",
                }}
              >
                <ShieldCheck size={24} className="text-white" strokeWidth={2.2} />
              </div>
              <span
                className="truncate"
                style={{ fontWeight: 700, fontSize: 24, letterSpacing: "-0.5px", color: C.textPrimary, lineHeight: 1 }}
              >
                Safe<span style={{ color: "#34D399" }}>Bite</span>
              </span>
            </Link>
            <button
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="hidden lg:flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-200"
              style={{ width: 36, height: 36, borderRadius: 999, color: C.textSecondary }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.textPrimary; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSecondary; }}
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <Link
            to="/"
            className="flex items-center justify-center"
            style={{ width: 48, height: 48, borderRadius: 14, background: C.green, boxShadow: "0 6px 16px -6px rgba(16,185,129,0.5)" }}
          >
            <ShieldCheck size={24} className="text-white" strokeWidth={2.2} />
          </Link>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: C.border, margin: "0 20px" }} />

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
        style={{ padding: collapsed ? "12px 12px 0" : "12px 20px 0", gap: 8 }}
      >
        {collapsed && (
          <button
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="flex items-center justify-center w-full cursor-pointer transition-colors duration-200"
            style={{ height: 44, borderRadius: 12, color: C.textSecondary }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.textPrimary; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSecondary; }}
          >
            <ChevronRight size={18} />
          </button>
        )}

        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split("/").length <= 2}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <span
                className="flex items-center transition-colors duration-[180ms] group"
                style={{
                  height: 48,
                  padding: collapsed ? 0 : "12px 16px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 14,
                  borderRadius: 12,
                  background: isActive ? C.greenActiveBg : "transparent",
                  border: isActive ? `1px solid ${C.greenActiveBorder}` : "1px solid transparent",
                  color: isActive ? C.textPrimary : C.textSecondary,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.textHover; }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSecondary; }
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 24, height: 24, color: isActive ? C.green : "inherit" }}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span
                    className="truncate"
                    style={{ fontWeight: 500, fontSize: 16, lineHeight: "24px" }}
                  >
                    {item.label}
                  </span>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer / User Session ── */}
      <div style={{ padding: collapsed ? "12px 12px 20px" : "12px 20px 20px" }}>
        {!collapsed && (
          <div
            className="flex items-center"
            style={{
              gap: 14, padding: 16, borderRadius: 16,
              background: C.card, border: `1px solid ${C.border}`,
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.greenActiveBg, border: `1px solid ${C.greenActiveBorder}`,
                color: C.green, fontWeight: 700, fontSize: 16,
              }}
            >
              {(role || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate" style={{ fontWeight: 600, fontSize: 16, color: C.textPrimary, lineHeight: 1.2 }}>
                {roleLabel}
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.textSecondary, lineHeight: 1.2, marginTop: 3 }}>
                Active session
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => { logout(); navigate("/login"); }}
          title={collapsed ? "Sign out" : undefined}
          className="flex items-center w-full cursor-pointer transition-colors duration-[180ms]"
          style={{
            marginTop: collapsed ? 0 : 16,
            height: 44,
            padding: collapsed ? 0 : "0 16px",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 14, borderRadius: 10,
            fontWeight: 500, fontSize: 15,
            color: C.textSecondary,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#F87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSecondary; }}
        >
          <span className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24 }}>
            <LogOut size={18} />
          </span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
