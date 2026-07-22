import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import SearchBar from "@/components/common/search-bar";
import DataTable from "@/components/tables/data-table";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import { getUsers } from "@/services/admin_service";
import { motion } from "motion/react";
import { CheckCircle, XCircle } from "lucide-react";
import type { User } from "@/types";

const ROLES = ["all", "customer", "owner", "inspector"] as const;

const ROLE_LABELS: Record<string, string> = {
  all: "All",
  customer: "Customers",
  owner: "Owners",
  inspector: "Inspectors",
};

const ROLE_VARIANTS: Record<string, "default" | "info" | "success" | "warning"> = {
  customer: "info",
  owner: "success",
  inspector: "warning",
  admin: "default",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: { search?: string; role?: string } = {};
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      const res = await getUsers(params);
      const data = Array.isArray(res) ? res : res.data ?? res.items ?? [];
      setUsers(data);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, toast]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchUsers, search]);

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-slate-800">{String(row["name"] ?? "")}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["email"] ?? "")}</span>
      ),
    },
    {
      key: "phone_number",
      header: "Phone",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500">{String(row["phone_number"] ?? "")}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row: Record<string, unknown>) => {
        const role = String(row["role"] ?? "");
        return (
          <Badge variant={ROLE_VARIANTS[role] ?? "default"}>
            {ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "is_verified",
      header: "Verified",
      render: (row: Record<string, unknown>) =>
        row["is_verified"] ? (
          <CheckCircle size={18} className="text-emerald-500" />
        ) : (
          <XCircle size={18} className="text-slate-300" />
        ),
    },
    {
      key: "created_at",
      header: "Joined",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500 text-xs">
          {new Date(String(row["created_at"] ?? "")).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout title="User Management">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <PageHeader
            title="Users"
            description={`Manage all platform users (${users.length} total)`}
          />
        </motion.div>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search users by name, email, or phone..."
            className="flex-1"
          />
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap gap-2">
          {ROLES.map((role) => {
            const count =
              role === "all"
                ? users.length
                : users.filter((u) => u.role === role).length;
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`
                  inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                  ${roleFilter === role
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                {ROLE_LABELS[role]}
                <span
                  className={`
                    text-xs rounded-full px-1.5 py-0.5
                    ${roleFilter === role ? "bg-white/20" : "bg-slate-100"}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        <motion.div variants={item}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={users as unknown as Record<string, unknown>[]}
                emptyMessage={
                  search
                    ? `No users found matching "${search}"`
                    : "No users found"
                }
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
