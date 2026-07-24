import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  X,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import RestaurantCard from "@/components/common/restaurant-card";
import Card, { CardContent } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Skeleton from "@/components/ui/skeleton";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { getRestaurants } from "@/services/restaurant_service";
import { useDebounce } from "@/hooks/useDebounce";
import type { Restaurant, RestaurantFilters } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* Shared design tokens (matches customer dashboard) */
const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const CONTROL: React.CSSProperties = {
  height: 44, borderRadius: 12, border: CARD_BORDER, fontSize: 15, background: "#fff",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "safety_score", label: "Safety Score" },
  { value: "alphabetical", label: "Alphabetical" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface PaginationState {
  count: number;
  next: string | null;
  previous: string | null;
}

export default function CustomerRestaurants() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [filters, setFilters] = useState<RestaurantFilters>({
    min_safety_score: undefined,
    max_safety_score: undefined,
    is_high_risk: false,
  });
  const [sort, setSort] = useState<SortValue>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const activeFilterCount = [
    filters.min_safety_score !== undefined,
    filters.max_safety_score !== undefined,
    filters.is_high_risk,
  ].filter(Boolean).length;

  const fetchRestaurants = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          page_size: PAGE_SIZE,
          ordering: sort === "alphabetical" ? "name" : sort === "safety_score" ? "-safety_score" : "-created_at",
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.min_safety_score !== undefined)
          params.min_safety_score = filters.min_safety_score;
        if (filters.max_safety_score !== undefined)
          params.max_safety_score = filters.max_safety_score;
        if (filters.is_high_risk) params.is_high_risk = true;

        const response = await getRestaurants(params);

        if (Array.isArray(response)) {
          setRestaurants(response);
          setPagination({ count: response.length, next: null, previous: null });
        } else {
          setRestaurants(response.results ?? []);
          setPagination({
            count: response.count ?? 0,
            next: response.next ?? null,
            previous: response.previous ?? null,
          });
        }
      } catch {
        console.error("Failed to fetch restaurants");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filters, sort]
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, sort]);

  useEffect(() => {
    fetchRestaurants(page);
  }, [page, fetchRestaurants]);

  const updateFilter = <K extends keyof RestaurantFilters>(
    key: K,
    value: RestaurantFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      min_safety_score: undefined,
      max_safety_score: undefined,
      is_high_risk: false,
    });
    setSearchQuery("");
    setSort("newest");
  };

  const totalPages = Math.ceil(pagination.count / PAGE_SIZE);

  return (
    <DashboardLayout title="Restaurants">
      <div className="flex flex-col" style={{ gap: 24 }}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Restaurants
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
              Search and filter restaurants by safety score.
            </p>
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors duration-200 cursor-pointer"
              style={{ height: 44, padding: "0 16px", ...CONTROL }}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center" style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "rgba(16,185,129,0.12)", color: "#059669" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors duration-200 cursor-pointer"
                style={{ height: 44, padding: "0 12px", borderRadius: 12 }}
              >
                Clear all
              </button>
            )}
          </div>
        </motion.div>

        {/* Search + Sort */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search size={18} className="text-slate-400" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants by name or location..."
              className="w-full text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              style={{ ...CONTROL, paddingLeft: 46, paddingRight: 16 }}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="text-slate-700 font-medium cursor-pointer outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            style={{ ...CONTROL, padding: "0 14px" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Min Safety Score
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        value={filters.min_safety_score ?? ""}
                        onChange={(e) =>
                          updateFilter(
                            "min_safety_score",
                            e.target.value
                              ? Number(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Max Safety Score
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="100"
                        value={filters.max_safety_score ?? ""}
                        onChange={(e) =>
                          updateFilter(
                            "max_safety_score",
                            e.target.value
                              ? Number(e.target.value)
                              : undefined
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Risk Level</label>
                      <button
                        type="button"
                        onClick={() =>
                          updateFilter("is_high_risk", !filters.is_high_risk)
                        }
                        className={`flex h-10 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm transition-colors ${
                          filters.is_high_risk
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-input bg-background text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        High Risk Only
                      </button>
                    </div>
                  </div>
                  {activeFilterCount > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Active filters:
                      </span>
                      {filters.min_safety_score !== undefined && (
                        <Badge variant="secondary" className="gap-1">
                          Min: {filters.min_safety_score}
                          <button
                            onClick={() =>
                              updateFilter("min_safety_score", undefined)
                            }
                            className="ml-0.5 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.max_safety_score !== undefined && (
                        <Badge variant="secondary" className="gap-1">
                          Max: {filters.max_safety_score}
                          <button
                            onClick={() =>
                              updateFilter("max_safety_score", undefined)
                            }
                            className="ml-0.5 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.is_high_risk && (
                        <Badge variant="secondary" className="gap-1">
                          High Risk
                          <button
                            onClick={() => updateFilter("is_high_risk", false)}
                            className="ml-0.5 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div className="flex flex-col items-center justify-center text-center mx-auto" style={{ minHeight: 280, maxWidth: 460, gap: 16, padding: "40px 24px" }}>
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.10)", color: "#10b981" }}>
                <Search size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>No restaurants found</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  Try adjusting your search or filters to find restaurants.
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12, marginTop: 4, boxShadow: SHADOW_REST }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3"
              style={{ gap: 20 }}
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {restaurants.map((restaurant) => (
                <motion.div key={restaurant.id} variants={fadeUp}>
                  <RestaurantCard
                    name={restaurant.name}
                    safetyScore={restaurant.safety_score}
                    address={restaurant.address}
                    phone={restaurant.phone_number}
                    ownerVerified={restaurant.owner_verified}
                    isHighRisk={restaurant.is_high_risk}
                    onViewDetails={() =>
                      navigate(`/restaurant/${restaurant.id}`)
                    }
                  />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex justify-center pt-4"
              >
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
