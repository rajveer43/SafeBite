import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import StatusBadge from "@/components/common/status-badge";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card, { CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
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
  X,
  Loader2,
  File,
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function getDaysUntilExpiry(dateStr: string): number {
  const expiry = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }
  if (days <= 30) {
    return (
      <Badge variant="warning" className="gap-1 bg-amber-100 text-amber-800 border-amber-300">
        <AlertTriangle className="h-3 w-3" />
        {days}d left
      </Badge>
    );
  }
  if (days <= 90) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        {days}d left
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 border-green-300">
      <CheckCircle className="h-3 w-3" />
      Valid
    </Badge>
  );
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
      <div className="space-y-6">
        <PageHeader
          title="Certificates"
          description="Manage your safety and compliance certificates"
          action={
            <Button onClick={openUploadDialog} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Certificate
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
                <p className="text-muted-foreground text-xs">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.approved}</p>
                <p className="text-muted-foreground text-xs">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.rejected}</p>
                <p className="text-muted-foreground text-xs">Rejected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.expiring}</p>
                <p className="text-muted-foreground text-xs">Expiring Soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title="No certificates"
            description="Upload your first certificate to start tracking compliance."
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <File className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">
                              {cert.certificate_type ?? (cert as Record<string, any>).type ?? "Certificate"}
                            </h3>
                            <StatusBadge status={cert.status ?? "pending"} />
                          </div>
                        </div>
                        {cert.expiry_date && (
                          <ExpiryBadge expiryDate={cert.expiry_date} />
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground flex-1 mt-2">
                        {cert.restaurant_name && (
                          <p className="truncate">Restaurant: {cert.restaurant_name}</p>
                        )}
                        {cert.issued_date && (
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            <span>
                              Issued:{" "}
                              {new Date(cert.issued_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {cert.expiry_date && (
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0" />
                            <span>
                              Expires:{" "}
                              {new Date(cert.expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {(cert as Record<string, any>).rejection_reason && (
                        <div className="mt-3 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                          Rejection reason: {(cert as Record<string, any>).rejection_reason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative bg-background rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Certificate</h2>
              <Button
                variant="ghost"
                size="xs"
                className="h-8 w-8"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Certificate Type *
                </label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select type</option>
                  {CERTIFICATE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {restaurants.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Restaurant
                  </label>
                  <select
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select restaurant</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Certificate File *
                </label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-muted-foreground text-xs mt-1">
                  PDF, JPG, or PNG (max 10MB)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Issued Date
                  </label>
                  <Input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Upload
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
