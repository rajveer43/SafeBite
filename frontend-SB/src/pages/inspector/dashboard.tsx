import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FileSearch,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  ClipboardCheck,
  Award,
  FileText,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import Skeleton from "@/components/ui/skeleton";
import StatusBadge from "@/components/common/status-badge";
import { useAuth } from "@/contexts/auth_context";
import { useToast } from "@/components/common/toast";
import { getInspections } from "@/services/inspection_service";
import type { Inspection } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function InspectorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInspections = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getInspections();
      setInspections(Array.isArray(data) ? data : (data as any)?.results ?? []);
      if (isRefresh) toast("Inspections data refreshed", "success");
    } catch {
      toast("Failed to load inspections data.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const pending = inspections.filter((i) => i.status === "scheduled" || i.status === "in_progress");
  const completed = inspections.filter((i) => i.status === "completed");
  const inProgress = inspections.filter((i) => i.status === "in_progress");

  const upcomingInspections = [...pending]
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
    .slice(0, 5);

  const recentCompleted = [...completed]
    .sort((a, b) => new Date(b.completed_date ?? b.scheduled_date).getTime() - new Date(a.completed_date ?? a.scheduled_date).getTime())
    .slice(0, 5);

  const totalComplaintsCount = inspections.reduce((acc, i) => acc + ((i as any).complaint_count as number ?? 0), 0);
  const uniqueRestaurantsCount = new Set(completed.map((i) => i.restaurant_id)).size;

  const inspectorName = user?.name ? user.name.split(" ")[0] : "Inspector";

  return (
    <DashboardLayout title="Inspector Dashboard">
      <div className="flex flex-col gap-6 sm:gap-8 w-full pb-16 relative">
        
        {/* Subtle Watermark Icons */}
        <div className="absolute right-4 top-12 opacity-[0.03] pointer-events-none text-slate-900 select-none">
          <ClipboardCheck size={320} />
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
                <span>SafeBite Inspector Workstation</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Welcome back, {inspectorName}
              </h1>
              
              <p className="text-sm text-emerald-100/90 font-normal leading-relaxed">
                You have <span className="font-bold text-white underline decoration-emerald-400 underline-offset-4">{pending.length} pending audit{pending.length === 1 ? "" : "s"}</span> scheduled. Review upcoming site visits, complete reports, and maintain city-wide food safety standards.
              </p>

              {/* Quick Actions in Hero */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => navigate("/inspector/inspections")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-md shadow-emerald-950/40 cursor-pointer border border-emerald-400/30 active:scale-95"
                >
                  <FileSearch size={16} strokeWidth={2.5} />
                  <span>View All Inspections</span>
                </button>

                <button
                  onClick={() => navigate("/inspector/restaurants")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-lg transition-all backdrop-blur-md border border-white/20 cursor-pointer active:scale-95"
                >
                  <Search size={16} strokeWidth={2} />
                  <span>Search Restaurants</span>
                </button>
              </div>
            </div>

            {/* Right: SaaS Workload Badge */}
            <div className="hidden lg:block shrink-0">
              <div className="w-64 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 p-3.5 text-white shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Audit Workload</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    Active Session
                  </span>
                </div>
                
                <div className="flex items-baseline justify-between pt-0.5">
                  <div>
                    <p className="text-xl font-black text-white">{completed.length}</p>
                    <p className="text-[10px] text-emerald-200">Completed Audits</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 size={12} /> Verified Standards
                    </span>
                  </div>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[100%] rounded-full shadow-sm" />
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
            {/* Stat 1: Pending Inspections */}
            <motion.div
              variants={fadeUp}
              custom={1}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/inspector/inspections")}
              className="group rounded-xl border-t-4 border-t-amber-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-amber-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-amber-800/80 uppercase tracking-wider truncate">
                    Pending Inspections
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {pending.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200 shadow-xs">
                  <Clock size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 text-[11px] font-semibold">
                  <Clock size={12} className="text-amber-600" />
                  {inProgress.length} in progress
                </span>
              </div>
            </motion.div>

            {/* Stat 2: Completed Inspections */}
            <motion.div
              variants={fadeUp}
              custom={2}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/inspector/inspections")}
              className="group rounded-xl border-t-4 border-t-emerald-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-emerald-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-emerald-800/80 uppercase tracking-wider truncate">
                    Completed Audits
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {completed.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <CheckCircle2 size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[11px] font-semibold">
                  <Award size={12} className="text-emerald-600" />
                  Verified & Signed
                </span>
              </div>
            </motion.div>

            {/* Stat 3: Total Complaints */}
            <motion.div
              variants={fadeUp}
              custom={3}
              whileHover={{ y: -2 }}
              className="group rounded-xl border-t-4 border-t-red-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-red-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-red-400 transition-all duration-200 flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-red-800/80 uppercase tracking-wider truncate">
                    Total Complaints
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {totalComplaintsCount}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-100/70 text-red-800 text-[11px] font-semibold">
                  <AlertTriangle size={12} className="text-red-600" />
                  Flagged violations
                </span>
              </div>
            </motion.div>

            {/* Stat 4: Restaurants Inspected */}
            <motion.div
              variants={fadeUp}
              custom={4}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/inspector/restaurants")}
              className="group rounded-xl border-t-4 border-t-purple-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-purple-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-purple-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-purple-800/80 uppercase tracking-wider truncate">
                    Restaurants Inspected
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {uniqueRestaurantsCount}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <Building2 size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-100/70 text-purple-800 text-[11px] font-semibold">
                  <ShieldCheck size={12} className="text-purple-600" />
                  Active coverage
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Section 1: Quick Actions (Full Width Container) ─── */}
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
              Inspector Quick Actions
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fast Access</span>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/inspector/inspections")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                  <FileSearch size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                    View Inspections
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Browse all assigned audits
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
              onClick={() => navigate("/inspector/restaurants")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                  <Building2 size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    Search Restaurants
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Look up establishment records
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
              onClick={() => navigate("/inspector/inspections")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-purple-400 transition-all duration-200 cursor-pointer flex flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
                  <Calendar size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                    Schedule Inspection
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Plan new site evaluation
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fetchInspections(true)}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-all duration-200">
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-800 transition-colors truncate">
                    Refresh Data
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Sync latest database records
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Grid: Upcoming Inspections & Recent Completed ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Upcoming Inspections Timeline Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={6}
            className="w-full rounded-xl border border-amber-500/15 bg-gradient-to-b from-amber-500/[0.02] to-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <div className="p-1 rounded-md bg-amber-500/10 text-amber-600">
                      <Calendar size={16} />
                    </div>
                    Upcoming Inspections
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Scheduled site evaluations requiring inspector review
                  </p>
                </div>
                <button
                  onClick={() => navigate("/inspector/inspections")}
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
                ) : upcomingInspections.length === 0 ? (
                  <div className="rounded-lg border border-slate-200/80 bg-white px-6 py-8 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-sm font-bold text-slate-900">No upcoming inspections</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        You have no site audits scheduled at this moment.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/inspector/inspections")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer mt-1"
                    >
                      <Plus size={14} />
                      <span>Schedule New Inspection</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {upcomingInspections.map((inspection) => (
                      <div
                        key={inspection.id}
                        onClick={() => navigate("/inspector/inspections")}
                        className="group relative pl-8 rounded-lg border border-slate-200/90 bg-white p-3.5 hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
                      >
                        {/* Timeline Bullet Dot */}
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-100 shrink-0" />
                        
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            {inspection.restaurant_name ?? `Restaurant #${inspection.restaurant_id}`}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{new Date(inspection.scheduled_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={inspection.status} />
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

          {/* Recent Completed Inspections Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={7}
            className="w-full rounded-xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.02] to-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    Recent Completed Inspections
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Verified audits with final safety scores and signed records
                  </p>
                </div>
                <button
                  onClick={() => navigate("/inspector/inspections")}
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
                ) : recentCompleted.length === 0 ? (
                  <div className="rounded-lg border border-slate-200/80 bg-white px-6 py-8 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h3 className="text-sm font-bold text-slate-900">No completed audits yet</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Completed inspection reports will be logged here.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/inspector/inspections")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer mt-1"
                    >
                      <FileSearch size={14} />
                      <span>Review Pending Audits</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCompleted.map((inspection) => (
                      <div
                        key={inspection.id}
                        onClick={() => navigate("/inspector/inspections")}
                        className="group rounded-lg border border-slate-200/90 bg-white p-3.5 hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {inspection.restaurant_name ?? `Restaurant #${inspection.restaurant_id}`}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>
                              {inspection.completed_date
                                ? new Date(inspection.completed_date).toLocaleDateString()
                                : "Completed"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {inspection.score != null ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 text-xs font-black border border-emerald-500/20">
                              <Award size={13} />
                              {inspection.score}/100
                            </span>
                          ) : (
                            <StatusBadge status="completed" />
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

        </div>

      </div>
    </DashboardLayout>
  );
}
