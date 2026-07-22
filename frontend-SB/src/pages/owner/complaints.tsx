import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import StatusBadge from "@/components/common/status-badge";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Dialog, { DialogFooter } from "@/components/ui/dialog";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import { getMyComplaints, getComplaints } from "@/services/complaint_service";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Store,
} from "lucide-react";
import type { Complaint } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const STATUS_TIMELINE: Record<string, { label: string; icon: any; color: string }[]> = {
  pending: [
    { label: "Complaint Filed", icon: AlertCircle, color: "text-amber-500" },
  ],
  open: [
    { label: "Complaint Filed", icon: AlertCircle, color: "text-amber-500" },
    { label: "Under Review", icon: Clock, color: "text-blue-500" },
  ],
  "in_progress": [
    { label: "Complaint Filed", icon: AlertCircle, color: "text-amber-500" },
    { label: "Under Review", icon: Clock, color: "text-blue-500" },
    { label: "In Progress", icon: AlertTriangle, color: "text-orange-500" },
  ],
  resolved: [
    { label: "Complaint Filed", icon: AlertCircle, color: "text-amber-500" },
    { label: "Under Review", icon: Clock, color: "text-blue-500" },
    { label: "In Progress", icon: AlertTriangle, color: "text-orange-500" },
    { label: "Resolved", icon: CheckCircle, color: "text-green-500" },
  ],
  closed: [
    { label: "Complaint Filed", icon: AlertCircle, color: "text-amber-500" },
    { label: "Under Review", icon: Clock, color: "text-blue-500" },
    { label: "In Progress", icon: AlertTriangle, color: "text-orange-500" },
    { label: "Resolved", icon: CheckCircle, color: "text-green-500" },
    { label: "Closed", icon: CheckCircle, color: "text-green-700" },
  ],
  dismissed: [
    { label: "Complaint Filed", icon: AlertCircle, color: "text-amber-500" },
    { label: "Dismissed", icon: X, color: "text-gray-500" },
  ],
};

function StatusTimeline({ status }: { status: string }) {
  const steps = STATUS_TIMELINE[status] ?? STATUS_TIMELINE.pending;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-3">Status Timeline</h4>
      <div className="relative ml-1">
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === steps.length - 1;
            return (
              <div key={i} className="flex items-start gap-3 relative">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background z-10 ${
                    isActive ? "border-primary" : "border-border"
                  }`}
                >
                  <Icon className={`h-3 w-3 ${step.color}`} />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      isActive ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OwnerComplaints() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyComplaints().catch(() => getComplaints());
      setComplaints(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      toast("Failed to load complaints", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  function openDetail(complaint: Complaint) {
    setSelectedComplaint(complaint);
    setDetailOpen(true);
  }

  const filtered =
    filter === "all"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  const statusCounts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    in_review: complaints.filter((c) => c.status === "in_review").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    dismissed: complaints.filter((c) => c.status === "dismissed").length,
  };

  return (
    <DashboardLayout title="Complaints">
      <div className="space-y-6">
        <PageHeader
          title="Complaints"
          description="View complaints about your restaurants"
        />

        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {key.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title={filter === "all" ? "No complaints" : `No ${filter} complaints`}
            description="Your restaurants are complaint-free!"
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence>
              {filtered.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openDetail(complaint)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 shrink-0 mt-0.5">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">
                              {complaint.title ?? (complaint as Record<string, any>).category ?? "Complaint"}
                            </h3>
                            <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">
                              {complaint.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {complaint.restaurant_name && (
                                <span className="flex items-center gap-1">
                                  <Store className="h-3 w-3" />
                                  {complaint.restaurant_name}
                                </span>
                              )}
                              {(complaint as Record<string, any>).user_name && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {(complaint as Record<string, any>).user_name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(
                                  complaint.created_at ?? (complaint as Record<string, any>).timestamp ?? ""
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={complaint.status ?? "pending"} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDetailOpen(false)}
          />
          <div className="relative bg-background rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Complaint Details</h2>
              <Button
                variant="ghost"
                size="xs"
                className="h-8 w-8"
                onClick={() => setDetailOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedComplaint && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedComplaint.title ??
                        (selectedComplaint as Record<string, any>).category ??
                        "Complaint"}
                    </h3>
                    <StatusBadge status={selectedComplaint.status ?? "pending"} />
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">{selectedComplaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedComplaint.restaurant_name && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Restaurant
                      </p>
                      <p className="font-medium flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        {selectedComplaint.restaurant_name}
                      </p>
                    </div>
                  )}
                  {(selectedComplaint as Record<string, any>).user_name && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Filed By
                      </p>
                      <p className="font-medium flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {(selectedComplaint as Record<string, any>).user_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">
                      Date Filed
                    </p>
                    <p className="font-medium">
                      {new Date(
                        selectedComplaint.created_at ??
                          (selectedComplaint as Record<string, any>).timestamp ??
                          ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {(selectedComplaint as Record<string, any>).category && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Category
                      </p>
                      <p className="font-medium">{(selectedComplaint as Record<string, any>).category}</p>
                    </div>
                  )}
                </div>

                <StatusTimeline status={selectedComplaint.status ?? "pending"} />

                {(selectedComplaint as Record<string, any>).owner_response && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-xs text-green-700 font-medium mb-1">
                      Your Response
                    </p>
                    <p className="text-sm text-green-800">
                      {(selectedComplaint as Record<string, any>).owner_response}
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDetailOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
