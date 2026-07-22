import type { ButtonHTMLAttributes, ReactNode } from "react";
import Loading from "../common/loading";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "xs" | "sm" | "md" | "lg";
}

const variants = {
  default: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/10 hover:shadow-md hover:shadow-primary-600/15 focus-visible:ring-primary-500",
  secondary: "bg-slate-100 hover:bg-slate-200/80 text-slate-800 focus-visible:ring-slate-300",
  outline: "border border-slate-200 bg-white hover:bg-slate-50/80 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-200",
  ghost: "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-200",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/10 hover:shadow-md hover:shadow-red-600/15 focus-visible:ring-red-500",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10 hover:shadow-md hover:shadow-emerald-600/15 focus-visible:ring-emerald-500",
};

const sizes = {
  xs: "px-2.5 py-1 text-xs rounded-lg",
  sm: "px-3.5 py-1.5 text-xs rounded-lg font-medium",
  md: "px-4.5 py-2 text-sm rounded-xl font-medium",
  lg: "px-6 py-2.5 text-sm rounded-xl font-semibold",
};

export default function Button({
  children,
  loading = false,
  variant = "default",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={`
        inline-flex items-center justify-center gap-1.5
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? <Loading size="sm" /> : children}
    </button>
  );
}
