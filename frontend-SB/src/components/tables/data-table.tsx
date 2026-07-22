import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({ columns, data, emptyMessage = "No data", onRowClick, className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th key={col.key} className={cn("text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-3", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-10 text-xs text-slate-400">{emptyMessage}</td></tr>
          ) : data.map((item, i) => (
            <tr key={i} onClick={() => onRowClick?.(item)}
              className={cn("border-b border-slate-50 hover:bg-slate-50/60 transition-colors", onRowClick && "cursor-pointer")}>
              {columns.map((col) => (
                <td key={col.key} className={cn("py-2.5 px-3 text-xs text-slate-700", col.className)}>
                  {col.render ? col.render(item) : String(item[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
