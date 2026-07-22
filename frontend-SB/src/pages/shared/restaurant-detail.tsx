import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  FileCheck,
  Calendar,
  Clock,
  Building2,
  MapPinned,
  CheckCircle,
  XCircle,
  User,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Download,
  AlertCircle,
  MessageSquare,
  FileText,
  ClipboardList,
  Star,
  TrendingUp,
  Shield,
  Pencil,
  Trash2,
  PlusCircle,
  Eye,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import SafetyScoreBadge from "@/components/common/safety-score";
import StatusBadge from "@/components/common/status-badge";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import { useAuth } from "@/contexts/auth_context";
import {
  getRestaurantById,
  getRestaurantInspections,
  getRestaurantComplaintsById,
  getRestaurantCertificatesById,
} from "@/services/restaurant_service";
import { createComplaint } from "@/services/complaint_service";
import { createInspection } from "@/services/inspection_service";
import type { Restaurant, Certificate, Inspection, Complaint } from "@/types";

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function getRiskLevel(score: number, isHighRisk: boolean): { label: string; color: string; bg: string } {
  if (isHighRisk || score < 40) return { label: "High Risk", color: "text-red-700", bg: "bg-red-50 border-red-200" };
  if (score < 60) return { label: "Medium Risk", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  return { label: "Low Risk", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
}

function getInspectionStatusIcon(status: string) {
  switch (status) {
    case "completed": return { icon: CheckCircle, color: "text-emerald-500" };
    case "in_progress": return { icon: Clock, color: "text-blue-500" };
    case "cancelled": return { icon: XCircle, color: "text-slate-400" };
    default: return { icon: Calendar, color: "text-amber-500" };
  }
}

function getPriorityBadgeVariant(priority: string): "danger" | "warning" | "info" | "default" {
  switch (priority) {
    case "critical": return "danger";
    case "high": return "warning";
    case "medium": return "info";
    default: return "default";
  }
}

function fmt(d: string | undefined) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryStatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary-600",
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-premium">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold tracking-tight text-slate-800">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ExpandableNotes({ notes }: { notes: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = notes.length > 120;
  return (
    <div className="mt-1">
      <p className={`text-xs text-muted-foreground ${!expanded && isLong ? "line-clamp-2" : ""}`}>{notes}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:text-primary-700"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Read more</>}
        </button>
      )}
    </div>
  );
}

function MapPlaceholder({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-100" style={{ height: 280 }}>
      <iframe
        title={`Map for ${name}`}
        src={mapUrl}
        width="100%"
        height="100%"
        className="border-0"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-white/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
        <span className="flex items-center gap-1"><MapPinned className="h-3 w-3" /> {lat.toFixed(5)}, {lng.toFixed(5)}</span>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-600 hover:underline"
        >
          Open in Google Maps ↗
        </a>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Complaint dialog
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintPriority, setComplaintPriority] = useState("medium");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Inspection dialog (inspector)
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [submittingInspection, setSubmittingInspection] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(false);

      const restaurantData = await getRestaurantById(id);
      setRestaurant(restaurantData);

      const [inspsResult, compsResult, certsResult] = await Promise.allSettled([
        getRestaurantInspections(id),
        getRestaurantComplaintsById(id),
        getRestaurantCertificatesById(id),
      ]);

      if (inspsResult.status === "fulfilled") setInspections(inspsResult.value);
      if (compsResult.status === "fulfilled") setComplaints(compsResult.value);
      if (certsResult.status === "fulfilled") setCertificates(certsResult.value);
    } catch {
      setError(true);
      toast("Failed to load restaurant details", "error");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived stats ──
  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(b.scheduled_date ?? b.created_at).getTime() - new Date(a.scheduled_date ?? a.created_at).getTime()
  );
  const completedInspections = sortedInspections.filter((i) => i.status === "completed" && i.score != null);
  const lastInspection = sortedInspections[0];
  const activeCerts = certificates.filter((c) => c.status === "approved");
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved" || c.status === "dismissed");
  const resolutionRate = complaints.length > 0 ? Math.round((resolvedComplaints.length / complaints.length) * 100) : null;

  // ── Complaint submit ──
  async function handleComplaintSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !complaintTitle.trim() || !complaintDesc.trim()) return;
    setSubmittingComplaint(true);
    try {
      await createComplaint({ restaurant_id: id, title: complaintTitle, description: complaintDesc, priority: complaintPriority });
      toast("Complaint submitted successfully.", "success");
      setShowComplaintForm(false);
      setComplaintTitle(""); setComplaintDesc(""); setComplaintPriority("medium");
      fetchData();
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? "Failed to submit complaint.", "error");
    } finally {
      setSubmittingComplaint(false);
    }
  }

  // ── Inspection submit (inspector) ──
  async function handleInspectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !inspectionDate) return;
    setSubmittingInspection(true);
    try {
      await createInspection({ restaurant_id: id, scheduled_date: inspectionDate, notes: inspectionNotes || undefined });
      toast("Inspection scheduled successfully.", "success");
      setShowInspectionForm(false);
      setInspectionDate(""); setInspectionNotes("");
      fetchData();
    } catch (err: any) {
      toast(err?.response?.data?.detail ?? "Failed to schedule inspection.", "error");
    } finally {
      setSubmittingInspection(false);
    }
  }

  // ── Score
  const score = Number(restaurant?.safety_score ?? 0);
  const risk = restaurant ? getRiskLevel(score, restaurant.is_high_risk) : null;

  return (
    <DashboardLayout title="Restaurant Details">
      <div className="space-y-6">
        {/* Back button */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        {loading ? (
          <PageSkeleton />
        ) : error || !restaurant ? (
          <EmptyState
            icon={Building2}
            title="Restaurant not found"
            description="This restaurant doesn't exist or has been removed."
            action={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
                <Button onClick={fetchData}><RefreshCcw className="mr-2 h-3.5 w-3.5" />Retry</Button>
              </div>
            }
          />
        ) : (
          <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">

            {/* ─── 1. Restaurant Header ─── */}
            <motion.div variants={fadeUp}>
              <Card padding="none">
                <div className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Icon */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 ring-2 ring-primary-100">
                      <Building2 className="h-8 w-8 text-primary-600" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{restaurant.name}</h1>
                        {restaurant.owner_verified && (
                          <Badge variant="success" className="gap-1">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                        {restaurant.is_high_risk && (
                          <Badge variant="danger" className="gap-1">
                            <AlertTriangle className="h-3 w-3" /> High Risk
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {restaurant.address}
                        </span>
                        {restaurant.phone_number && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {restaurant.phone_number}
                          </span>
                        )}
                        {restaurant.owner_name && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            {restaurant.owner_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Registered {fmt(restaurant.created_at)}
                        </span>
                      </div>

                      {/* Risk level pill */}
                      {risk && (
                        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${risk.bg} ${risk.color}`}>
                          <Shield className="h-3 w-3" />
                          {risk.label}
                        </div>
                      )}
                    </div>

                    {/* Safety score */}
                    <div className="shrink-0">
                      <SafetyScoreBadge score={score} size="lg" showLabel />
                    </div>
                  </div>
                </div>

                {/* Role-based action bar */}
                <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3 flex flex-wrap gap-2 rounded-b-2xl">
                  {role === "customer" && (
                    <>
                      <Button size="sm" onClick={() => setShowComplaintForm(true)} className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> Report Complaint
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => document.getElementById("certs-section")?.scrollIntoView({ behavior: "smooth" })}>
                        <FileCheck className="h-3.5 w-3.5" /> View Certificates
                      </Button>
                    </>
                  )}
                  {role === "owner" && (
                    <>
                      <Button size="sm" className="gap-1.5" onClick={() => navigate(`/owner/certificates`)}>
                        <PlusCircle className="h-3.5 w-3.5" /> Upload Certificate
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/owner/complaints`)}>
                        <Eye className="h-3.5 w-3.5" /> View Complaints
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/owner/restaurants`)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit Restaurant
                      </Button>
                    </>
                  )}
                  {role === "inspector" && (
                    <>
                      <Button size="sm" className="gap-1.5" onClick={() => setShowInspectionForm(true)}>
                        <PlusCircle className="h-3.5 w-3.5" /> Start Inspection
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/inspector/inspections`)}>
                        <ClipboardList className="h-3.5 w-3.5" /> Manage Inspections
                      </Button>
                    </>
                  )}
                  {role === "admin" && (
                    <>
                      <Button size="sm" className="gap-1.5" onClick={() => navigate(`/admin/verification`)}>
                        <BadgeCheck className="h-3.5 w-3.5" /> Verify Restaurant
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/admin/restaurants`)}>
                        <FileText className="h-3.5 w-3.5" /> Manage Certificates
                      </Button>
                      <Button size="sm" variant="danger" className="gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" /> Delete Restaurant
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* ─── 2. Safety Summary Cards ─── */}
            <motion.div variants={fadeUp}>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary-600" />
                Safety Summary
              </h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <SummaryStatCard icon={ShieldCheck} label="Safety Score" value={score || "N/A"} sub={score ? getScoreLabel(score) : undefined} color="text-primary-600" />
                <SummaryStatCard icon={AlertTriangle} label="Risk Level" value={risk?.label ?? "Unknown"} color={restaurant.is_high_risk ? "text-red-600" : "text-emerald-600"} />
                <SummaryStatCard icon={Calendar} label="Last Inspection" value={lastInspection ? fmt(lastInspection.scheduled_date) : "None"} color="text-blue-600" />
                <SummaryStatCard icon={FileCheck} label="Active Certs" value={activeCerts.length} sub={`of ${certificates.length} total`} color="text-emerald-600" />
                <SummaryStatCard icon={MessageSquare} label="Total Complaints" value={complaints.length} color="text-amber-600" />
                <SummaryStatCard icon={TrendingUp} label="Resolution Rate" value={resolutionRate != null ? `${resolutionRate}%` : "N/A"} sub={resolutionRate != null ? `${resolvedComplaints.length} resolved` : undefined} color="text-violet-600" />
              </div>
            </motion.div>

            {/* ─── 3. Safety Score Breakdown ─── */}
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary-600" />
                    Safety Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <SafetyScoreBadge score={score} size="lg" showLabel />
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{getScoreLabel(score)}</span>
                        <span className="text-sm text-muted-foreground font-mono">{score}/100</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className={`h-full rounded-full ${getScoreBarColor(score)}`}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>0 — Poor</span>
                        <span>40 — Fair</span>
                        <span>60 — Good</span>
                        <span>80 — Excellent</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    {[
                      { label: "Total Inspections", value: inspections.length },
                      { label: "Completed", value: completedInspections.length },
                      { label: "Avg Score", value: completedInspections.length > 0 ? `${Math.round(completedInspections.reduce((s, i) => s + (Number(i.score) ?? 0), 0) / completedInspections.length)}%` : "N/A" },
                      { label: "Certificates", value: certificates.length },
                    ].map(({ label, value }) => (
                      <div key={label} className="space-y-0.5">
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                        <p className="text-xl font-bold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── 4 & 5. Inspections + Certificates in two-col grid ─── */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Inspection History */}
              <motion.div variants={fadeUp}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      Inspection History
                    </CardTitle>
                    <Badge variant="secondary">{inspections.length}</Badge>
                  </CardHeader>
                  <CardContent>
                    {sortedInspections.length === 0 ? (
                      <EmptyState icon={ClipboardList} title="No inspections yet" description="Inspections for this restaurant will appear here." />
                    ) : (
                      <div className="relative">
                        <div className="absolute left-[17px] top-3 bottom-3 w-px bg-slate-100" />
                        <div className="space-y-0 max-h-96 overflow-y-auto pr-1">
                          {sortedInspections.map((insp) => {
                            const statusInfo = getInspectionStatusIcon(insp.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <div key={insp.id} className="relative flex items-start gap-3 py-3">
                                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                                  <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                                </div>
                                <div className="min-w-0 flex-1 pt-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <StatusBadge status={insp.status} />
                                    {insp.score != null && (
                                      <Badge variant="outline" className="text-[10px]">
                                        <Star className="h-2.5 w-2.5 mr-0.5" />
                                        Score: {insp.score}
                                      </Badge>
                                    )}
                                  </div>
                                  {insp.inspector_name && (
                                    <p className="text-xs text-muted-foreground">
                                      <User className="inline h-3 w-3 mr-0.5" />
                                      {insp.inspector_name}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    <Calendar className="inline h-3 w-3 mr-0.5" />
                                    {fmt(insp.scheduled_date)}
                                    {insp.completed_date && ` → Completed ${fmt(insp.completed_date)}`}
                                  </p>
                                  {insp.notes && <ExpandableNotes notes={insp.notes} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Certificates */}
              <motion.div variants={fadeUp} id="certs-section">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-muted-foreground" />
                      Certificates
                    </CardTitle>
                    <Badge variant="secondary">{certificates.length}</Badge>
                  </CardHeader>
                  <CardContent>
                    {certificates.length === 0 ? (
                      <EmptyState icon={FileCheck} title="No certificates" description="Uploaded certificates will appear here." />
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {certificates.map((cert) => (
                          <div key={cert.id} className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50/60 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 truncate">{cert.certificate_type}</p>
                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Issued: {fmt(cert.issued_date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Expires: {fmt(cert.expiry_date)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <StatusBadge status={cert.status} />
                                {cert.file_url && (
                                  <a
                                    href={cert.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                    title="Download certificate"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ─── 6. Complaints ─── */}
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Complaints
                  </CardTitle>
                  <Badge variant="secondary">{complaints.length}</Badge>
                </CardHeader>
                <CardContent>
                  {complaints.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="No complaints" description="Customer complaints for this restaurant will appear here." />
                  ) : (
                    <div className="space-y-3">
                      {complaints.map((comp) => (
                        <div key={comp.id} className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50/40 transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-slate-800">{comp.title}</p>
                            <div className="flex items-center gap-2">
                              {comp.priority && (
                                <Badge variant={getPriorityBadgeVariant(comp.priority)}>
                                  {comp.priority.charAt(0).toUpperCase() + comp.priority.slice(1)}
                                </Badge>
                              )}
                              <StatusBadge status={comp.status} />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{comp.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {fmt(comp.created_at)}
                            </span>
                            {comp.customer_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {comp.customer_name}
                              </span>
                            )}
                          </div>
                          {comp.resolution_notes && (
                            <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-100 p-2.5 text-xs text-emerald-800">
                              <p className="font-medium mb-0.5">Resolution Note</p>
                              <p>{comp.resolution_notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── 7. Map ─── */}
            {restaurant.latitude != null && restaurant.longitude != null && (
              <motion.div variants={fadeUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-muted-foreground" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MapPlaceholder lat={restaurant.latitude} lng={restaurant.longitude} name={restaurant.name} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </motion.div>
        )}

        {/* ─── Complaint Form Modal (customer) ─── */}
        <AnimatePresence>
          {showComplaintForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowComplaintForm(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative z-50 w-full max-w-md rounded-2xl bg-white shadow-xl"
              >
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Report a Complaint
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Regarding <span className="font-medium text-slate-700">{restaurant?.name}</span></p>
                  </div>
                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Title</label>
                      <input
                        type="text"
                        value={complaintTitle}
                        onChange={e => setComplaintTitle(e.target.value)}
                        required
                        placeholder="Brief description of the issue"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <textarea
                        value={complaintDesc}
                        onChange={e => setComplaintDesc(e.target.value)}
                        required
                        rows={4}
                        placeholder="Describe the issue in detail..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Priority</label>
                      <select
                        value={complaintPriority}
                        onChange={e => setComplaintPriority(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button type="button" variant="outline" onClick={() => setShowComplaintForm(false)}>Cancel</Button>
                      <Button type="submit" loading={submittingComplaint}>Submit Complaint</Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Schedule Inspection Modal (inspector) ─── */}
        <AnimatePresence>
          {showInspectionForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowInspectionForm(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative z-50 w-full max-w-md rounded-2xl bg-white shadow-xl"
              >
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary-600" />
                      Schedule Inspection
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">For <span className="font-medium text-slate-700">{restaurant?.name}</span></p>
                  </div>
                  <form onSubmit={handleInspectionSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Scheduled Date & Time</label>
                      <input
                        type="datetime-local"
                        value={inspectionDate}
                        onChange={e => setInspectionDate(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                      <textarea
                        value={inspectionNotes}
                        onChange={e => setInspectionNotes(e.target.value)}
                        rows={3}
                        placeholder="Any notes or preparation requirements..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button type="button" variant="outline" onClick={() => setShowInspectionForm(false)}>Cancel</Button>
                      <Button type="submit" loading={submittingInspection}>Schedule Inspection</Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
