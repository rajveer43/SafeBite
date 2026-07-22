import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  change?: number;
  changeLabel?: string;
  variant?: "default" | "emerald" | "amber" | "red" | "blue" | "purple";
  className?: string;
  description?: string;
  onClick?: () => void;
}

const variants = {
  default:  { card: "bg-white border-slate-100",       icon: "bg-slate-100 text-slate-600",       accent: "bg-slate-600" },
  emerald:  { card: "bg-white border-emerald-100/50",  icon: "bg-emerald-500/10 text-emerald-600", accent: "bg-emerald-500" },
  amber:    { card: "bg-white border-amber-100/50",    icon: "bg-amber-500/10 text-amber-600",     accent: "bg-amber-500" },
  red:      { card: "bg-white border-red-100/50",      icon: "bg-red-500/10 text-red-600",         accent: "bg-red-500" },
  blue:     { card: "bg-white border-blue-100/50",     icon: "bg-blue-500/10 text-blue-600",       accent: "bg-blue-500" },
  purple:   { card: "bg-white border-purple-100/50",   icon: "bg-purple-500/10 text-purple-600",   accent: "bg-purple-500" },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  variant = "default",
  className,
  description,
  onClick,
}: StatCardProps) {
  const v = variants[variant];
  const displayLabel = changeLabel || description;
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border p-5 overflow-hidden transition-all duration-200",
        v.card,
        "shadow-[0_1px_4px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.02)]",
        onClick && "cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5",
        className
      )}
    >
      {/* Subtle top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", v.accent, "opacity-60")} />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 leading-none mb-2">
            {value}
          </p>

          {/* Change / Description */}
          {(change !== undefined || displayLabel) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {change !== undefined && (
                <span className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-red-500/10 text-red-700"
                )}>
                  {isPositive
                    ? <TrendingUp size={10} />
                    : <TrendingDown size={10} />
                  }
                  {isPositive ? "+" : ""}{change}%
                </span>
              )}
              {displayLabel && (
                <span className="text-[11px] text-slate-400 font-medium">{displayLabel}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200",
            v.icon,
            onClick && "group-hover:scale-110"
          )}>
            <Icon size={18} strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  );
}
