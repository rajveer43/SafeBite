import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, hint, icon, style, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-600 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            style={{
              paddingLeft: icon ? "40px" : undefined,
              ...style,
            }}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 text-sm text-slate-900",
              "placeholder:text-slate-400 font-medium outline-none transition-all duration-200",
              "hover:border-slate-300 focus:border-primary-500 focus:ring-3 focus:ring-primary-500/10",
              "disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed",
              !icon && "px-3.5",
              error && "border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30",
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
