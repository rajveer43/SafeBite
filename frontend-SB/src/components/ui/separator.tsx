import { cn } from "@/lib/utils";

export default function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return <div className={cn("bg-slate-100", orientation === "horizontal" ? "h-px w-full" : "w-px h-full", className)} />;
}
