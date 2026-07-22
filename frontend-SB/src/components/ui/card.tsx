import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: "none" | "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddings = {
  none: "",
  xs: "p-3",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className = "",
  hover = false,
  glass = false,
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-slate-100/80
        ${glass ? "glass" : "shadow-premium"}
        ${hover ? "card-hover cursor-pointer" : ""}
        ${onClick ? "cursor-pointer hover:bg-slate-50/50 transition-all duration-200" : ""}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between pb-4 mb-4 border-b border-slate-100/60 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-sm font-semibold tracking-tight text-slate-800 lg:text-base ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`text-slate-600 ${className}`}>{children}</div>;
}
