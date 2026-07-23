import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Brain, BadgeCheck, CalendarClock, ShieldCheck, TrendingUp, ArrowRight, Utensils,
} from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { fadeUp } from "./motion";

const detailRows = [
  { icon: BadgeCheck, label: "Restaurant", value: "The Green Kitchen", accent: false },
  { icon: ShieldCheck, label: "Risk Level", value: "Low", accent: false },
  { icon: TrendingUp, label: "Trend", value: "Improving", accent: true },
  { icon: CalendarClock, label: "Last Inspection", value: "2 days ago", accent: false },
];

/* The section's focal point — ONE full-width flagship hero (not two split cards).
   Left: the pitch, rendered large. Right: a single self-contained
   "Safety Score Dashboard" that communicates the feature at a glance. */
export function FeaturedAIScoreCard() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      custom={1}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_20px_48px_-16px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-500 hover:border-slate-300 hover:shadow-[0_1px_3px_rgba(15,23,42,0.04),0_28px_64px_-20px_rgba(15,23,42,0.12)]"
    >
      {/* Layered surface — radial subtle mint glow + top highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 80% at 100% 0%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(80% 70% at 0% 100%, rgba(16,185,129,0.03) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
      />

      <div className="relative grid grid-cols-1 gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:p-14">
        {/* ── Left: pitch, rendered clean & spacious ── */}
        <div className="flex flex-col items-start">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 shadow-xs">
            Flagship Feature
          </span>

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-xs transition-transform duration-300 group-hover:scale-105">
            <Brain size={20} />
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] leading-snug">
            AI Safety Scores
          </h3>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">
            Machine learning continuously evaluates restaurant hygiene, inspection history and risk
            factors — generating a real-time safety score you can trust.
          </p>

          <div className="mt-8 grid w-full grid-cols-3 gap-4 border-y border-slate-100 py-4">
            {[
              { k: "Accuracy", v: "99.2%" },
              { k: "Signals analyzed", v: "40+" },
              { k: "Refresh", v: "Live" },
            ].map((s) => (
              <div key={s.k} className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900">{s.v}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{s.k}</span>
              </div>
            ))}
          </div>

          <Link
            to="/customer/restaurants"
            className="group/cta mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            Explore safety scores
            <ArrowRight size={15} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
        </div>

        {/* ── Right: the integrated Safety Score Dashboard hero preview ── */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06),0_16px_40px_-16px_rgba(15,23,42,0.1)] transition-all duration-300">
            {/* Dashboard chrome */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Safety Score Dashboard
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>

            {/* Score hero row */}
            <div className="flex items-center gap-6 p-6 sm:p-7">
              <ScoreRing value={95} size={128} caption="Excellent" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Utensils size={16} />
                  </div>
                  <p className="truncate text-base font-bold text-slate-900">The Green Kitchen</p>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <BadgeCheck size={12} /> Verified · Excellent Safety
                  </span>
                </div>
                <div className="mt-3.5 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "95%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Detail rows */}
            <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100">
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-center gap-3 bg-white p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <row.icon size={16} className={row.accent ? "text-emerald-600" : "text-slate-500"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{row.label}</p>
                    <p className={`truncate text-[13px] font-semibold ${row.accent ? "text-emerald-600" : "text-slate-900"}`}>
                      {row.accent && "↑ "}{row.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating trend chip */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-3 -top-4 hidden items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/95 px-3.5 py-2.5 shadow-[0_12px_28px_-8px_rgba(15,23,42,0.12)] backdrop-blur-md sm:flex"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp size={15} />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-slate-900">+23%</p>
              <p className="text-[10px] font-medium text-slate-400">this quarter</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

