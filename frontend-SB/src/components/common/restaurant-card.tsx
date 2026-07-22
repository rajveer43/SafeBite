import { cn } from "@/lib/utils";

interface Props {
  name: string;
  safetyScore: number;
  address: string;
  phone?: string;
  ownerVerified?: boolean;
  isHighRisk?: boolean;
  isNearby?: boolean;
  onViewDetails?: () => void;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 ring-emerald-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 ring-blue-200";
  if (score >= 40) return "text-amber-600 bg-amber-50 ring-amber-200";
  return "text-red-600 bg-red-50 ring-red-200";
}

export default function RestaurantCard({ name, safetyScore, address, phone, ownerVerified, isHighRisk, isNearby, onViewDetails, className }: Props) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-100 p-4 card-hover", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800 truncate">{name}</h3>
            {ownerVerified && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                <svg width="8" height="8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Verified
              </span>
            )}
            {isHighRisk && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-red-50 text-red-600">High Risk</span>}
            {isNearby && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-600">Nearby</span>}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {address}
          </p>
          {phone && <p className="text-xs text-slate-500 mt-0.5">{phone}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-2 shrink-0", getScoreColor(safetyScore))}>
          {safetyScore}
        </div>
      </div>
      {onViewDetails && (
        <button onClick={onViewDetails}
          className="mt-3 w-full py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all">
          View Details
        </button>
      )}
    </div>
  );
}
