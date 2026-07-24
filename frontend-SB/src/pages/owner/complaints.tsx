import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import StatusBadge from "@/components/common/status-badge";
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* Shared design tokens (matches customer/owner dashboard) */
const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const SHADOW_HOVER = "0 8px 24px rgba(15,23,42,0.08)";

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
    <div style={{ marginTop: 4 }}>
      <h4 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>
        Status Timeline
      </h4>
      <div className="relative ml-1">
        <div className="absolute left-[11px] top-1 bottom-1 w-px bg-slate-200" />
        <div className="space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === steps.length - 1;
            return (
              <div key={i} className="flex items-center gap-3 relative">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white z-10 ${
                    isActive ? "border-emerald-500" : "border-slate-200"
                  }`}
                >
                  <Icon className={`h-3 w-3 ${step.color}`} />
                </div>
                <p style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "#0f172a" : "#64748b" }}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_review", label: "In Review" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
] as const;

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

  const statusCounts: Record<string, number> = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    in_review: complaints.filter((c) => c.status === "in_review").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    dismissed: complaints.filter((c) => c.status === "dismissed").length,
  };

  return (
    <DashboardLayout title="Complaints">
      <div className="flex flex-col" style={{ gap: 24 }}>
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Complaints
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
            View and respond to complaints filed against your restaurants.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-wrap"
          style={{ gap: 8 }}
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            const count = statusCounts[key] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="inline-flex items-center transition-all duration-200 cursor-pointer"
                style={{
                  gap: 8, height: 40, padding: "0 16px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                  border: active ? "1px solid #10b981" : CARD_BORDER,
                  background: active ? "#059669" : "#fff",
                  color: active ? "#fff" : "#475569",
                  boxShadow: active ? SHADOW_REST : "none",
                }}
              >
                {label}
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    minWidth: 22, height: 20, padding: "0 6px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: active ? "rgba(255,255,255,0.22)" : "#f1f5f9",
                    color: active ? "#fff" : "#64748b",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* List / empty */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div
              className="flex flex-col items-center justify-center text-center mx-auto"
              style={{ minHeight: 280, maxWidth: 460, gap: 16, padding: "40px 24px" }}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.10)", color: "#10b981" }}>
                <CheckCircle size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                  {filter === "all" ? "No complaints yet" : `No ${filter.replace("_", " ")} complaints`}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  {filter === "all"
                    ? "Your restaurants are complaint-free. New reports from customers will appear here."
                    : "Try switching to a different filter to see other complaints."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <AnimatePresence>
              {filtered.map((complaint) => (
                <motion.div key={complaint.id} variants={item} layout exit={{ opacity: 0, x: -20 }}>
                  <div
                    onClick={() => openDetail(complaint)}
                    className="group bg-white transition-shadow duration-200 cursor-pointer"
                    style={{ borderRadius: 14, padding: 16, border: CARD_BORDER, boxShadow: SHADOW_REST }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
                  >
                    <div className="flex items-start justify-between" style={{ gap: 16 }}>
                      <div className="flex items-start min-w-0 flex-1" style={{ gap: 12 }}>
                        <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(239,68,68,0.08)", color: "#dc2626", marginTop: 2 }}>
                          <AlertTriangle size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate" style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                            {complaint.title ?? (complaint as Record<string, any>).category ?? "Complaint"}
                          </h3>
                          <p className="line-clamp-2" style={{ fontSize: 14, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>
                            {complaint.description}
                          </p>
                          <div className="flex flex-wrap items-center" style={{ gap: 14, marginTop: 8, fontSize: 13, color: "#94a3b8" }}>
                            {complaint.restaurant_name && (
                              <span className="flex items-center gap-1.5">
                                <Store size={13} />
                                {complaint.restaurant_name}
                              </span>
                            )}
                            {(complaint as Record<string, any>).user_name && (
                              <span className="flex items-center gap-1.5">
                                <User size={13} />
                                {(complaint as Record<string, any>).user_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock size={13} />
                              {new Date(complaint.created_at ?? (complaint as Record<string, any>).timestamp ?? "").toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={complaint.status ?? "pending"} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <div style={{ padding: 24 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>Complaint Details</h2>
            <button
              onClick={() => setDetailOpen(false)}
              className="flex items-center justify-center transition-colors duration-200 cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              style={{ width: 32, height: 32, borderRadius: 10 }}
            >
              <X size={18} />
            </button>
          </div>

          {selectedComplaint && (
            <div className="flex flex-col" style={{ gap: 20 }}>
              <div className="flex items-center" style={{ gap: 12 }}>
                <div className="flex items-center justify-center shrink-0" style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.08)", color: "#dc2626" }}>
                  <AlertTriangle size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate" style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                    {selectedComplaint.title ?? (selectedComplaint as Record<string, any>).category ?? "Complaint"}
                  </h3>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge status={selectedComplaint.status ?? "pending"} />
                  </div>
                </div>
              </div>

              <div style={{ borderRadius: 12, background: "#f8fafc", border: CARD_BORDER, padding: 16 }}>
                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2" style={{ gap: 16 }}>
                {selectedComplaint.restaurant_name && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Restaurant</p>
                    <p className="flex items-center" style={{ gap: 6, fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                      <Store size={15} className="text-slate-400" />
                      {selectedComplaint.restaurant_name}
                    </p>
                  </div>
                )}
                {(selectedComplaint as Record<string, any>).user_name && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Filed By</p>
                    <p className="flex items-center" style={{ gap: 6, fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                      <User size={15} className="text-slate-400" />
                      {(selectedComplaint as Record<string, any>).user_name}
                    </p>
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Date Filed</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                    {new Date(selectedComplaint.created_at ?? (selectedComplaint as Record<string, any>).timestamp ?? "").toLocaleDateString()}
                  </p>
                </div>
                {(selectedComplaint as Record<string, any>).category && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>Category</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{(selectedComplaint as Record<string, any>).category}</p>
                  </div>
                )}
              </div>

              <StatusTimeline status={selectedComplaint.status ?? "pending"} />

              {(selectedComplaint as Record<string, any>).owner_response && (
                <div style={{ borderRadius: 12, border: "1px solid rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.06)", padding: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#059669", marginBottom: 6 }}>Your Response</p>
                  <p style={{ fontSize: 14, color: "#065f46", lineHeight: 1.6 }}>
                    {(selectedComplaint as Record<string, any>).owner_response}
                  </p>
                </div>
              )}

              <DialogFooter className="!gap-3 !mt-2 !pt-5">
                <button
                  type="button"
                  onClick={() => setDetailOpen(false)}
                  className="inline-flex items-center justify-center text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors duration-200 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12, border: CARD_BORDER }}
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          )}
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
