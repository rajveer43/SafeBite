import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition">
        <ChevronLeft size={14} />
      </button>
      {pages.map((page, i) =>
        page === "..." ? <span key={`d${i}`} className="px-1.5 text-slate-400 text-xs">...</span> : (
          <button key={page} onClick={() => onPageChange(page)}
            className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
              currentPage === page ? "bg-primary-600 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}>
            {page}
          </button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
