import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border border-slate-200",
  under_review: "bg-amber-100 text-amber-800 border border-amber-200",
  in_review: "bg-blue-50 text-blue-700",
  under_investigation: "bg-blue-50 text-blue-700",
  scheduled: "bg-blue-50 text-blue-700",
  in_progress: "bg-blue-50 text-blue-700",
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-50 text-emerald-700",
  resolved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
  dismissed: "bg-slate-100 text-slate-600",
  cancelled: "bg-slate-100 text-slate-600",
  expired: "bg-rose-50 text-rose-700",
};

function fmt(s: string) { return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
      statusStyles[status] || "bg-slate-100 text-slate-600", className)}>
      {fmt(status)}
    </span>
  );
}
