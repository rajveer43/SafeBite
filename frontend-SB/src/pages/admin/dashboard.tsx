import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import StatCard from "@/components/dashboard/stat_card";
import BarChartComponent from "@/components/charts/bar-chart";
import PieChartComponent from "@/components/charts/pie-chart";
import AreaChartComponent from "@/components/charts/area-chart";
import DataTable from "@/components/tables/data-table";
import PageHeader from "@/components/common/page-header";
import StatusBadge from "@/components/common/status-badge";
import SafetyScoreBadge from "@/components/common/safety-score";
import Button from "@/components/ui/button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import { getDashboard, verifyOwner } from "@/services/admin_service";
import { motion } from "motion/react";
import {
  Users,
  Store,
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  Activity,
  FileCheck,
  Check,
  X,
  Clock,
} from "lucide-react";
import type { AdminDashboard } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const complaintsByMonth = [
  { month: "Jan", complaints: 12 },
  { month: "Feb", complaints: 8 },
  { month: "Mar", complaints: 15 },
  { month: "Apr", complaints: 10 },
  { month: "May", complaints: 18 },
  { month: "Jun", complaints: 7 },
  { month: "Jul", complaints: 22 },
  { month: "Aug", complaints: 14 },
  { month: "Sep", complaints: 9 },
  { month: "Oct", complaints: 11 },
  { month: "Nov", complaints: 6 },
  { month: "Dec", complaints: 13 },
];

const userDistribution = [
  { name: "Customers", value: 0 },
  { name: "Owners", value: 0 },
  { name: "Inspectors", value: 0 },
  { name: "Admins", value: 0 },
];

const restaurantGrowth = [
  { month: "Jan", restaurants: 5 },
  { month: "Feb", restaurants: 8 },
  { month: "Mar", restaurants: 12 },
  { month: "Apr", restaurants: 16 },
  { month: "May", restaurants: 22 },
  { month: "Jun", restaurants: 28 },
  { month: "Jul", restaurants: 35 },
  { month: "Aug", restaurants: 41 },
  { month: "Sep", restaurants: 48 },
  { month: "Oct", restaurants: 55 },
  { month: "Nov", restaurants: 62 },
  { month: "Dec", restaurants: 70 },
];

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-xl" />;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadDashboard = useCallback(async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    reloadDashboard();
  }, [reloadDashboard]);

  const handleVerifyOwner = async (userId: string, approved: boolean) => {
    try {
      await verifyOwner(userId, approved);
      toast(approved ? "Owner approved successfully" : "Owner verification rejected", approved ? "success" : "warning");
      await reloadDashboard();
    } catch {
      toast("Failed to update owner verification", "error");
    }
  };

  const userDistData = dashboard
    ? [
        { name: "Customers", value: dashboard.total_customers },
        { name: "Owners", value: dashboard.total_owners },
        { name: "Inspectors", value: dashboard.total_inspectors },
        { name: "Admins", value: Math.max(0, (dashboard.total_users || 0) - (dashboard.total_customers || 0) - (dashboard.total_owners || 0) - (dashboard.total_inspectors || 0)) },
      ]
    : userDistribution;

  const activityColumns = [
    {
      key: "type",
      header: "Type",
      render: (row: Record<string, unknown>) => (
        <Badge variant="info">{String(row["activity_type"] ?? "activity")}</Badge>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-slate-800">{String(row["message"] ?? row["details"] ?? "")}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-400 text-xs">
          {row["created_at"] ? new Date(String(row["created_at"])).toLocaleString() : String(row["time"] ?? "")}
        </span>
      ),
    },
  ];

  const recentUsersColumns = [
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
      key: "role",
      header: "Role",
      render: (row: Record<string, unknown>) => {
        const role = String(row["role"] ?? "");
        const variants: Record<string, "default" | "success" | "info" | "warning"> = {
          customer: "info",
          owner: "success",
          inspector: "warning",
          admin: "default",
        };
        return <Badge variant={variants[role] ?? "default"}>{role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}</Badge>;
      },
    },
    {
      key: "joined",
      header: "Joined",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500 text-xs">{new Date(String(row["created_at"] ?? "")).toLocaleDateString()}</span>
      ),
    },
  ];

  const recentRestaurantsColumns = [
    {
      key: "name",
      header: "Name",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-slate-800">{String(row["name"] ?? "")}</span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["owner_name"] ?? "")}</span>
      ),
    },
    {
      key: "safety_score",
      header: "Safety Score",
      render: (row: Record<string, unknown>) => (
        <SafetyScoreBadge score={Number(row["safety_score"] ?? 0)} size="sm" />
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500 text-xs truncate max-w-[150px] block">{String(row["address"] ?? "")}</span>
      ),
    },
  ];

  const pendingVerificationColumns = [
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
      key: "phone",
      header: "Phone",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500">{String(row["phone_number"] ?? "")}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Record<string, unknown>) => {
        const userId = String(row["user_id"] ?? row["id"] ?? "");
        return (
          <div className="flex items-center gap-2">
            <Button variant="success" size="sm" onClick={() => handleVerifyOwner(userId, true)}>
              <Check size={14} /> Approve
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleVerifyOwner(userId, false)}>
              <X size={14} /> Reject
            </Button>
          </div>
        );
      },
    },
  ];

  const pendingComplaintsColumns = [
    {
      key: "title",
      header: "Title",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-slate-800">{String(row["title"] ?? "")}</span>
      ),
    },
    {
      key: "restaurant",
      header: "Restaurant",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["restaurant_name"] ?? "")}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500">{String(row["customer_name"] ?? "")}</span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row: Record<string, unknown>) => {
        const priority = String(row["priority"] ?? "");
        const variants: Record<string, "default" | "warning" | "danger" | "info"> = {
          low: "info",
          medium: "default",
          high: "warning",
          critical: "danger",
        };
        return <Badge variant={variants[priority] ?? "default"}>{priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : ""}</Badge>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => <StatusBadge status={String(row["status"] ?? "pending")} />,
    },
  ];

  const pendingCertificatesColumns = [
    {
      key: "restaurant",
      header: "Restaurant",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-slate-800">{String(row["restaurant_name"] ?? "")}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["certificate_type"] ?? "")}</span>
      ),
    },
    {
      key: "issued",
      header: "Issued",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500 text-xs">{new Date(String(row["issued_date"] ?? "")).toLocaleDateString()}</span>
      ),
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500 text-xs">{new Date(String(row["expiry_date"] ?? "")).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <div className="flex items-center gap-2">
          <Button variant="success" size="sm">
            <Check size={14} /> Approve
          </Button>
          <Button variant="danger" size="sm">
            <X size={14} /> Reject
          </Button>
        </div>
      ),
    },
  ];

  const expiringCertificatesColumns = [
    {
      key: "restaurant",
      header: "Restaurant",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-slate-800">{String(row["restaurant_name"] ?? "")}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["certificate_type"] ?? "")}</span>
      ),
    },
    {
      key: "expiry",
      header: "Expiry",
      render: (row: Record<string, unknown>) => {
        const expiry = new Date(String(row["expiry_date"] ?? ""));
        const now = new Date();
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">{expiry.toLocaleDateString()}</span>
            <Badge variant="warning" size="sm">
              <Clock size={10} className="mr-1" />
              {daysLeft}d left
            </Badge>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => <StatusBadge status={String(row["status"] ?? "pending")} />,
    },
  ];

  const overdueInspectionsColumns = [
    {
      key: "restaurant",
      header: "Restaurant",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-slate-800">{String(row["restaurant_name"] ?? "")}</span>
      ),
    },
    {
      key: "inspector",
      header: "Inspector",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["inspector_name"] ?? "")}</span>
      ),
    },
    {
      key: "scheduled",
      header: "Scheduled",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500 text-xs">{new Date(String(row["scheduled_date"] ?? "")).toLocaleDateString()}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => <StatusBadge status={String(row["status"] ?? "scheduled")} />,
    },
  ];

  const highRiskColumns = [
    {
      key: "name",
      header: "Restaurant",
      render: (row: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <Badge variant="danger" size="sm">High Risk</Badge>
          <span className="font-medium text-slate-800">{String(row["name"] ?? "")}</span>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-600">{String(row["owner_name"] ?? "")}</span>
      ),
    },
    {
      key: "safety_score",
      header: "Safety Score",
      render: (row: Record<string, unknown>) => (
        <SafetyScoreBadge score={Number(row["safety_score"] ?? 0)} size="sm" />
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-500 text-xs truncate max-w-[150px] block">{String(row["address"] ?? "")}</span>
      ),
    },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <PageHeader
            title="Admin Dashboard"
            description="Platform overview and management"
          />
        </motion.div>

        <motion.div
          variants={item}
          className="grid gap-4 grid-cols-2 lg:grid-cols-4"
        >
          {loading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Users"
                value={dashboard?.total_users ?? 0}
                icon={Users}
                variant="default"
              />
              <StatCard
                title="Customers"
                value={dashboard?.total_customers ?? 0}
                icon={Users}
                variant="emerald"
              />
              <StatCard
                title="Owners"
                value={dashboard?.total_owners ?? 0}
                icon={Store}
                variant="blue"
              />
              <StatCard
                title="Inspectors"
                value={dashboard?.total_inspectors ?? 0}
                icon={ClipboardList}
                variant="amber"
              />
            </>
          )}
        </motion.div>

        <motion.div
          variants={item}
          className="grid gap-4 grid-cols-2 lg:grid-cols-4"
        >
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Restaurants"
                value={dashboard?.total_restaurants ?? 0}
                icon={Store}
                variant="default"
              />
              <StatCard
                title="Certificates"
                value={dashboard?.total_certificates ?? 0}
                icon={FileCheck}
                variant="emerald"
              />
              <StatCard
                title="Complaints"
                value={dashboard?.total_complaints ?? 0}
                icon={AlertTriangle}
                variant="amber"
              />
              <StatCard
                title="Avg Safety Score"
                value={dashboard?.avg_safety_score != null ? Number(dashboard.avg_safety_score).toFixed(1) : "0.0"}
                icon={ShieldCheck}
                variant="default"
              />
            </>
          )}
        </motion.div>

        <motion.div
          variants={item}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              title="High Risk Restaurants"
              value={dashboard?.high_risk_restaurants ?? 0}
              icon={AlertTriangle}
              variant="red"
            />
          )}
        </motion.div>

        <motion.div
          variants={item}
          className="grid gap-6 lg:grid-cols-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <BarChartComponent
                  data={complaintsByMonth}
                  xKey="month"
                  yKey="complaints"
                  color="#f59e0b"
                  height={280}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <PieChartComponent
                  data={userDistData}
                  dataKey="value"
                  nameKey="name"
                  height={280}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Growth</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <AreaChartComponent
                  data={restaurantGrowth}
                  xKey="month"
                  yKey="restaurants"
                  color="#10b981"
                  height={280}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={18} /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={activityColumns}
                  data={(dashboard?.activities ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No recent activity"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} /> Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={recentUsersColumns}
                  data={(dashboard?.recent_users ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No recent users"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store size={18} /> Recent Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={recentRestaurantsColumns}
                  data={(dashboard?.recent_restaurants ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No recent restaurants"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={18} /> Pending Owner Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={pendingVerificationColumns}
                  data={(dashboard?.pending_owner_verifications ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No pending verifications"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={18} /> Pending Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={pendingComplaintsColumns}
                  data={(dashboard?.pending_complaints_list ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No pending complaints"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck size={18} /> Pending Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={pendingCertificatesColumns}
                  data={(dashboard?.pending_certificates_list ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No pending certificates"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} /> Expiring Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={expiringCertificatesColumns}
                  data={(dashboard?.expiring_certificates ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No expiring certificates"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList size={18} /> Overdue Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={overdueInspectionsColumns}
                  data={(dashboard?.overdue_inspections ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No overdue inspections"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={18} /> High Risk Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  columns={highRiskColumns}
                  data={(dashboard?.high_risk_list ?? []) as unknown as Record<string, unknown>[]}
                  emptyMessage="No high risk restaurants"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
