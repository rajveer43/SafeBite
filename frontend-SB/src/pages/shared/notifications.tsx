import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Clock,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Info,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
import Card, { CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import Pagination from "@/components/ui/pagination";
import { useToast } from "@/components/common/toast";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notification_service";
import type { Notification } from "@/types";

type FilterType = "all" | "unread" | "success" | "warning" | "error" | "info";

const FILTER_TABS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "info", label: "Info" },
];

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Bell; color: string; bgColor: string }
> = {
  success: {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  complaint: MessageSquare,
  inspection: FileCheck,
  certificate: FileCheck,
  system: Info,
};

const PAGE_SIZE = 10;

function timeAgo(dateStr: string): string {
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

function getNotificationType(notification: Notification): string {
  return notification.type ?? "info";
}

function getIcon(type: string) {
  return TYPE_ICONS[type] ?? Bell;
}

function getTypeStyle(type: string) {
  return (
    TYPE_CONFIG[type] ?? {
      icon: Bell,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    }
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const exitVariants = {
  opacity: 0,
  x: -40,
  transition: { duration: 0.2 },
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(
        Array.isArray(data) ? data : data.data ?? data.results ?? []
      );
    } catch {
      toast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => getNotificationType(n) === filter);
  }, [notifications, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedNotifications = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length, unread: 0 };
    for (const n of notifications) {
      if (!n.is_read) counts.unread++;
      const t = getNotificationType(n);
      counts[t] = (counts[t] ?? 0) + 1;
    }
    return counts;
  }, [notifications]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

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
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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
          {FILTER_TABS.map((tab) => {
            const count = filterCounts[tab.value] ?? 0;
            const isActive = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
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
            icon={filter === "unread" ? BellOff : Bell}
            title={
              filter === "all"
                ? "No notifications"
                : filter === "unread"
                  ? "No unread notifications"
                  : `No ${filter} notifications`
            }
            description={
              filter === "all" || filter === "unread"
                ? "When something happens, you'll see it here."
                : "Try a different filter."
            }
          />
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {paginatedNotifications.map((notification) => {
                  const notifType = getNotificationType(notification);
                  const IconComponent = getIcon(notifType);
                  const typeStyle = getTypeStyle(notifType);
                  const isUnread = !notification.is_read;

                  return (
                    <motion.div
                      key={notification.id}
                      variants={itemVariants}
                      exit={exitVariants}
                      layout
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
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeStyle.bgColor}`}
                            >
                              <IconComponent
                                className={`h-5 w-5 ${typeStyle.color}`}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p
                                    className={`text-sm ${
                                      isUnread ? "font-semibold" : "font-medium"
                                    }`}
                                  >
                                    {notification.title ?? "Notification"}
                                  </p>
                                  {notification.message && (
                                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                      {notification.message}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isUnread && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                    <Clock className="h-3 w-3" />
                                    {timeAgo(notification.created_at)}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] capitalize"
                                >
                                  {notifType}
                                </Badge>
                                {isUnread && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkRead(notification.id);
                                    }}
                                  >
                                    Mark read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs px-2 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                  }}
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

            {totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
