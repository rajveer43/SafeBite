import { useState, useEffect } from "react";
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
      <div className="flex flex-col gap-6 sm:gap-8 w-full pb-16">
        
        {/* ─── Hero / Full Width Banner ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="w-full rounded-xl border border-emerald-500/25 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white px-6 sm:px-8 py-6 sm:py-7 shadow-lg relative overflow-hidden shrink-0"
        >
          {/* Subtle ambient background glow */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                <span>SafeBite Verified Dining Portal</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Welcome back
              </h1>
              
              <p className="text-sm text-emerald-100/90 font-normal leading-relaxed">
                Your food safety portal is active. You currently have{" "}
                <span className="font-bold text-white underline decoration-emerald-400 underline-offset-4">{pendingComplaints} active report{pendingComplaints === 1 ? "" : "s"}</span> and access to real-time hygiene scores across your area.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => navigate("/customer/complaints/new")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-md shadow-emerald-950/40 cursor-pointer border border-emerald-400/30 active:scale-95"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Report Issue</span>
                </button>

                <button
                  onClick={() => navigate("/customer/restaurants")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-lg transition-all backdrop-blur-md border border-white/20 cursor-pointer active:scale-95"
                >
                  <Search size={16} strokeWidth={2} />
                  <span>Explore Restaurants</span>
                </button>
              </div>
            </div>

            {/* Right: SaaS Live Status Graphic */}
            <div className="hidden lg:block shrink-0">
              <div className="w-64 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 p-3.5 text-white shadow-md space-y-2.5">
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
            {/* Stat 1 */}
            <motion.div
              variants={fadeUp}
              custom={1}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/customer/restaurants")}
              className="group rounded-xl border-t-4 border-t-emerald-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-emerald-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-emerald-800/80 uppercase tracking-wider truncate">
                    Nearby Restaurants
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {restaurants.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <MapPin size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[11px] font-semibold">
                  <TrendingUp size={12} className="text-emerald-600" />
                  Verified in area
                </span>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              variants={fadeUp}
              custom={2}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/customer/complaints")}
              className="group rounded-xl border-t-4 border-t-amber-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-amber-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-amber-800/80 uppercase tracking-wider truncate">
                    Complaints Submitted
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {complaints.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200 shadow-xs">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 text-[11px] font-semibold">
                  <Info size={12} className="text-amber-600" />
                  {pendingComplaints} pending review
                </span>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              variants={fadeUp}
              custom={3}
              whileHover={{ y: -2 }}
              onClick={() => navigate("/customer/notifications")}
              className="group rounded-xl border-t-4 border-t-blue-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-blue-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-blue-800/80 uppercase tracking-wider truncate">
                    Notifications
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    0
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <Bell size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-100/70 text-blue-800 text-[11px] font-semibold">
                  <ShieldCheck size={12} className="text-blue-600" />
                  No new alerts
                </span>
              </div>
            </motion.div>

            {/* Stat 4 */}
            <motion.div
              variants={fadeUp}
              custom={4}
              whileHover={{ y: -2 }}
              className="group rounded-xl border-t-4 border-t-purple-500 border-x border-b border-slate-200/90 bg-gradient-to-br from-purple-500/[0.04] via-white to-white p-5 shadow-xs hover:shadow-md hover:border-purple-400 transition-all duration-200 flex flex-col justify-between gap-4 h-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-extrabold text-purple-800/80 uppercase tracking-wider truncate">
                    Safety Tips
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mt-1">
                    {SAFETY_TIPS.length}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shadow-xs">
                  <ShieldCheck size={20} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-100/70 text-purple-800 text-[11px] font-semibold">
                  <Sparkles size={12} className="text-purple-600" />
                  Tips available
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
              Quick Actions
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fast Access</span>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Action 1 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/customer/complaints/new")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-red-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all duration-200">
                  <Plus size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                    Report Issue
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    File a food safety complaint directly
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-red-50 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Action 2 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/customer/restaurants")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                    Find Restaurants
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Browse dining spots by safety scores
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Action 3 */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate("/customer/complaints")}
              className="group rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
                  <FileText size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                    View Complaints
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Track updates on your submitted reports
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-200">
                <ArrowRight size={14} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Section 2: Nearby Restaurants (Full Width Container) ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={6}
          className="w-full rounded-xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.02] to-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600">
                  <Compass size={16} />
                </div>
                Nearby Restaurants
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Verified food safety inspection scores in your immediate area
              </p>
            </div>
            <button
              onClick={() => navigate("/customer/restaurants")}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer group px-2.5 py-1 rounded hover:bg-emerald-50"
            >
              <span>View all</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="rounded-lg border border-slate-200/80 bg-white px-6 py-8 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                <Compass size={24} />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-sm font-bold text-slate-900">
                  No restaurants found in your area
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Enable location access to discover nearby restaurants, or browse all verified dining options across the city.
                </p>
              </div>
              <button
                onClick={() => navigate("/customer/restaurants")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 cursor-pointer mt-1"
              >
                <span>Explore All Restaurants</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </motion.div>

        {/* ─── Section 3: Recent Complaints Preview (Full Width Container) ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={10}
          className="w-full rounded-xl border border-amber-500/15 bg-gradient-to-b from-amber-500/[0.02] to-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-600">
                  <MessageSquareWarning size={16} />
                </div>
                Your Recent Complaints
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Live investigation status for your submitted hygiene reports
              </p>
            </div>
            <button
              onClick={() => navigate("/customer/complaints")}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer group px-2.5 py-1 rounded hover:bg-amber-50"
            >
              <span>View all</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-lg border border-slate-200/80 bg-white px-6 py-8 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-slate-900">No active complaints</h3>
                <p className="text-xs text-slate-500 font-medium">
                  You haven't reported any hygiene issues yet.
                </p>
              </div>
              <button
                onClick={() => navigate("/customer/complaints/new")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer mt-1"
              >
                <Plus size={14} />
                <span>File a Complaint</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {complaints.slice(0, 3).map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => navigate("/customer/complaints")}
                  className="group rounded-lg border border-slate-200/90 bg-white p-3.5 hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                        {complaint.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
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
        </motion.div>

        {/* ─── Section 4: Food Safety Guidelines & Tips (Full Width Container) ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={11}
          className="w-full rounded-xl border border-purple-500/15 bg-gradient-to-b from-purple-500/[0.02] to-white/70 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="pb-2.5 border-b border-slate-200/80">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <div className="p-1 rounded-md bg-purple-500/10 text-purple-600">
                <ShieldCheck size={16} />
              </div>
              Food Safety Guidelines & Tips
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Essential hygiene advice for safe and healthy dining habits
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="group rounded-lg border-l-4 border-l-purple-500 border-t border-r border-b border-slate-200/90 bg-white p-4 shadow-xs hover:shadow-md hover:border-purple-300 transition-all duration-200 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shadow-xs">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
