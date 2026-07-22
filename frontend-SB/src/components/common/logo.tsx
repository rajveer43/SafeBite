import { ShieldCheck } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}

export default function Logo({ size = "md", dark = false }: LogoProps) {
  const s = {
    sm: { icon: 16, pad: "p-1.5", text: "text-lg", sub: "text-[10px]" },
    md: { icon: 20, pad: "p-2", text: "text-xl", sub: "text-xs" },
    lg: { icon: 28, pad: "p-3", text: "text-3xl", sub: "text-sm" },
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`bg-primary-600 ${s.pad} rounded-xl`}>
        <ShieldCheck className="text-white" size={s.icon} />
      </div>
      <div>
        <h1 className={`${s.text} font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>SafeBite</h1>
        {size !== "sm" && (
          <p className={`${s.sub} ${dark ? "text-emerald-200" : "text-slate-500"}`}>Food Safety Platform</p>
        )}
      </div>
    </div>
  );
}
