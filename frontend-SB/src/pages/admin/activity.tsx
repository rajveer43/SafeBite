import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import DataTable from "@/components/tables/data-table";
import Pagination from "@/components/ui/pagination";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import { getActivityLogs } from "@/services/admin_service";
import { motion } from "motion/react";
import { Clock, User } from "lucide-react";

interface ActivityLog {
  id: number;
  user_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

const ACTION_VARIANTS: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  login: "info",
  logout: "default",
  create: "success",
  update: "warning",
  delete: "danger",
  verify: "success",
  reject: "danger",
  approve: "success",
  upload: "info",
  complaint: "warning",
  inspection: "info",
  certificate: "info",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function getActionVariant(action: string): "default" | "success" | "warning" | "danger" | "info" {
  const lower = action.toLowerCase();
  for (const [key, variant] of Object.entries(ACTION_VARIANTS)) {
    if (lower.includes(key)) return variant;
  }
  return "default";
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminActivity() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getActivityLogs({ page, per_page: 20 });
      const data = Array.isArray(res) ? res : res.data ?? res.items ?? [];
      setLogs(data);
      setTotalPages(res.total_pages ?? 1);
    } catch {
      toast("Failed to load activity logs", "error");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    {
      key: "created_at",
      header: "Timestamp",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400 shrink-0" />
          <span className="text-slate-500 text-xs whitespace-nowrap">
            {new Date(String(row["created_at"] ?? "")).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "user_name",
      header: "User",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 shrink-0">
            <User size={12} className="text-slate-500" />
          </div>
          <span className="font-medium text-slate-800 text-sm">
            {String(row["user_name"] ?? "System")}
          </span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (row: any) => {
        const action = String(row["action"] ?? "");
        return (
          <Badge variant={getActionVariant(action)} size="sm">
            {formatAction(action)}
          </Badge>
        );
      },
    },
    {
      key: "details",
      header: "Details",
      render: (row: any) => (
        <span className="text-slate-600 text-sm line-clamp-1 max-w-[300px] block">
          {String(row["details"] ?? "-")}
        </span>
      ),
    },
    {
      key: "ip_address",
      header: "IP Address",
      render: (row: any) => (
        <span className="text-slate-400 text-xs font-mono">
          {String(row["ip_address"] ?? "-")}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Activity Logs">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <PageHeader
            title="Activity Logs"
            description="Audit trail of all platform actions"
          />
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <DataTable
                  columns={columns}
                  data={logs as unknown as Record<string, unknown>[]}
                  emptyMessage="No activity logs found"
                />
                {totalPages > 1 && (
                  <div className="flex justify-center p-4 border-t border-slate-100">
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
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
