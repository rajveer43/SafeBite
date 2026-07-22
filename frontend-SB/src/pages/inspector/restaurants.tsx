import { useEffect, useState, useMemo } from "react";
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
  Calendar,
  Utensils,
  Plus,
  ArrowUpDown,
  FileText,
  BadgeAlert,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import SafetyScoreBadge from "@/components/common/safety-score";
import StatusBadge from "@/components/common/status-badge";
import EmptyState from "@/components/common/empty-state";
import { useToast } from "@/components/common/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
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
      <div className="border-t border-slate-100 bg-slate-50/70 p-5 rounded-b-2xl space-y-5">
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

            <div className="pt-1 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => navigate(`/inspector/inspections`)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Schedule Audit
              </Button>
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
                <Button
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus("active")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Approve Establishment
                </Button>
              )}
              {status !== "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() => handleUpdateStatus("rejected")}
                  className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl"
                >
                  <FileWarning className="mr-1.5 h-4 w-4" /> Reject Establishment
                </Button>
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

  return (
    <DashboardLayout title="Restaurants">
      <div className="space-y-8 pb-12">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <Building2 className="h-3.5 w-3.5" /> Food Service Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Restaurant Safety Directory</h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Inspect food establishments, monitor safety compliance ratings, review licenses, and track customer health complaints.
            </p>
          </div>

          {/* Directory Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 pt-6 border-t border-slate-700/60">
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
              <div className="text-xs font-medium text-slate-300">Registered Restaurants</div>
              <div className="mt-1 text-2xl font-extrabold text-white">{totalCount}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
              <div className="text-xs font-medium text-rose-300">High Risk (&lt;60 Score)</div>
              <div className="mt-1 text-2xl font-extrabold text-rose-400">{highRiskCount}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
              <div className="text-xs font-medium text-emerald-300">Valid Safety Permits</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-400">{verifiedCount}</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by restaurant name, area, or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setRiskFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  riskFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({restaurants.length})
              </button>
              <button
                onClick={() => setRiskFilter("high_risk")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  riskFilter === "high_risk" ? "bg-rose-500 text-white shadow-sm" : "text-slate-600 hover:text-rose-600"
                }`}
              >
                High Risk ({highRiskCount})
              </button>
              <button
                onClick={() => setRiskFilter("valid")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  riskFilter === "valid" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                Valid License ({verifiedCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-emerald-500"
              >
                <option value="score_desc">Safety Score (High → Low)</option>
                <option value="score_asc">Safety Score (Low → High)</option>
                <option value="name">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Restaurant List Cards */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No restaurants match criteria</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search terms or risk filters.
            </p>
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
                    <div className="group rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-300">
                      <div
                        className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                        onClick={() => toggleExpand(restaurant.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Circular Score Badge */}
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

                        <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/inspector/inspections`);
                            }}
                            className="rounded-xl text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Schedule
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl text-slate-400 hover:text-slate-700">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </Button>
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
