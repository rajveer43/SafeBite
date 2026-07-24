import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import StatusBadge from "@/components/common/status-badge";
import Dialog, { DialogFooter } from "@/components/ui/dialog";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import { getCertificates, uploadCertificate } from "@/services/inspection_service";
import { getOwnerRestaurants } from "@/services/restaurant_service";
import { motion, AnimatePresence } from "motion/react";
import {
  FileCheck,
  Upload,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  File as FileIcon,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";
import type { Certificate, Restaurant } from "@/types";

const CERTIFICATE_TYPES = [
  "Food Safety License",
  "Fire Safety Certificate",
  "Health Department Permit",
  "FSSAI License",
  "Trade License",
  "Environmental Clearance",
  "Others",
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

/* Shared design tokens (matches customer/owner dashboard) */
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

type StatColor = "blue" | "emerald" | "red" | "amber";

const STAT_STYLES: Record<StatColor, { top: string; iconBg: string; iconText: string; iconBorder: string }> = {
  blue:    { top: "#3b82f6", iconBg: "rgba(59,130,246,0.10)", iconText: "#2563eb", iconBorder: "rgba(59,130,246,0.20)" },
  emerald: { top: "#10b981", iconBg: "rgba(16,185,129,0.10)", iconText: "#059669", iconBorder: "rgba(16,185,129,0.20)" },
  red:     { top: "#ef4444", iconBg: "rgba(239,68,68,0.10)", iconText: "#dc2626", iconBorder: "rgba(239,68,68,0.20)" },
  amber:   { top: "#f59e0b", iconBg: "rgba(245,158,11,0.10)", iconText: "#d97706", iconBorder: "rgba(245,158,11,0.20)" },
};

function StatCard({ color, label, value, icon }: { color: StatColor; label: string; value: number; icon: React.ReactNode }) {
  const s = STAT_STYLES[color];
  return (
    <div
      className="bg-white transition-shadow duration-200 flex flex-col justify-between"
      style={{ minHeight: 130, borderRadius: 18, padding: 20, border: CARD_BORDER, borderTop: `3px solid ${s.top}`, boxShadow: SHADOW_REST }}
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

function getDaysUntilExpiry(dateStr: string): number {
  const expiry = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const days = getDaysUntilExpiry(expiryDate);
  const base = "inline-flex items-center gap-1 rounded-full text-xs font-semibold";
  const pad = { padding: "3px 10px" } as React.CSSProperties;

  if (days < 0) {
    return <span className={`${base} bg-red-50 text-red-700`} style={pad}><XCircle className="h-3 w-3" />Expired</span>;
  }
  if (days <= 30) {
    return <span className={`${base} bg-amber-50 text-amber-700`} style={pad}><AlertTriangle className="h-3 w-3" />{days}d left</span>;
  }
  if (days <= 90) {
    return <span className={`${base} bg-slate-100 text-slate-600`} style={pad}><Clock className="h-3 w-3" />{days}d left</span>;
  }
  return <span className={`${base} bg-emerald-50 text-emerald-700`} style={pad}><CheckCircle className="h-3 w-3" />Valid</span>;
}

export default function OwnerCertificates() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [certType, setCertType] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [certRes, restRes] = await Promise.allSettled([
        getCertificates(),
        getOwnerRestaurants(),
      ]);
      if (certRes.status === "fulfilled") {
        setCertificates(
          Array.isArray(certRes.value) ? certRes.value : certRes.value.data ?? []
        );
      }
      if (restRes.status === "fulfilled") {
        setRestaurants(
          Array.isArray(restRes.value) ? restRes.value : restRes.value.data ?? []
        );
      }
    } catch {
      toast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openUploadDialog() {
    setCertType("");
    setRestaurantId("");
    setIssuedDate("");
    setExpiryDate("");
    setFile(null);
    setDialogOpen(true);
  }

  async function handleUpload() {
    if (!certType || !file) {
      toast("Please fill in all required fields", "error");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("certificate_type", certType);
      formData.append("file", file);
      formData.append("issued_date", issuedDate);
      formData.append("expiry_date", expiryDate);
      if (restaurantId) formData.append("restaurant_id", restaurantId);

      await uploadCertificate(formData as any);
      toast("Certificate uploaded successfully", "success");
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? err?.response?.data?.message ?? "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  const statusCounts = {
    pending: certificates.filter((c) => c.status === "pending").length,
    approved: certificates.filter((c) => c.status === "approved").length,
    rejected: certificates.filter((c) => c.status === "rejected").length,
    expiring: certificates.filter((c) => {
      if (!c.expiry_date) return false;
      const days = getDaysUntilExpiry(c.expiry_date);
      return days >= 0 && days <= 30;
    }).length,
  };

  return (
    <DashboardLayout title="Certificates">
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
              Certificates
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
              Manage your safety and compliance certificates.
            </p>
          </div>
          <button
            onClick={openUploadDialog}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shrink-0"
            style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
          >
            <Upload size={17} strokeWidth={2.5} />
            Upload Certificate
          </button>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 20 }}
        >
          <StatCard color="blue"    label="Pending Review" value={statusCounts.pending}  icon={<Clock size={20} strokeWidth={2} />} />
          <StatCard color="emerald" label="Approved"       value={statusCounts.approved} icon={<CheckCircle size={20} strokeWidth={2} />} />
          <StatCard color="red"     label="Rejected"       value={statusCounts.rejected} icon={<XCircle size={20} strokeWidth={2} />} />
          <StatCard color="amber"   label="Expiring Soon"  value={statusCounts.expiring} icon={<ShieldAlert size={20} strokeWidth={2} />} />
        </motion.div>

        {/* List / empty */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div
              className="flex flex-col items-center justify-center text-center mx-auto"
              style={{ minHeight: 280, maxWidth: 460, gap: 16, padding: "40px 24px" }}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(59,130,246,0.10)", color: "#2563eb" }}>
                <FileCheck size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>No certificates yet</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  Upload your first certificate to start tracking compliance across your establishments.
                </p>
              </div>
              <button
                onClick={openUploadDialog}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                style={{ height: 44, padding: "0 20px", borderRadius: 12, marginTop: 4, boxShadow: SHADOW_REST }}
              >
                <Upload size={16} />
                Upload Your First Certificate
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white flex flex-col h-full transition-shadow duration-200"
                  style={{ borderRadius: 18, padding: 20, border: CARD_BORDER, boxShadow: SHADOW_REST }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
                >
                  <div className="flex items-start justify-between" style={{ gap: 12, marginBottom: 16 }}>
                    <div className="flex items-center min-w-0" style={{ gap: 12 }}>
                      <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.10)", color: "#059669" }}>
                        <FileIcon size={20} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate" style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                          {cert.certificate_type ?? (cert as Record<string, any>).type ?? "Certificate"}
                        </h3>
                        <div style={{ marginTop: 4 }}>
                          <StatusBadge status={cert.status ?? "pending"} />
                        </div>
                      </div>
                    </div>
                    {cert.expiry_date && <ExpiryBadge expiryDate={cert.expiry_date} />}
                  </div>

                  <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {cert.restaurant_name && (
                      <p className="truncate" style={{ fontSize: 14, color: "#64748b" }}>
                        Restaurant: <span style={{ color: "#334155", fontWeight: 500 }}>{cert.restaurant_name}</span>
                      </p>
                    )}
                    {cert.issued_date && (
                      <div className="flex items-center" style={{ gap: 8, fontSize: 14, color: "#64748b" }}>
                        <CalendarDays size={15} className="shrink-0" />
                        <span>Issued: {new Date(cert.issued_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {cert.expiry_date && (
                      <div className="flex items-center" style={{ gap: 8, fontSize: 14, color: "#64748b" }}>
                        <CalendarDays size={15} className="shrink-0" />
                        <span>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {(cert as Record<string, any>).rejection_reason && (
                    <div style={{ marginTop: 16, borderRadius: 10, background: "rgba(239,68,68,0.08)", padding: "10px 12px", fontSize: 13, color: "#dc2626", lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 600 }}>Rejection reason:</span> {(cert as Record<string, any>).rejection_reason}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Upload dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div style={{ padding: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>Upload Certificate</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
              Add a safety or compliance certificate to your portfolio.
            </p>
          </div>

          {/* Certificate Type */}
          <div style={{ marginTop: 24 }}>
            <label style={LABEL_STYLE}>Certificate Type *</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className={`cursor-pointer ${FIELD_CLASS}`}
              style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
            >
              <option value="">Select type</option>
              {CERTIFICATE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Restaurant */}
          {restaurants.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <label style={LABEL_STYLE}>Restaurant</label>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className={`cursor-pointer ${FIELD_CLASS}`}
                style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
              >
                <option value="">Select restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* File */}
          <div style={{ marginTop: 20 }}>
            <label style={LABEL_STYLE}>Certificate File *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className={`${FIELD_CLASS} file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100`}
              style={{ ...FIELD_STYLE, padding: "9px 14px", fontSize: 14 }}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>PDF, JPG, or PNG (max 10MB)</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 20 }}>
            <div>
              <label style={LABEL_STYLE}>Issued Date</label>
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className={FIELD_CLASS}
                style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={FIELD_CLASS}
                style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
              />
            </div>
          </div>

          <DialogFooter className="!gap-3 !mt-6 !pt-5">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="inline-flex items-center justify-center text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors duration-200 cursor-pointer"
              style={{ height: 44, padding: "0 20px", borderRadius: 12, border: CARD_BORDER }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload
                </>
              )}
            </button>
          </DialogFooter>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
