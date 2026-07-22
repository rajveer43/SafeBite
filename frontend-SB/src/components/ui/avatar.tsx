import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = { xs: "w-6 h-6 text-[9px]", sm: "w-8 h-8 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const colors = ["bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
function getColor(name: string) {
  let h = 0;
  for (const ch of name) h = ch.charCodeAt(0) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  if (src) return <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />;
  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold text-white shrink-0", getColor(name), sizes[size], className)}>
      {getInitials(name)}
    </div>
  );
}
