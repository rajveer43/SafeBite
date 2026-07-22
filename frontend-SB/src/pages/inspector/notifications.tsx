import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Loader2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import { useToast } from "@/components/common/toast";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notification_service";
import type { Notification } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const exitVariants = {
  opacity: 0,
  x: -40,
  transition: { duration: 0.2 },
};

type NotificationType = "all" | "success" | "warning" | "error" | "info";

const typeFilters: { value: NotificationType; label: string }[] = [
  { value: "all", label: "All Alerts" },
  { value: "warning", label: "Warnings" },
  { value: "error", label: "Critical Errors" },
  { value: "success", label: "Success" },
  { value: "info", label: "System Info" },
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "success":
      return CheckCircle2;
    case "warning":
      return AlertTriangle;
    case "error":
      return ShieldAlert;
    case "info":
      return Info;
    default:
      return Bell;
  }
}

function getNotificationBadgeStyle(type: string) {
  switch (type) {
    case "success":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "warning":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "error":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "info":
      return "bg-sky-100 text-sky-800 border-sky-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString([], { dateStyle: "medium" });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<NotificationType>("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      toast("Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return notifications;
    return notifications.filter((n) => n.type === typeFilter);
  }, [notifications, typeFilter]);

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const warningCount = notifications.filter((n) => n.type === "warning" || n.type === "error").length;

  const handleMarkRead = async (id: string | number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast("Failed to mark notification.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast("All notifications marked as read.", "success");
    } catch {
      toast("Failed to mark all as read.", "error");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setDeletingId(id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast("Notification deleted.", "success");
    } catch {
      toast("Failed to delete notification.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-8 pb-12">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <Bell className="h-3.5 w-3.5" /> Inspector Notification Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Audit Alerts & Feed</h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Stay updated on newly assigned inspections, urgent restaurant complaints, license expirations, and safety score alerts.
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-200 flex items-center gap-2 shrink-0"
              >
                {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                <span>Mark All Read ({unreadCount})</span>
              </Button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 pt-6 border-t border-slate-700/60">
            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
              <div className="text-xs font-medium text-slate-300">Total Notifications</div>
              <div className="mt-1 text-2xl font-extrabold text-white">{totalCount}</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
              <div className="text-xs font-medium text-emerald-300">Unread Feed</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-400">{unreadCount}</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
              <div className="text-xs font-medium text-amber-300">Priority Alerts</div>
              <div className="mt-1 text-2xl font-extrabold text-amber-400">{warningCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {typeFilters.map((tf) => {
            const isActive = typeFilter === tf.value;
            const count = tf.value === "all" ? notifications.length : notifications.filter((n) => n.type === tf.value).length;
            return (
              <button
                key={tf.value}
                onClick={() => setTypeFilter(tf.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{tf.label}</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <BellOff className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">You're all caught up!</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {typeFilter !== "all"
                ? "No notifications available under this category."
                : "No pending alerts or notifications. Everything looks clean and up to date."}
            </p>
            <Button
              onClick={() => navigate("/inspector/inspections")}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs"
            >
              Go to Inspections <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((notification) => {
                const Icon = getNotificationIcon(notification.type ?? "system");
                const badgeStyle = getNotificationBadgeStyle(notification.type ?? "system");

                return (
                  <motion.div
                    key={notification.id}
                    variants={itemVariants}
                    exit={exitVariants}
                    layout
                  >
                    <div
                      className={`group relative rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${
                        !notification.is_read
                          ? "border-emerald-200 bg-emerald-50/30"
                          : "border-slate-200/80 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Type Icon */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border font-bold ${badgeStyle}`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Text & Meta */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`text-sm ${!notification.is_read ? "font-extrabold text-slate-900" : "font-bold text-slate-800"}`}>
                              {notification.title ?? "System Alert"}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              {!notification.is_read && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                                  NEW
                                </span>
                              )}
                              <span className="text-xs font-medium text-slate-400">
                                {timeAgo(notification.created_at)}
                              </span>
                            </div>
                          </div>

                          {notification.message && (
                            <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                          )}

                          <div className="pt-2 flex items-center gap-3">
                            {!notification.is_read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkRead(notification.id)}
                                className="h-7 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/50 rounded-lg px-2.5"
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark Read
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(notification.id)}
                              disabled={deletingId === notification.id}
                              className="h-7 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg px-2"
                            >
                              {deletingId === notification.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
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
