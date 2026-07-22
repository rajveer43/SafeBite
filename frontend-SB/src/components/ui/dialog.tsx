import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Dialog({ open, onClose, onOpenChange, children, title, description, className }: DialogProps) {
  const handleClose = () => { onClose?.(); onOpenChange?.(false); };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className={cn("relative z-50 bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in", className)}>
        {(title || description) && (
          <div className="px-5 pt-5 pb-0">
            {title && <h2 className="text-base font-semibold text-slate-800">{title}</h2>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100", className)}>{children}</div>;
}
