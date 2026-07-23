import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { type FeatureItem } from "./data";
import { fadeUp } from "./motion";

/* Information-rich feature card: small icon, title, description, a capability
   checklist, a divider, then a micro-metric + CTA footer. Compact by design —
   padding creates presence, not empty height. Alive on hover. */
export function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div variants={fadeUp} custom={index + 2} className="h-full">
      <Link
        to={item.href}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 sm:p-8"
      >
        {/* Subtle corner glow on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)" }}
        />

        <div>
          {/* Header row with standardized icon container */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Icon size={20} />
            </div>
            <div className="min-w-0 pt-1">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">{item.title}</h3>
            </div>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-slate-500">{item.description}</p>

          {/* Capability checklist */}
          <ul className="mb-8 space-y-2.5">
            {item.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-600">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <Check size={10} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider + micro-metric + CTA footer (strictly aligned at bottom) */}
        <div className="relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-slate-900">{item.metric.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.metric.label}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-emerald-600 transition-colors group-hover:text-emerald-700">
            Learn More
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

