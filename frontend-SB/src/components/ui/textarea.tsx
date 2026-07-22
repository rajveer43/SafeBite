import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-600 tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full rounded-xl border border-slate-200 bg-white
            px-3.5 py-2.5 text-sm text-slate-900 font-medium
            placeholder:text-slate-400
            outline-none transition-all duration-200 resize-y min-h-[100px]
            hover:border-slate-300
            focus:border-primary-500 focus:ring-3 focus:ring-primary-500/10
            disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
            ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/20" : ""}
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-500">⚠ {error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
