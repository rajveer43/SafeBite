import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Store,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Upload,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Building2,
  Award,
  CheckCircle2,
  Clock,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import Skeleton from "@/components/ui/skeleton";
import StatusBadge from "@/components/common/status-badge";
import SafetyScoreBadge from "@/components/common/safety-score";
import { useAuth } from "@/contexts/auth_context";
import { useToast } from "@/components/common/toast";
import { getOwnerRestaurants } from "@/services/restaurant_service";
import { getMyComplaints } from "@/services/complaint_service";
import { getCertificates } from "@/services/inspection_service";
import type { Restaurant, Complaint, Certificate } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/* Shared design tokens */
const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const SHADOW_HOVER = "0 8px 24px rgba(15,23,42,0.08)";

type StatColor = "emerald" | "amber" | "blue" | "purple";

const STAT_STYLES: Record<StatColor, { top: string; iconBg: string; iconText: string; iconBorder: string; chipBg: string; chipText: string; chipIcon: string }> = {
  emerald: { top: "#10b981", iconBg: "rgba(16,185,129,0.10)", iconText: "#059669", iconBorder: "rgba(16,185,129,0.20)", chipBg: "rgba(16,185,129,0.12)", chipText: "#065f46", chipIcon: "#059669" },
  amber:   { top: "#f59e0b", iconBg: "rgba(245,158,11,0.10)", iconText: "#d97706", iconBorder: "rgba(245,158,11,0.20)", chipBg: "rgba(245,158,11,0.12)", chipText: "#92400e", chipIcon: "#d97706" },
  blue:    { top: "#3b82f6", iconBg: "rgba(59,130,246,0.10)", iconText: "#2563eb", iconBorder: "rgba(59,130,246,0.20)", chipBg: "rgba(59,130,246,0.12)", chipText: "#1e40af", chipIcon: "#2563eb" },
  purple:  { top: "#a855f7", iconBg: "rgba(168,85,247,0.10)", iconText: "#9333ea", iconBorder: "rgba(168,85,247,0.20)", chipBg: "rgba(168,85,247,0.12)", chipText: "#6b21a8", chipIcon: "#9333ea" },
};

function StatCard({
  color, custom, label, value, icon, chipIcon, chipLabel, onClick,
}: {
  color: StatColor; custom: number; label: string; value: React.ReactNode;
  icon: React.ReactNode; chipIcon: React.ReactNode; chipLabel: string; onClick?: () => void;
}) {
  const s = STAT_STYLES[color];
  return (
    <motion.div
      variants={fadeUp}
      custom={custom}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group bg-white transition-shadow duration-200 flex flex-col justify-between"
      style={{
        minHeight: 130, borderRadius: 18, padding: 20,
        border: CARD_BORDER, borderTop: `3px solid ${s.top}`,
        boxShadow: SHADOW_REST,
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
    >
      <div className="flex items-start justify-between" style={{ gap: 12 }}>
        <p className="truncate" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
          {label}
        </p>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, color: s.iconText, border: `1px solid ${s.iconBorder}` }}
        >
          {icon}
        </div>
      </div>
      <h3 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: "#0f172a", letterSpacing: "-0.02em" }}>
        {value}
      </h3>
      <div>
        <span
          className="inline-flex items-center"
          style={{ gap: 6, padding: "3px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: s.chipBg, color: s.chipText }}
        >
          <span style={{ color: s.chipIcon, display: "inline-flex" }}>{chipIcon}</span>
          {chipLabel}
        </span>
      </div>
    </motion.div>
  );
}

function Section({
  custom, icon, iconColor, title, subtitle, right, children,
}: {
  custom: number; icon: React.ReactNode; iconColor: string; title: string;
  subtitle?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial="hidden" animate="visible" variants={fadeUp} custom={custom}
      className="w-full h-full bg-white flex flex-col"
      style={{ borderRadius: 18, padding: 24, border: CARD_BORDER, boxShadow: SHADOW_REST }}
    >
      <div className="flex items-start justify-between" style={{ gap: 16, marginBottom: 20 }}>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: `${iconColor}1a`, color: iconColor }}>
            {icon}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 14, fontWeight: 400, color: "#64748b", marginTop: 4 }}>{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </motion.div>
  );
}

function ViewAllButton({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center transition-colors duration-200 cursor-pointer group shrink-0"
      style={{ gap: 4, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, color }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}14`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <span>View all</span>
      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

function QuickAction({
  icon, iconColor, title, description, onClick,
}: {
  icon: React.ReactNode; iconColor: string; title: string; description: string; onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group bg-white transition-shadow duration-200 cursor-pointer flex items-center justify-between"
      style={{ height: 88, padding: 20, borderRadius: 16, gap: 12, border: CARD_BORDER, boxShadow: SHADOW_REST }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
    >
      <div className="flex items-center min-w-0" style={{ gap: 14 }}>
        <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: `${iconColor}14`, color: iconColor }}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="truncate" style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{title}</h3>
          <p className="truncate" style={{ fontSize: 14, fontWeight: 400, color: "#64748b", marginTop: 2 }}>{description}</p>
        </div>
      </div>
      <div
        className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        style={{ width: 28, height: 28, borderRadius: 999, background: "#f1f5f9", color: "#64748b" }}
      >
        <ArrowRight size={14} />
      </div>
    </motion.div>
  );
}

function EmptyState({
  icon, iconColor, title, description, button,
}: {
  icon: React.ReactNode; iconColor: string; title: string; description: string; button?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center text-center mx-auto"
      style={{ minHeight: 280, maxWidth: 500, gap: 16, paddingTop: 24, paddingBottom: 24 }}
    >
      <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: `${iconColor}14`, color: iconColor }}>
        {icon}
      </div>
      <div style={{ maxWidth: 420 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>{title}</h3>
        <p style={{ fontSize: 14, fontWeight: 400, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>{description}</p>
      </div>
      {button && <div style={{ marginTop: 4 }}>{button}</div>}
    </div>
  );
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [restRes, compRes, certRes] = await Promise.allSettled([
        getOwnerRestaurants(),
        getMyComplaints(),
        getCertificates(),
      ]);

      if (restRes.status === "fulfilled") {
        setRestaurants(
          Array.isArray(restRes.value) ? restRes.value : restRes.value.data ?? []
        );
      }
      if (compRes.status === "fulfilled") {
        setComplaints(
          Array.isArray(compRes.value) ? compRes.value : compRes.value.data ?? []
        );
      }
      if (certRes.status === "fulfilled") {
        setCertificates(
          Array.isArray(certRes.value) ? certRes.value : certRes.value.data ?? []
        );
      }
      if (isRefresh) toast("Dashboard data refreshed", "success");
    } catch {
      toast("Failed to load owner dashboard data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const avgSafetyScore =
    restaurants.length > 0
      ? (
          restaurants.reduce((sum, r) => sum + (Number(r.safety_score) || 0), 0) /
          restaurants.length
        ).toFixed(1)
      : "—";

  const pendingComplaints = complaints.filter(
    (c) => c.status === "pending" || c.status === "in_review"
  ).length;

  const expiringCertificates = certificates.filter((cert) => {
    if (!cert.expiry_date) return false;
    const diff = new Date(cert.expiry_date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const ownerName = user?.name ? user.name.split(" ")[0] : "Owner";
  const scorePct = Math.min(100, Math.max(0, Number(avgSafetyScore) || 0));

  return (
    <DashboardLayout title="Owner Dashboard">
      <div className="flex flex-col w-full" style={{ gap: 24 }}>

        {/* ─── Hero / Personalized Welcome Banner ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="w-full border border-emerald-500/25 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white shadow-lg relative overflow-hidden shrink-0"
          style={{ borderRadius: 20, padding: 32 }}
        >
          {/* Ambient background glow */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between" style={{ gap: 32, minHeight: 132 }}>
            <div style={{ maxWidth: 700 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md" style={{ padding: "6px 14px" }}>
                <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                <span>SafeBite Business Owner Portal</span>
              </div>

              <h1 className="text-white" style={{ fontSize: 36, fontWeight: 700, lineHeight: "44px", letterSpacing: "-0.02em", marginTop: 16 }}>
                Welcome back, {ownerName}
              </h1>

              <p className="text-emerald-100/90 font-normal" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 8 }}>
                You are currently managing{" "}
                <span className="font-bold text-white underline decoration-emerald-400 underline-offset-4">{restaurants.length} restaurant establishment{restaurants.length === 1 ? "" : "s"}</span>. Track compliance certificates, audit ratings, and customer feedback seamlessly.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => navigate("/owner/restaurants?add=true")}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-950/40 hover:shadow-xl cursor-pointer border border-emerald-400/30"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12 }}
                >
                  <Plus size={17} strokeWidth={2.5} />
                  <span>Add New Restaurant</span>
                </button>

                <button
                  onClick={() => navigate("/owner/certificates")}
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white font-semibold text-sm transition-all duration-200 backdrop-blur-md border border-white/25 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12 }}
                >
                  <Upload size={17} strokeWidth={2} />
                  <span>Upload Certificate</span>
                </button>
              </div>
            </div>

            {/* Right: Portfolio Health Badge */}
            <div className="hidden lg:block shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-md space-y-2.5" style={{ width: 340, padding: 20, borderRadius: 16 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Health Rating</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    Verified
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <p className="text-xl font-black text-white">{avgSafetyScore}/100</p>
                    <p className="text-[10px] text-emerald-200">Portfolio Average</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Award size={12} /> SafeBite Certified
                    </span>
                  </div>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full shadow-sm" style={{ width: `${scorePct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Statistic Cards Row ─── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 shrink-0" style={{ gap: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[130px] rounded-[18px]" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 shrink-0"
            style={{ gap: 20 }}
            initial="hidden"
            animate="visible"
          >
            <StatCard
              color="emerald" custom={1}
              label="My Restaurants" value={restaurants.length}
              icon={<Store size={20} strokeWidth={2} />}
              chipIcon={<Building2 size={12} />} chipLabel="Active locations"
              onClick={() => navigate("/owner/restaurants")}
            />
            <StatCard
              color="blue" custom={2}
              label="Certificates" value={certificates.length}
              icon={<FileCheck size={20} strokeWidth={2} />}
              chipIcon={<FileCheck size={12} />}
              chipLabel={expiringCertificates > 0 ? `${expiringCertificates} expiring soon` : "All permits active"}
              onClick={() => navigate("/owner/certificates")}
            />
            <StatCard
              color="amber" custom={3}
              label="Pending Complaints" value={pendingComplaints}
              icon={<AlertTriangle size={20} strokeWidth={2} />}
              chipIcon={<Clock size={12} />} chipLabel="Requires review"
              onClick={() => navigate("/owner/complaints")}
            />
            <StatCard
              color="purple" custom={4}
              label="Avg Safety Score" value={avgSafetyScore}
              icon={<ShieldCheck size={20} strokeWidth={2} />}
              chipIcon={<Award size={12} />} chipLabel="Portfolio rating"
            />
          </motion.div>
        )}

        {/* ─── Section 1: Owner Quick Actions ─── */}
        <Section
          custom={5}
          icon={<Sparkles size={18} />} iconColor="#10b981"
          title="Owner Quick Actions"
          right={<span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>Fast Access</span>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
            <QuickAction
              icon={<Plus size={20} strokeWidth={2.5} />} iconColor="#10b981"
              title="Add Restaurant" description="Register a new location"
              onClick={() => navigate("/owner/restaurants?add=true")}
            />
            <QuickAction
              icon={<Upload size={18} strokeWidth={2.5} />} iconColor="#2563eb"
              title="Upload Certificate" description="Submit health & safety permits"
              onClick={() => navigate("/owner/certificates")}
            />
            <QuickAction
              icon={<AlertTriangle size={18} strokeWidth={2.5} />} iconColor="#d97706"
              title="Review Complaints" description="Address customer feedback"
              onClick={() => navigate("/owner/complaints")}
            />
            <QuickAction
              icon={<RefreshCw size={18} strokeWidth={2.5} className={refreshing ? "animate-spin" : ""} />} iconColor="#64748b"
              title="Refresh Dashboard" description="Sync latest records"
              onClick={() => fetchData(true)}
            />
          </div>
        </Section>

        {/* ─── Sections 2 & 3: Establishments + Complaints (side by side) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch" style={{ gap: 24 }}>

          {/* ─── Section 2: My Managed Establishments ─── */}
          <Section
            custom={6}
            icon={<Store size={18} />} iconColor="#10b981"
            title="My Managed Establishments"
            subtitle="Active restaurants in your account portfolio"
            right={<ViewAllButton color="#059669" onClick={() => navigate("/owner/restaurants")} />}
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : restaurants.length === 0 ? (
              <EmptyState
                icon={<Store size={26} />} iconColor="#10b981"
                title="No restaurants added yet"
                description="Add your first establishment to start tracking safety scores and audits."
                button={
                  <button
                    onClick={() => navigate("/owner/restaurants?add=true")}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                    style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
                  >
                    <Plus size={16} />
                    <span>Add First Restaurant</span>
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {restaurants.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/restaurant/${r.id}`)}
                    className="group transition-shadow duration-200 cursor-pointer flex items-center justify-between gap-3"
                    style={{ padding: 16, borderRadius: 12, border: CARD_BORDER, background: "#fff" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Store size={16} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate" style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                          {r.name}
                        </p>
                        <p className="truncate" style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>
                          {r.address || (r as any).city || "Verified Establishment"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={(r as any).status || "pending"} />
                      {r.safety_score != null && (
                        <SafetyScoreBadge score={r.safety_score} />
                      )}
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* ─── Section 3: Customer Feedback & Complaints ─── */}
          <Section
            custom={7}
            icon={<AlertTriangle size={18} />} iconColor="#d97706"
            title="Customer Feedback & Complaints"
            subtitle="Reported incidents logged against your establishments"
            right={<ViewAllButton color="#d97706" onClick={() => navigate("/owner/complaints")} />}
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : complaints.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={26} />} iconColor="#10b981"
                title="Zero active complaints!"
                description="All your establishments maintain excellent health & sanitation standards."
              />
            ) : (
              <div className="space-y-3">
                {complaints.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate("/owner/complaints")}
                    className="group transition-shadow duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{ padding: 16, borderRadius: 12, border: CARD_BORDER, background: "#fff" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate" style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                          {c.title ?? c.description}
                        </h4>
                        <p className="truncate" style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>
                          {c.restaurant_name ?? "Establishment"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <StatusBadge status={c.status ?? "pending"} />
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock size={12} />
                        {new Date(c.created_at ?? (c as any).timestamp ?? "").toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

        </div>

      </div>
    </DashboardLayout>
  );
}
