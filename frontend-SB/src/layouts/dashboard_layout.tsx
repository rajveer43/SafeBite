import { useState, type ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";
import { motion } from "motion/react";
import { Shield, Utensils, CheckCircle2, FileText, BarChart3, Bell } from "lucide-react";

export default function DashboardLayout({ children, title }: { children: ReactNode; title?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0 z-30">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={`fixed top-0 left-0 h-full z-50 lg:hidden transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Main content with rich ambient background */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
        <Navbar onMenuClick={() => setMobileOpen(true)} title={title} />
        
        <main className="flex-1 overflow-y-auto relative">
          {/* Soft Green Radial Background Glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(circle at 50% 25%, rgba(16, 185, 129, 0.06) 0%, transparent 70%)",
            }}
          />

          {/* Subtle Grid Background Pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage: "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.06,
            }}
          />

          {/* Content container — centered, max 1600px, 32px gutters */}
          <div
            className="relative z-10 w-full mx-auto pb-24 lg:pb-8"
            style={{ maxWidth: 1600, paddingLeft: 32, paddingRight: 32, paddingTop: 24 }}
          >
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
