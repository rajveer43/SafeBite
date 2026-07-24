import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notification_service";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import type { Notification } from "@/types";

const NOTIFICATION_TYPES = [
  { value: "all", label: "All" },
  { value: "complaint", label: "Complaints" },
  { value: "inspection", label: "Inspections" },
  { value: "certificate", label: "Certificates" },
  { value: "system", label: "System" },
] as const;

const TYPE_ICONS: Record<string, any> = {
  complaint: AlertTriangle,
  inspection: ShieldCheck,
  certificate: FileCheck,
  system: Info,
  message: MessageSquare,
  default: Bell,
};

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  complaint:   { bg: "rgba(239,68,68,0.10)", fg: "#dc2626" },
  inspection:  { bg: "rgba(59,130,246,0.10)", fg: "#2563eb" },
  certificate: { bg: "rgba(16,185,129,0.10)", fg: "#059669" },
  system:      { bg: "#f1f5f9", fg: "#64748b" },
  message:     { bg: "rgba(168,85,247,0.10)", fg: "#9333ea" },
  default:     { bg: "#f1f5f9", fg: "#64748b" },
};

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
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

export default function OwnerNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      toast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleMarkRead(id: string | number) {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast("Failed to mark as read", "error");
    }
  }

  async function handleMarkAllRead() {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      toast("All notifications marked as read", "success");
    } catch {
      toast("Failed to mark all as read", "error");
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleDelete(id: string | number) {
    try {
      setDeletingId(id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast("Notification deleted", "success");
    } catch {
      toast("Failed to delete notification", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => (n.type ?? "system") === filter);

  return (
    <DashboardLayout title="Notifications">
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
              Notifications
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                : "You're all caught up."}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="inline-flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors duration-200 cursor-pointer shrink-0 disabled:opacity-60"
              style={{ height: 44, padding: "0 20px", borderRadius: 12, border: CARD_BORDER }}
            >
              {markingAll ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
              Mark all read
            </button>
          )}
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-wrap"
          style={{ gap: 8 }}
        >
          {NOTIFICATION_TYPES.map((t) => {
            const count =
              t.value === "all"
                ? notifications.length
                : notifications.filter((n) => (n.type ?? "system") === t.value).length;
            const active = filter === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className="inline-flex items-center transition-all duration-200 cursor-pointer"
                style={{
                  gap: 8, height: 40, padding: "0 16px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                  border: active ? "1px solid #10b981" : CARD_BORDER,
                  background: active ? "#059669" : "#fff",
                  color: active ? "#fff" : "#475569",
                  boxShadow: active ? SHADOW_REST : "none",
                }}
              >
                {t.label}
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
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div
              className="flex flex-col items-center justify-center text-center mx-auto"
              style={{ minHeight: 280, maxWidth: 460, gap: 16, padding: "40px 24px" }}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(59,130,246,0.10)", color: "#2563eb" }}>
                <Bell size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                  {filter === "all" ? "No notifications" : `No ${filter} notifications`}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  When something happens, you'll see it here.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <AnimatePresence>
              {filtered.map((notification) => {
                const type = notification.type ?? "system";
                const Icon = TYPE_ICONS[type] ?? TYPE_ICONS.default;
                const c = TYPE_COLORS[type] ?? TYPE_COLORS.default;
                const isUnread = !notification.is_read;

                return (
                  <motion.div
                    key={notification.id}
                    variants={item}
                    layout
                    exit={{ opacity: 0, x: -40, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white transition-shadow duration-200"
                    style={{
                      borderRadius: 14, padding: 16,
                      border: isUnread ? "1px solid rgba(16,185,129,0.30)" : CARD_BORDER,
                      background: isUnread ? "rgba(16,185,129,0.04)" : "#fff",
                      boxShadow: SHADOW_REST,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
                  >
                    <div className="flex items-start" style={{ gap: 12 }}>
                      <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: c.bg, color: c.fg }}>
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between" style={{ gap: 12 }}>
                          <div className="min-w-0">
                            <p style={{ fontSize: 15, fontWeight: isUnread ? 600 : 500, color: "#0f172a" }}>
                              {notification.title ?? notification.message ?? "Notification"}
                            </p>
                            {((notification as Record<string, any>).body || notification.message) && (
                              <p className="line-clamp-2" style={{ fontSize: 14, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>
                                {(notification as Record<string, any>).body || notification.message}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center shrink-0" style={{ gap: 8 }}>
                            {isUnread && <span className="rounded-full bg-emerald-500" style={{ width: 8, height: 8 }} />}
                            <span className="flex items-center whitespace-nowrap" style={{ gap: 4, fontSize: 12, color: "#94a3b8" }}>
                              <Clock size={12} />
                              {getRelativeTime(notification.created_at ?? new Date().toISOString())}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center" style={{ gap: 8, marginTop: 10 }}>
                          <span
                            className="inline-flex items-center capitalize"
                            style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}
                          >
                            {type}
                          </span>
                          {isUnread && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              className="inline-flex items-center transition-colors duration-200 cursor-pointer text-emerald-700 hover:bg-emerald-50"
                              style={{ height: 26, padding: "0 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            disabled={deletingId === notification.id}
                            className="inline-flex items-center justify-center transition-colors duration-200 cursor-pointer text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-60"
                            style={{ width: 26, height: 26, borderRadius: 8 }}
                            title="Delete"
                          >
                            {deletingId === notification.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
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
    </DashboardLayout>
  );
}
