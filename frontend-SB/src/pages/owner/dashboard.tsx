import { useState, useEffect, useCallback } from "react";
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

  const ownerName = user?.name ? user.name.split(" ")[0] : "Establishment Owner";

  return (
    <DashboardLayout title="Owner Dashboard">
      <div className="flex flex-col gap-6 sm:gap-8 w-full pb-16 relative">
        
        {/* Subtle Watermark Background */}
        <div className="absolute right-4 top-12 opacity-[0.03] pointer-events-none text-slate-900 select-none">
          <Store size={320} />
        </div>

        {/* ─── Hero / Personalized Welcome Banner ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="w-full rounded-xl border border-emerald-500/25 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white px-6 sm:px-8 py-6 sm:py-7 shadow-lg relative overflow-hidden shrink-0"
        >
          {/* Ambient background glow */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                <span>SafeBite Business Owner Portal</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Welcome back, {ownerName}
              </h1>
              
              <p className="text-sm text-emerald-100/90 font-normal leading-relaxed">
                You are currently managing <span className="font-bold text-white underline decoration-emerald-400 underline-offset-4">{restaurants.length} restaurant establishment{restaurants.length === 1 ? "" : "s"}</span>. Track compliance certificates, audit ratings, and customer feedback seamlessly.
              </p>

              {/* Quick Actions in Hero */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => navigate("/owner/restaurants?add=true")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-md shadow-emerald-950/40 cursor-pointer border border-emerald-400/30 active:scale-95"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add New Restaurant</span>
                </button>

                <button
                  onClick={() => navigate("/owner/certificates")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-lg transition-all backdrop-blur-md border border-white/20 cursor-pointer active:scale-95"
                >
                  <Upload size={16} strokeWidth={2} />
                  <span>Upload Certificate</span>
                </button>
              </div>
            </div>

            {/* Right: Portfolio Summary Badge */}
            <div className="hidden lg:block shrink-0">
              <div className="w-64 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 p-3.5 text-white shadow-md space-y-2.5">
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
                  <div className="bg-emerald-400 h-full rounded-full shadow-sm" style={{ width: `${Math.min(100, Math.max(0, Number(avgSafetyScore) || 80))}%` }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Statistic Cards Row ─── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 shrink-0"
            initial="hidden"
            animate="visible"
          >
            {/* Stat 1: Managed Restaurants */}
            <motion.div
              variants={fadeUp}
              custom={1}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/owner/restaurants")}
              className="group rounded-xl border-t-4 border-t-emerald-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-emerald-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-emerald-800/80 uppercase tracking-wider truncate">
                    My Restaurants
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {restaurants.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <Store size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[11px] font-semibold">
                  <Building2 size={12} className="text-emerald-600" />
                  Active business locations
                </span>
              </div>
            </motion.div>

            {/* Stat 2: Compliance Certificates */}
            <motion.div
              variants={fadeUp}
              custom={2}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/owner/certificates")}
              className="group rounded-xl border-t-4 border-t-blue-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-blue-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-blue-800/80 uppercase tracking-wider truncate">
                    Certificates
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {certificates.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <FileCheck size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${expiringCertificates > 0 ? "bg-amber-100/70 text-amber-800" : "bg-blue-100/70 text-blue-800"}`}>
                  <FileCheck size={12} />
                  {expiringCertificates > 0 ? `${expiringCertificates} expiring soon` : "All permits active"}
                </span>
              </div>
            </motion.div>

            {/* Stat 3: Customer Complaints */}
            <motion.div
              variants={fadeUp}
              custom={3}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/owner/complaints")}
              className="group rounded-xl border-t-4 border-t-amber-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-amber-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-amber-800/80 uppercase tracking-wider truncate">
                    Pending Complaints
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {pendingComplaints}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 text-[11px] font-semibold">
                  <Clock size={12} className="text-amber-600" />
                  Requires review
                </span>
              </div>
            </motion.div>

            {/* Stat 4: Average Safety Score */}
            <motion.div
              variants={fadeUp}
              custom={4}
              whileHover={{ y: -2 }}
              className="group rounded-xl border-t-4 border-t-purple-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-purple-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-purple-400 transition-all duration-200 flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-purple-800/80 uppercase tracking-wider truncate">
                    Avg Safety Score
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {avgSafetyScore}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <ShieldCheck size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-100/70 text-purple-800 text-[11px] font-semibold">
                  <Award size={12} className="text-purple-600" />
                  Portfolio Rating
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Section: Quick Actions Grid ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="w-full rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600">
                <Sparkles size={16} />
              </div>
              Owner Quick Actions
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fast Access</span>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/owner/restaurants?add=true")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                  <Plus size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                    Add Restaurant
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Register a new location
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/owner/certificates")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                  <Upload size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    Upload Certificate
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Submit health & safety permits
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/owner/complaints")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200">
                  <AlertTriangle size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                    Review Complaints
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Address customer feedback
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fetchData(true)}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-all duration-200">
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors truncate">
                    Refresh Dashboard
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Sync latest records
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Grid: Recent Restaurants & Recent Complaints ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Restaurants Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={6}
            className="w-full rounded-xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.02] to-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600">
                      <Store size={16} />
                    </div>
                    My Managed Establishments
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Active restaurants in your account portfolio
                  </p>
                </div>
                <button
                  onClick={() => navigate("/owner/restaurants")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer group px-2.5 py-1 rounded hover:bg-emerald-50"
                >
                  <span>View all</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                ) : restaurants.length === 0 ? (
                  <div className="rounded-lg border border-slate-200/80 bg-white px-6 py-8 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Store size={24} />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-sm font-bold text-slate-900">No restaurants added yet</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Add your first establishment to start tracking safety scores and audits.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/owner/restaurants?add=true")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer mt-1"
                    >
                      <Plus size={14} />
                      <span>Add First Restaurant</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {restaurants.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        onClick={() => navigate(`/restaurant/${r.id}`)}
                        className="group rounded-lg border border-slate-200/90 bg-white p-3.5 hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                            <Store size={18} strokeWidth={2} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {r.name}
                            </p>
                            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
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
              </div>
            </div>
          </motion.div>

          {/* Recent Complaints Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={7}
            className="w-full rounded-xl border border-amber-500/15 bg-gradient-to-b from-amber-500/[0.02] to-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-600">
                      <AlertTriangle size={16} />
                    </div>
                    Customer Feedback & Complaints
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Reported incidents logged against your establishments
                  </p>
                </div>
                <button
                  onClick={() => navigate("/owner/complaints")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer group px-2.5 py-1 rounded hover:bg-amber-50"
                >
                  <span>View all</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="rounded-lg border border-slate-200/80 bg-white px-6 py-8 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-sm font-bold text-slate-900">Zero active complaints!</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        All your establishments maintain excellent health & sanitation standards.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complaints.slice(0, 5).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => navigate("/owner/complaints")}
                        className="group rounded-lg border border-slate-200/90 bg-white p-3.5 hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            {c.title ?? c.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>{c.restaurant_name ?? "Establishment"}</span>
                            <span>&middot;</span>
                            <span>
                              {new Date(
                                c.created_at ?? (c as any).timestamp ?? ""
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <StatusBadge status={c.status ?? "pending"} />
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </DashboardLayout>
  );
}

