import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  MapPin,
  AlertTriangle,
  Bell,
  ShieldCheck,
  Plus,
  Search,
  FileText,
  TrendingUp,
  Info,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
  MessageSquareWarning,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import RestaurantCard from "@/components/common/restaurant-card";
import Skeleton from "@/components/ui/skeleton";
import StatusBadge from "@/components/common/status-badge";
import { getNearbyRestaurants } from "@/services/restaurant_service";
import { getMyComplaints } from "@/services/complaint_service";
import type { Restaurant, Complaint } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

type StatColor = "emerald" | "amber" | "blue" | "purple";

const STAT_STYLES: Record<StatColor, { top: string; iconBg: string; iconText: string; iconBorder: string; iconHover: string; chipBg: string; chipText: string; chipIcon: string }> = {
  emerald: { top: "#10b981", iconBg: "rgba(16,185,129,0.10)", iconText: "#059669", iconBorder: "rgba(16,185,129,0.20)", iconHover: "#059669", chipBg: "rgba(16,185,129,0.12)", chipText: "#065f46", chipIcon: "#059669" },
  amber:   { top: "#f59e0b", iconBg: "rgba(245,158,11,0.10)", iconText: "#d97706", iconBorder: "rgba(245,158,11,0.20)", iconHover: "#f59e0b", chipBg: "rgba(245,158,11,0.12)", chipText: "#92400e", chipIcon: "#d97706" },
  blue:    { top: "#3b82f6", iconBg: "rgba(59,130,246,0.10)", iconText: "#2563eb", iconBorder: "rgba(59,130,246,0.20)", iconHover: "#2563eb", chipBg: "rgba(59,130,246,0.12)", chipText: "#1e40af", chipIcon: "#2563eb" },
  purple:  { top: "#a855f7", iconBg: "rgba(168,85,247,0.10)", iconText: "#9333ea", iconBorder: "rgba(168,85,247,0.20)", iconHover: "#9333ea", chipBg: "rgba(168,85,247,0.12)", chipText: "#6b21a8", chipIcon: "#9333ea" },
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
        border: "1px solid rgba(15,23,42,0.08)", borderTop: `3px solid ${s.top}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.05)"; }}
    >
      <div className="flex items-start justify-between" style={{ gap: 12 }}>
        <p className="truncate" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
          {label}
        </p>
        <div
          className="flex items-center justify-center shrink-0 transition-colors duration-200"
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

/* Shared design tokens */
const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const SHADOW_HOVER = "0 8px 24px rgba(15,23,42,0.08)";

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
  icon: React.ReactNode; iconColor: string; title: string; description: string; button: React.ReactNode;
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
      <div style={{ marginTop: 4 }}>{button}</div>
    </div>
  );
}

const SAFETY_TIPS = [
  {
    icon: ShieldCheck,
    title: "Check Safety Scores",
    description:
      "Always verify the hygiene score before ordering. A score below 50 indicates high safety risk.",
  },
  {
    icon: AlertTriangle,
    title: "Report Food Safety Issues",
    description:
      "Spotted something suspicious? Report it immediately so inspectors and nearby diners stay protected.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Complaints",
    description:
      "Monitor investigation status in real time. Receive automated alerts whenever inspectors update your case.",
  },
  {
    icon: MapPin,
    title: "Proximity Safety Radar",
    description:
      "Filter dining spots by distance and safety grade to ensure every meal meets verified health standards.",
  },
  {
    icon: Info,
    title: "Stay Instant Alerted",
    description:
      "Turn on push notifications to receive real-time warnings on local restaurant violations and resolution updates.",
  },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantsData, complaintsData] = await Promise.allSettled([
          getNearbyRestaurants(),
          getMyComplaints(),
        ]);

        if (restaurantsData.status === "fulfilled") {
          setRestaurants(
            Array.isArray(restaurantsData.value)
              ? restaurantsData.value.slice(0, 4)
              : (restaurantsData.value as any)?.results?.slice(0, 4) ?? []
          );
        }
        if (complaintsData.status === "fulfilled") {
          setComplaints(
            Array.isArray(complaintsData.value)
              ? complaintsData.value
              : (complaintsData.value as any)?.results ?? []
          );
        }
      } catch {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pendingComplaints = complaints.filter(
    (c) => c.status === "pending" || c.status === "in_review"
  ).length;

  return (
    <DashboardLayout title="Customer Dashboard">
      <div className="flex flex-col w-full" style={{ gap: 24 }}>
        
        {/* ─── Hero / Full Width Banner ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="w-full border border-emerald-500/25 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white shadow-lg relative overflow-hidden shrink-0"
          style={{ borderRadius: 20, padding: 32 }}
        >
          {/* Subtle ambient background glow */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between" style={{ gap: 32, minHeight: 132 }}>
            <div style={{ maxWidth: 700 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md" style={{ padding: "6px 14px" }}>
                <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                <span>SafeBite Verified Dining Portal</span>
              </div>

              <h1 className="text-white" style={{ fontSize: 36, fontWeight: 700, lineHeight: "44px", letterSpacing: "-0.02em", marginTop: 16 }}>
                Welcome back
              </h1>

              <p className="text-emerald-100/90 font-normal" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 8 }}>
                Your food safety portal is active. You currently have{" "}
                <span className="font-bold text-white underline decoration-emerald-400 underline-offset-4">{pendingComplaints} active report{pendingComplaints === 1 ? "" : "s"}</span> and access to real-time hygiene scores across your area.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => navigate("/customer/complaints/new")}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-950/40 hover:shadow-xl cursor-pointer border border-emerald-400/30"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12 }}
                >
                  <Plus size={17} strokeWidth={2.5} />
                  <span>Report Issue</span>
                </button>

                <button
                  onClick={() => navigate("/customer/restaurants")}
                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white font-semibold text-sm transition-all duration-200 backdrop-blur-md border border-white/25 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12 }}
                >
                  <Search size={17} strokeWidth={2} />
                  <span>Explore Restaurants</span>
                </button>
              </div>
            </div>

            {/* Right: SaaS Live Status Graphic */}
            <div className="hidden lg:block shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-md space-y-2.5" style={{ width: 340, padding: 20, borderRadius: 16 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Live Radar</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    Active
                  </span>
                </div>
                
                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <p className="text-xl font-black text-white">98%</p>
                    <p className="text-[10px] text-emerald-200">Verified Safety Rating</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 size={12} /> High Hygiene
                    </span>
                  </div>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[98%] rounded-full shadow-sm" />
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
              label="Nearby Restaurants" value={restaurants.length}
              icon={<MapPin size={20} strokeWidth={2} />}
              chipIcon={<TrendingUp size={12} />} chipLabel="Verified in area"
              onClick={() => navigate("/customer/restaurants")}
            />
            <StatCard
              color="amber" custom={2}
              label="Complaints Submitted" value={complaints.length}
              icon={<AlertTriangle size={20} strokeWidth={2} />}
              chipIcon={<Info size={12} />} chipLabel={`${pendingComplaints} pending review`}
              onClick={() => navigate("/customer/complaints")}
            />
            <StatCard
              color="blue" custom={3}
              label="Notifications" value={0}
              icon={<Bell size={20} strokeWidth={2} />}
              chipIcon={<ShieldCheck size={12} />} chipLabel="No new alerts"
              onClick={() => navigate("/customer/notifications")}
            />
            <StatCard
              color="purple" custom={4}
              label="Safety Tips" value={SAFETY_TIPS.length}
              icon={<ShieldCheck size={20} strokeWidth={2} />}
              chipIcon={<Sparkles size={12} />} chipLabel="Tips available"
            />
          </motion.div>
        )}

        {/* ─── Section 1: Quick Actions ─── */}
        <Section
          custom={5}
          icon={<Sparkles size={18} />} iconColor="#10b981"
          title="Quick Actions"
          right={<span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>Fast Access</span>}
        >
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20 }}>
            <QuickAction
              icon={<Plus size={20} strokeWidth={2.5} />} iconColor="#ef4444"
              title="Report Issue" description="File a food safety complaint directly"
              onClick={() => navigate("/customer/complaints/new")}
            />
            <QuickAction
              icon={<Search size={18} strokeWidth={2.5} />} iconColor="#10b981"
              title="Find Restaurants" description="Browse dining spots by safety scores"
              onClick={() => navigate("/customer/restaurants")}
            />
            <QuickAction
              icon={<FileText size={18} strokeWidth={2.5} />} iconColor="#d97706"
              title="View Complaints" description="Track updates on your submitted reports"
              onClick={() => navigate("/customer/complaints")}
            />
          </div>
        </Section>

        {/* ─── Sections 2 & 3: Nearby Restaurants + Recent Complaints (side by side) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch" style={{ gap: 24 }}>
        {/* ─── Section 2: Nearby Restaurants ─── */}
        <Section
          custom={6}
          icon={<Compass size={18} />} iconColor="#10b981"
          title="Nearby Restaurants"
          subtitle="Verified food safety inspection scores in your immediate area"
          right={<ViewAllButton color="#059669" onClick={() => navigate("/customer/restaurants")} />}
        >
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={<Compass size={26} />} iconColor="#10b981"
              title="No restaurants found in your area"
              description="Enable location access to discover nearby restaurants, or browse all verified dining options across the city."
              button={
                <button
                  onClick={() => navigate("/customer/restaurants")}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
                >
                  <span>Explore All Restaurants</span>
                  <ArrowRight size={16} />
                </button>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
              {restaurants.map((restaurant, i) => (
                <motion.div
                  key={restaurant.id}
                  variants={fadeUp}
                  custom={i + 7}
                  initial="hidden"
                  animate="visible"
                >
                  <RestaurantCard
                    name={restaurant.name}
                    safetyScore={restaurant.safety_score ?? 0}
                    address={restaurant.address ?? ""}
                    phone={restaurant.phone_number}
                    ownerVerified={restaurant.owner_verified}
                    isHighRisk={restaurant.is_high_risk}
                    onViewDetails={() =>
                      navigate(`/restaurant/${restaurant.id}`)
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}
        </Section>

        {/* ─── Section 3: Recent Complaints ─── */}
        <Section
          custom={10}
          icon={<MessageSquareWarning size={18} />} iconColor="#d97706"
          title="Your Recent Complaints"
          subtitle="Live investigation status for your submitted hygiene reports"
          right={<ViewAllButton color="#d97706" onClick={() => navigate("/customer/complaints")} />}
        >
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={26} />} iconColor="#d97706"
              title="No active complaints"
              description="You haven't reported any hygiene issues yet."
              button={
                <button
                  onClick={() => navigate("/customer/complaints/new")}
                  className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
                >
                  <Plus size={16} />
                  <span>File a Complaint</span>
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 3).map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => navigate("/customer/complaints")}
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
                        {complaint.title}
                      </h4>
                      <p className="truncate" style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>
                        {complaint.restaurant_name ? `At ${complaint.restaurant_name}` : complaint.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <StatusBadge status={complaint.status} />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock size={12} />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
        </div>

        {/* ─── Section 4: Food Safety Guidelines & Tips ─── */}
        <Section
          custom={11}
          icon={<ShieldCheck size={18} />} iconColor="#9333ea"
          title="Food Safety Guidelines & Tips"
          subtitle="Essential hygiene advice for safe and healthy dining habits"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
            {SAFETY_TIPS.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={tip.title}
                  variants={fadeUp}
                  custom={i + 12}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white transition-shadow duration-200 flex items-start"
                  style={{ minHeight: 110, padding: 20, borderRadius: 16, gap: 14, border: CARD_BORDER, borderLeft: "3px solid #a855f7", boxShadow: SHADOW_REST }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
                >
                  <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(168,85,247,0.10)", color: "#9333ea" }}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                      {tip.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5, marginTop: 4 }}>
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>

      </div>
    </DashboardLayout>
  );
}
