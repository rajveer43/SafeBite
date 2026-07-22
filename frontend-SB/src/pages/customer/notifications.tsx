import { useState } from "react";
import { motion } from "motion/react";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import EmptyState from "@/components/common/empty-state";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

const typeFilters = ["all", "success", "warning", "error", "info"] as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function CustomerNotifications() {
  const { notifications, loading, markRead, markAllRead, remove } = useNotifications();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = notifications.filter(
    (n) => typeFilter === "all" || n.type === typeFilter
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Notifications"
          description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
          action={
            unreadCount > 0 ? (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck size={14} />
                Mark all read
              </Button>
            ) : undefined
          }
        />

        <div className="flex gap-2 mb-6 flex-wrap">
          {typeFilters.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                typeFilter === type
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} />}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-all",
                  notif.is_read
                    ? "bg-white border-slate-100"
                    : "bg-white border-slate-200 shadow-sm"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", typeStyles[notif.type] || "bg-slate-400")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium text-slate-800", !notif.is_read && "font-semibold")}>
                      {notif.title}
                    </p>
                    {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => remove(notif.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
