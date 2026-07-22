import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import Avatar from "@/components/ui/avatar";
import Dialog from "@/components/ui/dialog";
import { useToast } from "@/components/common/toast";
import { getDashboard, verifyOwner } from "@/services/admin_service";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Check,
  X,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { User } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function AdminVerification() {
  const { toast } = useToast();
  const [pendingOwners, setPendingOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string | number;
    userName: string;
    approved: boolean;
  }>({ open: false, userId: "", userName: "", approved: false });

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setPendingOwners(data.pending_owner_verifications ?? []);
    } catch {
      toast("Failed to load pending verifications", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  function handleVerifyClick(userId: string | number, userName: string, approved: boolean) {
    setConfirmDialog({ open: true, userId, userName, approved });
  }

  async function handleConfirm() {
    const { userId, approved } = confirmDialog;
    try {
      setProcessingId(userId);
      await verifyOwner(userId, approved);
      setPendingOwners((prev) =>
        prev.filter((u) => String((u as unknown as Record<string, unknown>).user_id ?? u.id) !== String(userId))
      );
      toast(
        approved
          ? `Owner "${confirmDialog.userName}" has been verified`
          : `Owner "${confirmDialog.userName}" has been rejected`,
        approved ? "success" : "warning"
      );
    } catch {
      toast("Failed to process verification", "error");
    } finally {
      setProcessingId(null);
      setConfirmDialog({ open: false, userId: "", userName: "", approved: false });
    }
  }

  return (
    <DashboardLayout title="Owner Verification">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <PageHeader
            title="Owner Verification"
            description={`${pendingOwners.length} pending verification${pendingOwners.length !== 1 ? "s" : ""}`}
          />
        </motion.div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingOwners.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={32} />}
            title="All caught up"
            description="There are no pending owner verifications at the moment."
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {pendingOwners.map((ownerItem) => {
                const owner = ownerItem as unknown as Record<string, unknown>;
                const ownerId = String(owner["user_id"] ?? owner["id"] ?? "");
                const ownerName = String(owner["name"] ?? "");
                const ownerEmail = String(owner["email"] ?? "");
                const ownerPhone = String(owner["phone_number"] ?? "");
                const createdAt = String(owner["created_at"] ?? owner["registered_at"] ?? "");

                return (
                  <motion.div
                    key={ownerId}
                    variants={item}
                    layout
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card hover className="h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar
                            name={ownerName}
                            size="lg"
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate">
                              {ownerName}
                            </h3>
                            <p className="text-sm text-slate-500 truncate">
                              {ownerEmail}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{ownerEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={14} className="text-slate-400 shrink-0" />
                            <span>{ownerPhone || "No phone"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <span>
                              Joined{" "}
                              {createdAt ? new Date(createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }) : "Recently"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="warning" size="sm">Pending Verification</Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-1"
                            loading={String(processingId) === ownerId}
                            onClick={() =>
                              handleVerifyClick(ownerId, ownerName, true)
                            }
                          >
                            <Check size={14} />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="flex-1"
                            loading={String(processingId) === ownerId}
                            onClick={() =>
                              handleVerifyClick(ownerId, ownerName, false)
                            }
                          >
                            <X size={14} />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog((prev) => ({ ...prev, open: false }))
        }
        title={confirmDialog.approved ? "Approve Owner" : "Reject Owner"}
        description={
          confirmDialog.approved
            ? `Are you sure you want to verify "${confirmDialog.userName}"? They will gain full access to owner features.`
            : `Are you sure you want to reject "${confirmDialog.userName}"? They will not be able to access owner features.`
        }
      >
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            This action {confirmDialog.approved ? "grants" : "denies"} owner
            privileges and cannot be easily undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() =>
              setConfirmDialog((prev) => ({ ...prev, open: false }))
            }
          >
            Cancel
          </Button>
          <Button
            variant={confirmDialog.approved ? "success" : "danger"}
            loading={processingId === confirmDialog.userId}
            onClick={handleConfirm}
          >
            {processingId === confirmDialog.userId ? (
              <Loader2 size={14} className="animate-spin" />
            ) : confirmDialog.approved ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            {confirmDialog.approved ? "Approve" : "Reject"}
          </Button>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
