import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  FileWarning,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import SafetyScoreBadge from "@/components/common/safety-score";
import StatusBadge from "@/components/common/status-badge";
import { useToast } from "@/components/common/toast";
import Skeleton from "@/components/ui/skeleton";
import { getRestaurants, updateRestaurantStatus } from "@/services/restaurant_service";
import type { Restaurant } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* Shared design tokens */
const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const SHADOW_HOVER = "0 8px 24px rgba(15,23,42,0.08)";

const FIELD_STYLE: React.CSSProperties = {
  width: "100%", borderRadius: 12, border: CARD_BORDER, fontSize: 15, color: "#0f172a", background: "#fff",
};
const FIELD_CLASS = "outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

type StatColor = "blue" | "red" | "emerald";
const STAT_STYLES: Record<StatColor, { top: string; iconBg: string; iconText: string; iconBorder: string }> = {
  blue:    { top: "#3b82f6", iconBg: "rgba(59,130,246,0.10)", iconText: "#2563eb", iconBorder: "rgba(59,130,246,0.20)" },
  red:     { top: "#ef4444", iconBg: "rgba(239,68,68,0.10)", iconText: "#dc2626", iconBorder: "rgba(239,68,68,0.20)" },
  emerald: { top: "#10b981", iconBg: "rgba(16,185,129,0.10)", iconText: "#059669", iconBorder: "rgba(16,185,129,0.20)" },
};

function StatCard({ color, label, value, icon }: { color: StatColor; label: string; value: number; icon: React.ReactNode }) {
  const s = STAT_STYLES[color];
  return (
    <div
      className="bg-white transition-shadow duration-200 flex flex-col justify-between"
      style={{ minHeight: 130, borderRadius: 18, padding: 20, border: CARD_BORDER, borderTop: `3px solid ${s.top}`, boxShadow: SHADOW_REST }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
    >
      <div className="flex items-start justify-between" style={{ gap: 12 }}>
        <p className="truncate" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
          {label}
        </p>
        <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, color: s.iconText, border: `1px solid ${s.iconBorder}` }}>
          {icon}
        </div>
      </div>
      <h3 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: "#0f172a", letterSpacing: "-0.02em" }}>
        {value}
      </h3>
    </div>
  );
}

function CertificateBadge({ status }: { status: string }) {
  if (status === "valid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Valid License
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
        <AlertTriangle className="h-3 w-3 text-rose-600" /> Expired License
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
      <FileWarning className="h-3 w-3 text-slate-400" /> {status || "Pending Audit"}
    </span>
  );
}

function SafetyCircleScore({ score }: { score: number | string }) {
  const numScore = typeof score === "number" ? score : Number(score) || 0;
  const getColors = (s: number) => {
    if (s >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-500/20";
    if (s >= 60) return "bg-amber-50 text-amber-700 border-amber-300 ring-amber-500/20";
    if (s >= 40) return "bg-orange-50 text-orange-700 border-orange-300 ring-orange-500/20";
    return "bg-rose-50 text-rose-700 border-rose-300 ring-rose-500/20";
  };

  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border font-black text-sm shadow-sm ring-4 ${getColors(numScore)}`}>
      {numScore.toFixed(0)}
    </div>
  );
}

function RestaurantExpanded({
  restaurant,
  onStatusChange,
}: {
  restaurant: Restaurant;
  onStatusChange: (id: string, newStatus: string) => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      await updateRestaurantStatus(restaurant.id, newStatus);
      onStatusChange(restaurant.id, newStatus);
      toast(
        `Establishment ${newStatus === "active" ? "Approved" : "Rejected"} successfully.`,
        newStatus === "active" ? "success" : "warning"
      );
    } catch (err: any) {
      toast(err?.response?.data?.detail || "Failed to update establishment status.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const status = restaurant.status || "pending";

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-5" style={{ borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Details */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Establishment Info</h4>
            {restaurant.address && (
              <div className="flex items-start gap-2 text-xs font-medium text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{restaurant.address}</span>
              </div>
            )}
            {(restaurant as Record<string, any>).phone_number && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <span>{(restaurant as Record<string, any>).phone_number}</span>
              </div>
            )}
          </div>

          {/* Safety Status */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Audit & Licensing</h4>
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Establishment Status</span>
                <StatusBadge status={status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Safety Rating</span>
                <SafetyScoreBadge score={restaurant.safety_score ?? 0} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Food Safety Permit</span>
                <CertificateBadge status={(restaurant as Record<string, any>).certificate_status ?? ""} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assigned Inspector</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {restaurant.assigned_inspector_name || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Complaint History */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Public Complaints</h4>
            {(restaurant as Record<string, any>).complaint_count != null && (restaurant as Record<string, any>).complaint_count > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>{(restaurant as Record<string, any>).complaint_count} customer complaint(s) logged</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                No active complaints filed
              </div>
            )}

            <div className="pt-1">
              <button
                onClick={() => navigate(`/inspector/inspections`)}
                className="inline-flex w-full items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors duration-200 cursor-pointer"
                style={{ height: 38, borderRadius: 10, fontSize: 12 }}
              >
                <Plus size={14} /> Schedule Audit
              </button>
            </div>
          </div>

          {/* Inspector Approval Actions */}
          <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Inspector Decision</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Review submitted documents and verify safety compliance before approving establishment.
            </p>
            <div className="space-y-2 pt-1">
              {status !== "active" && status !== "approved" && (
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus("active")}
                  className="inline-flex w-full items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-60"
                  style={{ height: 38, borderRadius: 10, fontSize: 12 }}
                >
                  <ShieldCheck size={15} /> Approve Establishment
                </button>
              )}
              {status !== "rejected" && (
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus("rejected")}
                  className="inline-flex w-full items-center justify-center gap-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-60"
                  style={{ height: 38, borderRadius: 10, fontSize: 12 }}
                >
                  <FileWarning size={15} /> Reject Establishment
                </button>
              )}
              {(status === "active" || status === "approved") && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Establishment Approved
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function RestaurantsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high_risk" | "valid">("all");
  const [sortBy, setSortBy] = useState<"score_desc" | "score_asc" | "name">("score_desc");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await getRestaurants();
        setRestaurants(data);
      } catch {
        toast("Failed to load restaurants.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [toast]);

  const totalCount = restaurants.length;
  const highRiskCount = restaurants.filter((r) => (r.safety_score ?? 0) < 60).length;
  const verifiedCount = restaurants.filter((r) => (r as any).certificate_status === "valid").length;

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;

    if (riskFilter === "high_risk") {
      result = result.filter((r) => (r.safety_score ?? 0) < 60);
    } else if (riskFilter === "valid") {
      result = result.filter((r) => (r as any).certificate_status === "valid");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.address ?? "").toLowerCase().includes(q) ||
          ((r as any).cuisine_type ?? "").toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      if (sortBy === "score_desc") return (b.safety_score ?? 0) - (a.safety_score ?? 0);
      if (sortBy === "score_asc") return (a.safety_score ?? 0) - (b.safety_score ?? 0);
      return a.name.localeCompare(b.name);
    });
  }, [restaurants, searchQuery, riskFilter, sortBy]);

  const toggleExpand = (id: string | number) => {
    setExpandedId((prev) => (String(prev) === String(id) ? null : id));
  };

  const RISK_FILTERS: { key: "all" | "high_risk" | "valid"; label: string; count: number; active: string }[] = [
    { key: "all", label: "All", count: totalCount, active: "#059669" },
    { key: "high_risk", label: "High Risk", count: highRiskCount, active: "#e11d48" },
    { key: "valid", label: "Valid License", count: verifiedCount, active: "#059669" },
  ];

  return (
    <DashboardLayout title="Restaurants">
      <div className="flex flex-col w-full" style={{ gap: 24 }}>

        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full border border-emerald-500/25 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white shadow-lg relative overflow-hidden shrink-0"
          style={{ borderRadius: 20, padding: 32 }}
        >
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10" style={{ maxWidth: 720 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md" style={{ padding: "6px 14px" }}>
              <Building2 size={13} className="text-emerald-400" />
              <span>Food Service Directory</span>
            </div>
            <h1 className="text-white" style={{ fontSize: 36, fontWeight: 700, lineHeight: "44px", letterSpacing: "-0.02em", marginTop: 16 }}>
              Restaurant Safety Directory
            </h1>
            <p className="text-emerald-100/90 font-normal" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 8 }}>
              Inspect food establishments, monitor safety compliance ratings, review licenses, and track customer health complaints.
            </p>
          </div>
        </motion.div>

        {/* Directory metrics */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid sm:grid-cols-3"
          style={{ gap: 20 }}
        >
          <StatCard color="blue"    label="Registered Restaurants" value={totalCount}    icon={<Building2 size={20} strokeWidth={2} />} />
          <StatCard color="red"     label="High Risk (< 60 Score)" value={highRiskCount} icon={<AlertTriangle size={20} strokeWidth={2} />} />
          <StatCard color="emerald" label="Valid Safety Permits"   value={verifiedCount} icon={<ShieldCheck size={20} strokeWidth={2} />} />
        </motion.div>

        {/* Search + filter + sort toolbar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="relative w-full lg:max-w-md">
            <Search size={17} className="absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ left: 16 }} />
            <input
              placeholder="Search by restaurant name, area, or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-white ${FIELD_CLASS}`}
              style={{ ...FIELD_STYLE, height: 44, paddingLeft: 44, paddingRight: 16 }}
            />
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 12 }}>
            {/* Risk filter segmented control */}
            <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
              {RISK_FILTERS.map(({ key, label, count, active }) => {
                const isActive = riskFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setRiskFilter(key)}
                    className="inline-flex items-center transition-all duration-200 cursor-pointer"
                    style={{
                      gap: 8, height: 40, padding: "0 14px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                      border: isActive ? `1px solid ${active}` : CARD_BORDER,
                      background: isActive ? active : "#fff",
                      color: isActive ? "#fff" : "#475569",
                      boxShadow: isActive ? SHADOW_REST : "none",
                    }}
                  >
                    {label}
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        minWidth: 22, height: 20, padding: "0 6px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                        background: isActive ? "rgba(255,255,255,0.22)" : "#f1f5f9",
                        color: isActive ? "#fff" : "#64748b",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center" style={{ gap: 8 }}>
              <span className="flex items-center text-slate-500" style={{ gap: 4, fontSize: 13, fontWeight: 600 }}>
                <ArrowUpDown size={14} /> Sort
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className={`cursor-pointer ${FIELD_CLASS}`}
                style={{ ...FIELD_STYLE, height: 40, padding: "0 12px", fontSize: 14, fontWeight: 600 }}
              >
                <option value="score_desc">Safety Score (High → Low)</option>
                <option value="score_asc">Safety Score (Low → High)</option>
                <option value="name">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* List / empty */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div
              className="flex flex-col items-center justify-center text-center mx-auto"
              style={{ minHeight: 280, maxWidth: 460, gap: 16, padding: "40px 24px" }}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(59,130,246,0.10)", color: "#2563eb" }}>
                <Building2 size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                  {searchQuery || riskFilter !== "all" ? "No restaurants match criteria" : "No restaurants registered yet"}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  {searchQuery || riskFilter !== "all"
                    ? "Try adjusting your search terms or risk filters."
                    : "Registered establishments will appear here for inspection and review."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredRestaurants.map((restaurant) => {
                const isExpanded = String(expandedId) === String(restaurant.id);
                const score = restaurant.safety_score ?? 0;

                return (
                  <motion.div key={restaurant.id} variants={itemVariants} layout>
                    <div
                      className="group bg-white transition-shadow duration-200"
                      style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
                    >
                      <div
                        className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                        onClick={() => toggleExpand(restaurant.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <SafetyCircleScore score={score} />

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                {restaurant.name}
                              </h3>
                              <StatusBadge status={restaurant.status || "pending"} />
                              <CertificateBadge status={(restaurant as Record<string, any>).certificate_status ?? ""} />
                              {restaurant.assigned_inspector_name && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                                  <ShieldCheck className="h-3 w-3 text-indigo-600" /> {restaurant.assigned_inspector_name}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                              {restaurant.address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                  {restaurant.address}
                                </span>
                              )}
                              {(restaurant as Record<string, any>).complaint_count != null && (restaurant as Record<string, any>).complaint_count > 0 && (
                                <span className="flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md">
                                  <AlertTriangle className="h-3 w-3" />
                                  {(restaurant as Record<string, any>).complaint_count} Complaint(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/inspector/inspections`); }}
                            className="inline-flex items-center gap-1.5 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors duration-200 cursor-pointer"
                            style={{ height: 36, padding: "0 12px", borderRadius: 10, fontSize: 13 }}
                          >
                            <Plus size={14} /> Schedule
                          </button>
                          <div className="flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-colors" style={{ width: 36, height: 36, borderRadius: 10 }}>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <RestaurantExpanded
                            restaurant={restaurant}
                            onStatusChange={(id, newStatus) => {
                              setRestaurants((prev) =>
                                prev.map((r) =>
                                  String(r.id) === String(id) ? { ...r, status: newStatus as any } : r
                                )
                              );
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
