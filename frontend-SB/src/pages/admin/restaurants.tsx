import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import SearchBar from "@/components/common/search-bar";
import DataTable from "@/components/tables/data-table";
import SafetyScoreBadge from "@/components/common/safety-score";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import Pagination from "@/components/ui/pagination";
import { useToast } from "@/components/common/toast";
import { getRestaurants } from "@/services/restaurant_service";
import { getInspectors, assignInspectorToRestaurant } from "@/services/admin_service";
import { motion } from "motion/react";
import { Store, AlertTriangle, CheckCircle, XCircle, MapPin, ShieldCheck, Loader2, UserCheck } from "lucide-react";
import type { Restaurant, PaginatedResponse } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

interface InspectorOption {
  id: string;
  name: string;
  email: string;
}

export default function AdminRestaurants() {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [inspectors, setInspectors] = useState<InspectorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState<string>("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInspectorsList = useCallback(async () => {
    try {
      const data = await getInspectors();
      setInspectors(data ?? []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchInspectorsList();
  }, [fetchInspectorsList]);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, per_page: 15 };
      if (search) params.search = search;
      if (minScore) params.min_safety_score = Number(minScore);
      if (maxScore) params.max_safety_score = Number(maxScore);
      if (highRiskOnly) params.is_high_risk = true;
      const res: PaginatedResponse<Restaurant> = await getRestaurants(params as Parameters<typeof getRestaurants>[0]);
      setRestaurants(res.items ?? []);
      setTotalPages(res.total_pages ?? 1);
    } catch {
      toast("Failed to load restaurants", "error");
    } finally {
      setLoading(false);
    }
  }, [search, minScore, maxScore, highRiskOnly, page, toast]);

  useEffect(() => {
    const timeout = setTimeout(fetchRestaurants, search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchRestaurants, search]);

  useEffect(() => {
    setPage(1);
  }, [search, minScore, maxScore, highRiskOnly]);

  const handleAssignInspector = async (restaurantId: string, inspectorId: string | null) => {
    try {
      setAssigningId(restaurantId);
      const updated = await assignInspectorToRestaurant(restaurantId, inspectorId);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, ...updated } : r))
      );
      const assignedInspector = inspectors.find((i) => i.id === inspectorId);
      toast(
        inspectorId
          ? `Assigned ${assignedInspector?.name ?? "inspector"} to restaurant`
          : "Unassigned inspector from restaurant",
        "success"
      );
    } catch {
      toast("Failed to assign inspector", "error");
    } finally {
      setAssigningId(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
            <Store size={16} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 truncate">{String(row["name"] ?? "")}</p>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <MapPin size={10} />
              {String(row["address"] ?? "")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "owner_name",
      header: "Owner",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["owner_name"] ?? "N/A")}</span>
      ),
    },
    {
      key: "safety_score",
      header: "Safety Score",
      render: (row: Record<string, unknown>) => (
        <SafetyScoreBadge score={Number(row["safety_score"] ?? 0)} size="sm" />
      ),
    },
    {
      key: "assigned_inspector",
      header: "Assigned Inspector",
      render: (row: Record<string, unknown>) => {
        const restId = String(row["id"] ?? "");
        const currentInspId = String(row["assigned_inspector_id"] ?? "");
        const currentInspName = String(row["assigned_inspector_name"] ?? "");

        return (
          <div className="flex items-center gap-2">
            <UserCheck
              size={15}
              className={currentInspId ? "text-emerald-600 shrink-0" : "text-slate-300 shrink-0"}
            />
            <select
              value={currentInspId}
              disabled={assigningId === restId}
              onChange={(e) => handleAssignInspector(restId, e.target.value || null)}
              className="text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-700 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-50 max-w-[170px] truncate"
            >
              <option value="">Unassigned</option>
              {inspectors.map((insp) => (
                <option key={insp.id} value={insp.id}>
                  {insp.name}
                </option>
              ))}
            </select>
            {assigningId === restId && <Loader2 size={13} className="animate-spin text-emerald-600 shrink-0" />}
          </div>
        );
      },
    },
    {
      key: "is_high_risk",
      header: "High Risk",
      render: (row: Record<string, unknown>) =>
        row["is_high_risk"] ? (
          <Badge variant="danger" size="sm">
            <AlertTriangle size={10} className="mr-1" />
            High Risk
          </Badge>
        ) : (
          <Badge variant="success" size="sm">Safe</Badge>
        ),
    },
    {
      key: "owner_verified",
      header: "Verified",
      render: (row: Record<string, unknown>) =>
        row["owner_verified"] ? (
          <CheckCircle size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-slate-300" />
        ),
    },
  ];

  return (
    <DashboardLayout title="Restaurant Management">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <PageHeader
            title="Restaurants"
            description={`Manage all registered restaurants (${restaurants.length} showing)`}
          />
        </motion.div>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search restaurants by name or location..."
            className="flex-1"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="Min"
                className="w-16 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                min="0"
                max="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="Max"
                className="w-16 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
            <button
              onClick={() => setHighRiskOnly(!highRiskOnly)}
              className={`
                inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
                ${highRiskOnly
                  ? "bg-red-600 text-white shadow-md shadow-red-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              <AlertTriangle size={14} />
              High Risk
            </button>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-5" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <DataTable
                  columns={columns}
                  data={restaurants as unknown as Record<string, unknown>[]}
                  emptyMessage={
                    search || highRiskOnly || minScore || maxScore
                      ? "No restaurants match your filters"
                      : "No restaurants found"
                  }
                />
                {totalPages > 1 && (
                  <div className="flex justify-center p-4 border-t border-slate-100">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
