import { useState, useEffect, useCallback } from "react";
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
import SearchBar from "@/components/common/search-bar";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
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
      <div className="space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Restaurants
            </h1>
            <p className="text-muted-foreground mt-1">
              Search and filter restaurants by safety score.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search restaurants by name or location..."
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No restaurants found"
            description="Try adjusting your search or filters to find restaurants."
          />
        ) : (
          <>
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
