import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import StatusBadge from "@/components/common/status-badge";
import { useToast } from "@/components/common/toast";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Skeleton from "@/components/ui/skeleton";
import Dialog, {
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getMyComplaints,
  createComplaint,
} from "@/services/complaint_service";
import { getRestaurants } from "@/services/restaurant_service";
import type { Complaint, Restaurant } from "@/types";

const complaintSchema = z.object({
  restaurant_id: z.string().min(1, "Please select a restaurant"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    message: "Please select a priority",
  }),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  {
    value: "critical",
    label: "Critical",
    color: "bg-red-100 text-red-800",
  },
] as const;

const STATUS_STEPS = ["pending", "under_investigation", "resolved", "closed"] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* Shared design tokens (matches customer dashboard) */
const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const SHADOW_HOVER = "0 8px 24px rgba(15,23,42,0.08)";

const FIELD_STYLE: React.CSSProperties = {
  width: "100%", borderRadius: 12, border: CARD_BORDER, fontSize: 15, color: "#0f172a", background: "#fff",
};
const FIELD_CLASS = "outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 8,
};

const STAT_ICON: Record<"emerald" | "amber" | "blue", { bg: string; fg: string; border: string }> = {
  emerald: { bg: "rgba(16,185,129,0.10)", fg: "#059669", border: "rgba(16,185,129,0.20)" },
  amber:   { bg: "rgba(245,158,11,0.10)", fg: "#d97706", border: "rgba(245,158,11,0.20)" },
  blue:    { bg: "rgba(59,130,246,0.10)", fg: "#2563eb", border: "rgba(59,130,246,0.20)" },
};

function StatCard({
  color, top, label, value, icon,
}: {
  color: "emerald" | "amber" | "blue"; top: string; label: string; value: number; icon: React.ReactNode;
}) {
  const s = STAT_ICON[color];
  return (
    <div
      className="bg-white transition-shadow duration-200 flex flex-col justify-between"
      style={{ minHeight: 130, borderRadius: 18, padding: 20, border: CARD_BORDER, borderTop: `3px solid ${top}`, boxShadow: SHADOW_REST }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
    >
      <div className="flex items-start justify-between" style={{ gap: 12 }}>
        <p className="truncate" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
          {label}
        </p>
        <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}>
          {icon}
        </div>
      </div>
      <h3 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, color: "#0f172a", letterSpacing: "-0.02em" }}>
        {value}
      </h3>
    </div>
  );
}

const STATUS_COLORS: Record<string, { filled: string; label: string }> = {
  pending:             { filled: "bg-amber-400",   label: "Pending" },
  under_investigation: { filled: "bg-blue-500",    label: "Under Investigation" },
  resolved:            { filled: "bg-emerald-500", label: "Resolved" },
  closed:              { filled: "bg-slate-500",   label: "Closed" },
};

function ComplaintTimeline({ complaint }: { complaint: Complaint }) {
  const currentIdx = STATUS_STEPS.indexOf(
    complaint.status as (typeof STATUS_STEPS)[number]
  );
  const progressPct = Math.round(((currentIdx + 1) / STATUS_STEPS.length) * 100);
  const current = STATUS_COLORS[complaint.status] ?? { filled: "bg-slate-400", label: complaint.status };

  return (
    <div className="pt-3 space-y-1.5">
      {/* Segmented bar */}
      <div className="flex gap-1">
        {STATUS_STEPS.map((step, i) => {
          const filled = i <= currentIdx;
          const color = STATUS_COLORS[step]?.filled ?? "bg-slate-400";
          return (
            <motion.div
              key={step}
              className={`h-1.5 flex-1 rounded-full ${
                filled ? color : "bg-slate-200"
              }`}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            />
          );
        })}
      </div>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold" style={{ color: "inherit" }}>
          {current.label}
        </span>
        <span className="text-[11px] text-muted-foreground">
          Step {currentIdx + 1} of {STATUS_STEPS.length}
        </span>
      </div>
    </div>
  );
}

function ComplaintItem({ complaint }: { complaint: Complaint }) {
  const [expanded, setExpanded] = useState(false);

  const priorityStyle =
    PRIORITY_OPTIONS.find((p) => p.value === complaint.priority)?.color ??
    "";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-sm truncate">
                {complaint.title}
              </h3>
              <StatusBadge status={complaint.status} />
              {complaint.priority && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle}`}
                >
                  {complaint.priority}
                </span>
              )}
            </div>
            {complaint.restaurant_name && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {complaint.restaurant_name}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 h-8 w-8 p-0"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ComplaintTimeline complaint={complaint} />

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 border-t pt-4">
                {complaint.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {complaint.created_at && (
                    <span>
                      Submitted:{" "}
                      {new Date(complaint.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  )}
                  {complaint.updated_at && (
                    <span>
                      Updated:{" "}
                      {new Date(complaint.updated_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  )}
                </div>
                {(complaint as Record<string, any>).response && (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Response
                    </p>
                    <p className="text-sm">{(complaint as Record<string, any>).response}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default function CustomerComplaints() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const isNewComplaintRoute = location.pathname === "/customer/complaints/new";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      restaurant_id: "",
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const fetchComplaints = useCallback(async () => {
    try {
      const response = await getMyComplaints();

      const complaints = (
        Array.isArray(response)
          ? response
          : (response as Record<string, any>)?.results ?? []
      ).map((c: any) => ({
        ...c,
        id: c.complaint_id,
        title: c.title || c.category || "Food Safety Complaint",
      }));

      setComplaints(complaints);
    } catch {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await getRestaurants({ page_size: 100 });

      const restaurants = (
        Array.isArray(response)
          ? response
          : (response as Record<string, any>)?.results ?? []
      ).map((r: any) => ({
        ...r,
        id: r.restaurant_id, // Map UUID to id
      }));

      console.log(restaurants);

      setRestaurants(restaurants);
    } catch {
      console.error("Failed to fetch restaurants");
    } finally {
      setRestaurantsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchRestaurants();
  }, [fetchComplaints, fetchRestaurants]);

  useEffect(() => {
    if (isNewComplaintRoute) {
      setDialogOpen(true);
    }
  }, [isNewComplaintRoute]);

  const openNewComplaintDialog = () => {
    navigate("/customer/complaints/new");
  };

  const closeNewComplaintDialog = () => {
    setDialogOpen(false);
    reset();

    if (isNewComplaintRoute) {
      navigate("/customer/complaints", { replace: true });
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setSubmitting(true);
    try {
      await createComplaint({ ...data, restaurant_id: data.restaurant_id });
      toast("Complaint submitted successfully", "success");
      closeNewComplaintDialog();
      await fetchComplaints();
    } catch (error: any) {
      toast(
        error?.response?.data?.detail ?? error?.message ?? "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.title?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.restaurant_name?.toLowerCase().includes(term)
    );
  });

  const pendingCount = complaints.filter(
    (c) => c.status === "pending"
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "in_review" || c.status === "under_investigation"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved" || c.status === "dismissed"
  ).length;

  return (
    <DashboardLayout title="Complaints">
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
              Complaints
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
              Track and manage your food safety complaints.
            </p>
          </div>
          <button
            onClick={openNewComplaintDialog}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shrink-0"
            style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
          >
            <Plus size={17} strokeWidth={2.5} />
            New Complaint
          </button>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid sm:grid-cols-3"
          style={{ gap: 20 }}
        >
          <StatCard color="amber"   top="#f59e0b" label="Pending"     value={pendingCount}    icon={<Clock size={20} strokeWidth={2} />} />
          <StatCard color="blue"    top="#3b82f6" label="In Progress" value={inProgressCount} icon={<AlertTriangle size={20} strokeWidth={2} />} />
          <StatCard color="emerald" top="#10b981" label="Resolved"    value={resolvedCount}   icon={<CheckCircle2 size={20} strokeWidth={2} />} />
        </motion.div>

        {/* Search */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            style={{ width: "100%", maxWidth: 400, height: 44, padding: "0 16px", borderRadius: 12, border: CARD_BORDER, fontSize: 15 }}
          />
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div
              className="flex flex-col items-center justify-center text-center mx-auto"
              style={{ minHeight: 280, maxWidth: 460, gap: 16, padding: "40px 24px" }}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.10)", color: "#10b981" }}>
                <FileText size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                  {searchTerm ? "No matching complaints" : "No complaints yet"}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  {searchTerm ? "Try adjusting your search term." : "When you report an issue, it will appear here."}
                </p>
              </div>
              {!searchTerm && (
                <button
                  onClick={openNewComplaintDialog}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12, marginTop: 4, boxShadow: SHADOW_REST }}
                >
                  <Plus size={16} />
                  File Your First Complaint
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {filteredComplaints.map((complaint) => (
              <motion.div key={complaint.id} variants={fadeUp}>
                <ComplaintItem complaint={complaint} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (open) {
              setDialogOpen(true);
            } else {
              closeNewComplaintDialog();
            }
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>New Complaint</h2>
              <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
                Fill in the details below to submit a food safety complaint.
              </p>
            </div>

            {/* Restaurant */}
            <div style={{ marginTop: 24 }}>
              <label style={LABEL_STYLE}>Restaurant *</label>
              {restaurantsLoading ? (
                <Skeleton className="h-11 w-full rounded-xl" />
              ) : (
                <select
                  {...register("restaurant_id")}
                  className={`cursor-pointer ${FIELD_CLASS}`}
                  style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
                >
                  <option value="">Select a restaurant</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.safety_score !== undefined && ` (Score: ${r.safety_score})`}
                    </option>
                  ))}
                </select>
              )}
              {errors.restaurant_id && (
                <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 500, marginTop: 6 }}>{errors.restaurant_id.message}</p>
              )}
            </div>

            {/* Title */}
            <div style={{ marginTop: 20 }}>
              <label style={LABEL_STYLE}>Title *</label>
              <input
                placeholder="Brief summary of the issue"
                className={FIELD_CLASS}
                style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
                {...register("title")}
              />
              {errors.title && (
                <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 500, marginTop: 6 }}>{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div style={{ marginTop: 20 }}>
              <label style={LABEL_STYLE}>Description *</label>
              <textarea
                placeholder="Provide detailed information about the food safety issue you experienced..."
                rows={5}
                className={`resize-y ${FIELD_CLASS}`}
                style={{ ...FIELD_STYLE, padding: "12px 14px", lineHeight: 1.5 }}
                {...register("description")}
              />
              {errors.description && (
                <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 500, marginTop: 6 }}>{errors.description.message}</p>
              )}
            </div>

            {/* Priority */}
            <div style={{ marginTop: 20 }}>
              <label style={LABEL_STYLE}>Priority *</label>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {PRIORITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center transition-colors duration-200 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-700"
                    style={{ gap: 8, height: 40, padding: "0 14px", borderRadius: 12, border: CARD_BORDER, fontSize: 14, fontWeight: 500, color: "#475569" }}
                  >
                    <input type="radio" value={opt.value} className="sr-only" {...register("priority")} />
                    <span className={`rounded-full ${opt.color.split(" ")[0]}`} style={{ width: 8, height: 8 }} />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.priority && (
                <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 500, marginTop: 6 }}>{errors.priority.message}</p>
              )}
            </div>

            <DialogFooter className="!gap-3 !mt-6 !pt-5">
              <button
                type="button"
                onClick={closeNewComplaintDialog}
                className="inline-flex items-center justify-center text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors duration-200 cursor-pointer"
                style={{ height: 44, padding: "0 20px", borderRadius: 12, border: CARD_BORDER }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Complaint
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
