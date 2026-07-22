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

const TYPE_COLORS: Record<string, string> = {
  complaint: "bg-red-100 text-red-600",
  inspection: "bg-blue-100 text-blue-600",
  certificate: "bg-green-100 text-green-600",
  system: "bg-gray-100 text-gray-600",
  message: "bg-purple-100 text-purple-600",
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

  const unreadCount = notifications.filter(
    (n) => !n.is_read
  ).length;

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => (n.type ?? "system") === filter);

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description={
            unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Mark all read
              </Button>
            ) : undefined
          }
        />

        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_TYPES.map((t) => {
            const count =
              t.value === "all"
                ? notifications.length
                : notifications.filter((n) => (n.type ?? "system") === t.value)
                    .length;
            return (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === t.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.label}
                <span className="ml-0.5 text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
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
                const type = notification.type ?? "system";
                const Icon = TYPE_ICONS[type] ?? TYPE_ICONS.default;
                const colorClass =
                  TYPE_COLORS[type] ?? TYPE_COLORS.default;
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
                      className={`transition-colors ${
                        isUnread
                          ? "bg-primary/5 border-primary/20"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${colorClass}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p
                                  className={`text-sm ${
                                    isUnread ? "font-semibold" : "font-medium"
                                  }`}
                                >
                                  {notification.title ?? notification.message ?? "Notification"}
                                </p>
                                {((notification as Record<string, any>).body || notification.message) && (
                                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                                    {(notification as Record<string, any>).body || notification.message}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isUnread && (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                                <span className="text-muted-foreground text-xs whitespace-nowrap flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getRelativeTime(
                                    notification.created_at ??
                                      new Date().toISOString()
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px] capitalize">
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
                                className="h-6 text-xs px-2 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(notification.id)}
                                disabled={deletingId === notification.id}
                              >
                                {deletingId === notification.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
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
      </div>
    </DashboardLayout>
  );
}
