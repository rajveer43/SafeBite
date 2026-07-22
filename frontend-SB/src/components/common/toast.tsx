import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface Toast { id: string; message: string; type: "success" | "error" | "warning" | "info"; }
interface ToastCtx { toast: (message: string, type?: Toast["type"]) => void; }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
// eslint-disable-next-line react/only-export-components
export const useToast = () => useContext(ToastContext);

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const styles = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  error: "bg-red-50 border-red-200 text-red-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`animate-slide-in flex items-start gap-2.5 p-3 rounded-xl border shadow-sm ${styles[t.type]}`}>
              <Icon size={15} className="mt-0.5 shrink-0" />
              <p className="text-xs font-medium flex-1">{t.message}</p>
              <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="shrink-0 opacity-50 hover:opacity-100"><X size={12} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
