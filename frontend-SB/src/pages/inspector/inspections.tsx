import { useEffect, useState, useMemo, useCallback } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
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
  ShieldCheck,
  Eye,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import StatusBadge from "@/components/common/status-badge";
import SafetyScoreBadge from "@/components/common/safety-score";
import { useToast } from "@/components/common/toast";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Dialog, { DialogFooter } from "@/components/ui/dialog";
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

const statusFilters: { value: StatusFilter; label: string; icon: ElementType; active: string }[] = [
  { value: "all", label: "All Inspections", icon: FileSearch, active: "#059669" },
  { value: "scheduled", label: "Scheduled", icon: Calendar, active: "#2563eb" },
  { value: "in_progress", label: "In Progress", icon: Clock, active: "#d97706" },
  { value: "completed", label: "Completed", icon: CheckCircle2, active: "#059669" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, active: "#64748b" },
];

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

const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const SHADOW_HOVER = "0 8px 24px rgba(15,23,42,0.08)";

const FIELD_STYLE: CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: CARD_BORDER,
  fontSize: 15,
  color: "#0f172a",
  background: "#fff",
};
const FIELD_CLASS = "outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

type StatColor = "blue" | "amber" | "emerald" | "rose";
const STAT_STYLES: Record<StatColor, { top: string; iconBg: string; iconText: string; iconBorder: string }> = {
  blue:    { top: "#3b82f6", iconBg: "rgba(59,130,246,0.10)", iconText: "#2563eb", iconBorder: "rgba(59,130,246,0.20)" },
  amber:   { top: "#f59e0b", iconBg: "rgba(245,158,11,0.10)", iconText: "#d97706", iconBorder: "rgba(245,158,11,0.22)" },
  emerald: { top: "#10b981", iconBg: "rgba(16,185,129,0.10)", iconText: "#059669", iconBorder: "rgba(16,185,129,0.20)" },
  rose:    { top: "#f43f5e", iconBg: "rgba(244,63,94,0.10)", iconText: "#e11d48", iconBorder: "rgba(244,63,94,0.20)" },
};

function StatCard({ color, label, value, icon }: { color: StatColor; label: string; value: number; icon: ReactNode }) {
  const s = STAT_STYLES[color];
  return (
    <div
      className="bg-white transition-shadow duration-200 flex flex-col justify-between"
      style={{ minHeight: 120, borderRadius: 18, padding: 20, border: CARD_BORDER, borderTop: `3px solid ${s.top}`, boxShadow: SHADOW_REST }}
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
      <div className="flex flex-col w-full pb-12" style={{ gap: 24 }}>
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

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div style={{ maxWidth: 760 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md" style={{ padding: "6px 14px" }}>
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Inspector Operations Control</span>
              </div>
              <h1 className="text-white" style={{ fontSize: 36, fontWeight: 700, lineHeight: "44px", letterSpacing: "-0.02em", marginTop: 16 }}>
                Inspection Workspace
              </h1>
              <p className="text-emerald-100/90 font-normal" style={{ fontSize: 16, lineHeight: 1.6, marginTop: 8 }}>
                Schedule, track, and complete restaurant health inspections with real-time audit logs and safety compliance scores.
              </p>
            </div>

            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 shrink-0"
            >
              <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
              <span>Schedule Inspection</span>
            </Button>
          </div>
        </motion.div>

        {/* Summary metrics */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid sm:grid-cols-2 xl:grid-cols-4"
          style={{ gap: 20 }}
        >
          <StatCard color="blue" label="Scheduled" value={scheduledCount} icon={<Calendar size={20} strokeWidth={2} />} />
          <StatCard color="amber" label="In Progress" value={inProgressCount} icon={<Clock size={20} strokeWidth={2} />} />
          <StatCard color="emerald" label="Completed" value={completedCount} icon={<CheckCircle2 size={20} strokeWidth={2} />} />
          <StatCard color="rose" label="Overdue Alerts" value={overdueCount} icon={<AlertTriangle size={20} strokeWidth={2} />} />
        </motion.div>

        {/* Search + filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="relative w-full lg:max-w-md">
            <Search size={17} className="absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ left: 16 }} />
            <input
              placeholder="Search by restaurant name or inspection notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-white ${FIELD_CLASS}`}
              style={{ ...FIELD_STYLE, height: 44, paddingLeft: 44, paddingRight: 16 }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-start lg:justify-end" style={{ gap: 8 }}>
            {statusFilters.map((sf) => {
              const Icon = sf.icon;
              const isActive = statusFilter === sf.value;
              const count = sf.value === "all" ? inspections.length : inspections.filter((i) => i.status === sf.value).length;
              return (
                <button
                  key={sf.value}
                  type="button"
                  onClick={() => setStatusFilter(sf.value)}
                  className="inline-flex items-center transition-all duration-200 cursor-pointer"
                  style={{
                    gap: 8,
                    height: 40,
                    padding: "0 12px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    border: isActive ? `1px solid ${sf.active}` : CARD_BORDER,
                    background: isActive ? sf.active : "#fff",
                    color: isActive ? "#fff" : "#475569",
                    boxShadow: isActive ? SHADOW_REST : "none",
                  }}
                >
                  <Icon size={14} />
                  <span>{sf.label}</span>
                  <span
                    className="inline-flex items-center justify-center"
                    style={{
                      minWidth: 22,
                      height: 20,
                      padding: "0 6px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
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
        </motion.div>

        {/* List / empty */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div
              className="flex flex-col items-center justify-center text-center mx-auto"
              style={{ minHeight: 280, maxWidth: 500, gap: 16, padding: "40px 24px" }}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.10)", color: "#059669" }}>
                <FileSearch size={26} />
              </div>
              <div style={{ maxWidth: 420 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                  {searchQuery || statusFilter !== "all" ? "No inspections match criteria" : "No inspections scheduled yet"}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search terms or inspection status filter."
                    : "Scheduled inspection records will appear here for audit tracking and completion."}
                </p>
              </div>
              <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> Schedule New Inspection
              </Button>
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
                    <div
                      className="group bg-white transition-shadow duration-200"
                      style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
                    >
                      <div className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
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
