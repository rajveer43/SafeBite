import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline" | "secondary" | "destructive";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border border-slate-200/50",
  success: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  danger: "bg-red-500/10 text-red-700 border border-red-500/20",
  info: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
  outline: "border border-slate-200 text-slate-600 bg-white",
  secondary: "bg-slate-50 text-slate-600 border border-slate-200/40",
  destructive: "bg-red-500/10 text-red-700 border border-red-500/20",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  outline: "bg-slate-400",
  secondary: "bg-slate-400",
  destructive: "bg-red-500",
};

export default function Badge({ children, variant = "default", size = "sm", dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tracking-tight whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        styles[variant],
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
}
