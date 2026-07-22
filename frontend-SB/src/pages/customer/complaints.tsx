import { useState, useEffect, useCallback } from "react";
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
import EmptyState from "@/components/common/empty-state";
import { useToast } from "@/components/common/toast";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
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

  const onSubmit = async (data: ComplaintFormData) => {
    setSubmitting(true);
    try {
      await createComplaint({ ...data, restaurant_id: data.restaurant_id });
      toast("Complaint submitted successfully", "success");
      setDialogOpen(false);
      reset();
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
      <div className="space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your food safety complaints.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid gap-4 sm:grid-cols-3"
        >
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">{inProgressCount}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <AlertTriangle className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Resolved
                  </p>
                  <p className="text-2xl font-bold">{resolvedCount}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={searchTerm ? "No matching complaints" : "No complaints yet"}
            description={
              searchTerm
                ? "Try adjusting your search term."
                : "When you report an issue, it will appear here."
            }
            action={
              !searchTerm ? (
                <Button onClick={() => setDialogOpen(true)}>
                  File Your First Complaint
                </Button>
              ) : undefined
            }
          />
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 p-6"
          >
            <div>
              <h2 className="text-lg font-semibold">New Complaint</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in the details below to submit a food safety complaint.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurant *</label>
              {restaurantsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  {...register("restaurant_id")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a restaurant</option>
                  {restaurants.map((r) => {
                    return (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.safety_score !== undefined &&
                          ` (Score: ${r.safety_score})`}
                      </option>
                    );
                  })}
                </select>
              )}
              {errors.restaurant_id && (
                <p className="text-xs text-destructive">
                  {errors.restaurant_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="Brief summary of the issue"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Provide detailed information about the food safety issue you experienced..."
                rows={5}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority *</label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="sr-only"
                      {...register("priority")}
                    />
                    <span
                      className={`h-2 w-2 rounded-full ${opt.color.split(" ")[0]}`}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.priority && (
                <p className="text-xs text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
