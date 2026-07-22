import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  FileSearch,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  StickyNote,
  AlertTriangle,
  Building2,
  ArrowRight,
  Filter,
  Sparkles,
  ClipboardCheck,
  ChevronRight,
  ShieldCheck,
  Eye,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import StatusBadge from "@/components/common/status-badge";
import SafetyScoreBadge from "@/components/common/safety-score";
import EmptyState from "@/components/common/empty-state";
import { useToast } from "@/components/common/toast";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Dialog, { DialogFooter } from "@/components/ui/dialog";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import {
  getInspections,
  createInspection,
  updateInspection,
} from "@/services/inspection_service";
import { getRestaurants } from "@/services/restaurant_service";
import type { Inspection, Restaurant } from "@/types";

const createSchema = z.object({
  restaurant_id: z.string().min(1, "Restaurant is required"),
  scheduled_date: z.string().min(1, "Scheduled date is required"),
  notes: z.string().optional(),
});

const completeSchema = z.object({
  safety_score: z.number().min(0, "Score must be at least 0").max(100, "Score cannot exceed 100"),
  notes: z.string().min(1, "Completion notes are required"),
});

type CreateFormData = z.infer<typeof createSchema>;
type CompleteFormData = z.infer<typeof completeSchema>;

type StatusFilter = "all" | "scheduled" | "in_progress" | "completed" | "cancelled";

const statusFilters: { value: StatusFilter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Inspections", icon: FileSearch },
  { value: "scheduled", label: "Scheduled", icon: Calendar },
  { value: "in_progress", label: "In Progress", icon: Clock },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function InspectionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<Inspection | null>(null);

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { restaurant_id: "", scheduled_date: "", notes: "" },
  });

  const completeForm = useForm<CompleteFormData>({
    resolver: zodResolver(completeSchema),
    defaultValues: { safety_score: 85, notes: "" },
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [insp, rest] = await Promise.all([getInspections(), getRestaurants()]);
      setInspections(insp);
      setRestaurants(rest);
    } catch {
      toast("Failed to load inspections data.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const now = new Date();

  // Summary Metrics
  const scheduledCount = inspections.filter((i) => i.status === "scheduled").length;
  const inProgressCount = inspections.filter((i) => i.status === "in_progress").length;
  const completedCount = inspections.filter((i) => i.status === "completed").length;
  const overdueCount = inspections.filter(
    (i) =>
      (i.status === "scheduled" || i.status === "in_progress") &&
      new Date(i.scheduled_date) < now
  ).length;

  const filteredInspections = useMemo(() => {
    let result = inspections;
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          (i.restaurant_name ?? "").toLowerCase().includes(q) ||
          (i.notes ?? "").toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
    );
  }, [inspections, statusFilter, searchQuery]);

  const handleCreate = async (data: CreateFormData) => {
    try {
      await createInspection({
        restaurant_id: data.restaurant_id,
        scheduled_date: data.scheduled_date,
        notes: data.notes || undefined,
      });
      toast("New inspection has been scheduled.", "success");
      setCreateOpen(false);
      createForm.reset();
      fetchData();
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? "Failed to create inspection.", "error");
    }
  };

  const handleStartInspection = async (inspection: Inspection) => {
    try {
      await updateInspection(inspection.id, { status: "in_progress" });
      toast("Inspection is now in progress.", "success");
      fetchData();
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? "Failed to start inspection.", "error");
    }
  };

  const handleComplete = async (data: CompleteFormData) => {
    if (!completeTarget) return;
    try {
      await updateInspection(completeTarget.id, {
        status: "completed",
        score: data.safety_score,
        notes: data.notes,
      });
      toast("Inspection has been marked as complete.", "success");
      setCompleteTarget(null);
      completeForm.reset();
      fetchData();
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? "Failed to complete inspection.", "error");
    }
  };

  const handleCancel = async (inspection: Inspection) => {
    try {
      await updateInspection(inspection.id, { status: "cancelled" });
      toast("Inspection cancelled successfully.", "success");
      fetchData();
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? "Failed to cancel inspection.", "error");
    }
  };

  const getRestaurantName = (id: any) =>
    restaurants.find((r: any) => (r.id || r.restaurant_id) === id)?.name ?? `Restaurant #${id}`;

  return (
    <DashboardLayout title="Inspections">
      <div className="space-y-8 pb-12">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-800/30">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" /> Inspector Operations Control
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Inspection Workspace</h1>
              <p className="text-sm text-emerald-100/80 max-w-xl">
                Schedule, track, and complete restaurant health inspections with real-time audit logs and safety compliance scores.
              </p>
            </div>

            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="h-5 w-5 stroke-[2.5]" />
              <span>Schedule Inspection</span>
            </Button>
          </div>

          {/* Quick Summary KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-emerald-800/40">
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-300/80">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>Scheduled</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{scheduledCount}</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300/80">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>In Progress</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{inProgressCount}</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-300/80">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Completed</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{completedCount}</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10">
              <div className="flex items-center gap-2 text-xs font-medium text-rose-300/80">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Overdue Alerts</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{overdueCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by restaurant name or inspection notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.map((sf) => {
              const Icon = sf.icon;
              const isActive = statusFilter === sf.value;
              const count = sf.value === "all" ? inspections.length : inspections.filter((i) => i.status === sf.value).length;
              return (
                <button
                  key={sf.value}
                  onClick={() => setStatusFilter(sf.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{sf.label}</span>
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inspections Cards List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <FileSearch className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No inspections found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No inspection records match your current search query or active filter."
                : "No inspections have been scheduled yet. Schedule your first inspection to start auditing restaurants."}
            </p>
            <Button onClick={() => setCreateOpen(true)} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Schedule New Inspection
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredInspections.map((inspection) => {
                const restaurantName = inspection.restaurant_name ?? getRestaurantName(inspection.restaurant_id);
                const isOverdue = (inspection.status === "scheduled" || inspection.status === "in_progress") && new Date(inspection.scheduled_date) < now;

                return (
                  <motion.div
                    key={inspection.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-300">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Information Section */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                              {restaurantName}
                            </h3>
                            <StatusBadge status={inspection.status} />
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                                <AlertTriangle className="h-3 w-3" /> Overdue
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>Scheduled: {new Date(inspection.scheduled_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>

                            {inspection.completed_date && (
                              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Completed: {new Date(inspection.completed_date).toLocaleDateString()}</span>
                              </div>
                            )}

                            {inspection.score != null && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">Score:</span>
                                <SafetyScoreBadge score={inspection.score} />
                              </div>
                            )}

                            {inspection.notes && (
                              <div className="flex items-center gap-1.5 text-slate-600 max-w-sm truncate">
                                <StickyNote className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                <span className="truncate">{inspection.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {inspection.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStartInspection(inspection)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs px-3.5 py-2 shadow-sm"
                              >
                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                Start Inspection
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(inspection)}
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs px-3 py-2"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}

                          {inspection.status === "in_progress" && (
                            <Button
                              size="sm"
                              onClick={() => setCompleteTarget(inspection)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs px-4 py-2 shadow-sm"
                            >
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Complete Audit
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/restaurant/${inspection.restaurant_id}`)}
                            className="text-slate-600 hover:bg-slate-100 rounded-xl text-xs px-3 py-2"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Schedule Inspection Dialog Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <div className="space-y-5 p-1">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" /> Schedule Inspection
            </h2>
            <p className="text-xs text-slate-500 mt-1">Assign an official health & safety audit for a restaurant.</p>
          </div>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Select Restaurant</label>
              <select
                {...createForm.register("restaurant_id")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all duration-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              >
                <option value="">-- Choose a restaurant --</option>
                {restaurants.map((r: any) => {
                  const rId = r.id || r.restaurant_id;
                  return (
                    <option key={rId} value={rId}>
                      {r.name} {r.address ? `(${r.address})` : ""}
                    </option>
                  );
                })}
              </select>
              {createForm.formState.errors.restaurant_id && (
                <p className="text-xs text-rose-500">{createForm.formState.errors.restaurant_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Scheduled Date & Time</label>
              <Input type="datetime-local" {...createForm.register("scheduled_date")} />
              {createForm.formState.errors.scheduled_date && (
                <p className="text-xs text-rose-500">{createForm.formState.errors.scheduled_date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Inspection Notes (Optional)</label>
              <Textarea
                {...createForm.register("notes")}
                placeholder="Specific focus areas, priority reasons, or pre-inspection instructions..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl">
                {createForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Inspection
              </Button>
            </DialogFooter>
          </form>
        </div>
      </Dialog>

      {/* Complete Inspection Dialog Modal */}
      <Dialog open={!!completeTarget} onOpenChange={() => setCompleteTarget(null)}>
        {completeTarget && (
          <div className="space-y-5 p-1">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Complete Inspection Audit
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Finalizing safety score for{" "}
                <span className="font-bold text-slate-800">
                  {completeTarget.restaurant_name ?? `Restaurant #${completeTarget.restaurant_id}`}
                </span>
              </p>
            </div>
            <form onSubmit={completeForm.handleSubmit(handleComplete)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Assigned Safety Score (0 - 100)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  {...completeForm.register("safety_score", { valueAsNumber: true })}
                />
                {completeForm.formState.errors.safety_score && (
                  <p className="text-xs text-rose-500">{completeForm.formState.errors.safety_score.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Audit Remarks & Findings</label>
                <Textarea
                  {...completeForm.register("notes")}
                  placeholder="Detail sanitation compliance, kitchen hygiene, storage violations, or positive findings..."
                  rows={4}
                />
                {completeForm.formState.errors.notes && (
                  <p className="text-xs text-rose-500">{completeForm.formState.errors.notes.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCompleteTarget(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={completeForm.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl">
                  {completeForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Audit & Score
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </Dialog>
    </DashboardLayout>
  );
}
