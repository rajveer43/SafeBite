import { cn } from "@/lib/utils";

interface Props {
  score: number | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScore(score: number) {
  if (score >= 80) return { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200", label: "Excellent" };
  if (score >= 60) return { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200", label: "Good" };
  if (score >= 40) return { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200", label: "Fair" };
  return { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-200", label: "Poor" };
}

const s = { sm: "w-10 h-10 text-xs", md: "w-14 h-14 text-sm", lg: "w-18 h-18 text-base" };

export default function SafetyScoreBadge({ score, size = "md", showLabel = false }: Props) {
  const numScore = typeof score === "number" ? score : Number(score) || 0;
  const c = getScore(numScore);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={cn("rounded-full flex items-center justify-center font-bold ring-2", c.bg, c.text, c.ring, s[size])}>
        {numScore}
      </div>
      {showLabel && <span className={cn("text-[10px] font-medium", c.text)}>{c.label}</span>}
    </div>
  );
}
