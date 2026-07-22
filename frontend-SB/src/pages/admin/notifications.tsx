import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
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
  AlertTriangle,
  ShieldCheck,
  Info,
  Clock,
  Loader2,
  MessageSquare,
} from "lucide-react";
import type { Notification } from "@/types";

const TYPE_FILTERS = ["all", "success", "warning", "error", "info"] as const;

const TYPE_ICONS: Record<string, typeof Bell> = {
  success: ShieldCheck,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info,
  message: MessageSquare,
};

const TYPE_COLORS: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  error: "bg-red-100 text-red-600",
  info: "bg-blue-100 text-blue-600",
  message: "bg-purple-100 text-purple-600",
};

const TYPE_BADGE_VARIANTS: Record<string, "success" | "warning" | "danger" | "info"> = {
  success: "success",
  warning: "warning",
  error: "danger",
  info: "info",
  message: "info",
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
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: diffDay > 365 ? "numeric" : undefined,
  });
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
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
      : notifications.filter((n) => n.type === filter);

  return (
    <DashboardLayout title="Notification Center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <PageHeader
            title="Notification Center"
            description={
              unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "You're all caught up"
            }
            action={
              unreadCount > 0 ? (
                <Button
                  variant="outline"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="gap-2"
                >
                  {markingAll ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCheck size={14} />
                  )}
                  Mark all read
                </Button>
              ) : undefined
            }
          />
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((type) => {
            const count =
              type === "all"
                ? notifications.length
                : notifications.filter((n) => n.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`
                  inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                  ${filter === type
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                <span
                  className={`
                    text-xs rounded-full px-1.5 py-0.5
                    ${filter === type ? "bg-white/20" : "bg-slate-100"}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} />}
            title={
              filter === "all"
                ? "No notifications"
                : `No ${filter} notifications`
            }
            description="When something happens, you'll see it here."
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <AnimatePresence>
              {filtered.map((notification) => {
                const type = notification.type ?? "info";
                const Icon = TYPE_ICONS[type] ?? Bell;
                const colorClass = TYPE_COLORS[type] ?? TYPE_COLORS.info;
                const isUnread = !notification.is_read;

                return (
                  <motion.div
                    key={notification.id}
                    variants={item}
                    layout
                    exit={{ opacity: 0, x: -40, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`
                        transition-colors
                        ${isUnread
                          ? "bg-emerald-50/30 border-emerald-200/50"
                          : "hover:bg-slate-50/50"
                        }
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                              flex h-10 w-10 items-center justify-center rounded-lg shrink-0
                              ${colorClass}
                            `}
                          >
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p
                                  className={`
                                    text-sm
                                    ${isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}
                                  `}
                                >
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                                    {notification.message}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isUnread && (
                                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                )}
                                <span className="text-slate-400 text-xs whitespace-nowrap flex items-center gap-1">
                                  <Clock size={12} />
                                  {getRelativeTime(notification.created_at)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant={TYPE_BADGE_VARIANTS[type] ?? "default"}
                                size="sm"
                              >
                                {type}
                              </Badge>
                              {isUnread && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs px-2"
                                  onClick={() => handleMarkRead(notification.id)}
                                >
                                  Mark read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(notification.id)}
                                disabled={deletingId === notification.id}
                              >
                                {deletingId === notification.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </Button>
                            </div>
                          </div>
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
    </DashboardLayout>
  );
}
