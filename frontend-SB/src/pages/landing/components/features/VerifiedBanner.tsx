import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { BadgeCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { fadeUp } from "./motion";

/* Closing callout — a horizontal mint banner (not another white card).
   Soft gradient surface, icon + copy left, right-aligned CTA. Fully clickable. */
export function VerifiedBanner() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      custom={6}
    >
      <Link
        to="/customer/restaurants"
        className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl border border-emerald-200/80 p-8 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_16px_36px_-16px_rgba(16,185,129,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_1px_3px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(16,185,129,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:gap-7 sm:p-10"
        style={{ background: "linear-gradient(120deg, #ecfdf5 0%, #f7fefb 50%, #ffffff 100%)" }}
      >
        {/* Decorative subtle sweep */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{ background: "radial-gradient(120% 120% at 0% 50%, rgba(16,185,129,0.10) 0%, transparent 60%)" }}
        />

        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-[0_6px_16px_-4px_rgba(16,185,129,0.4)] transition-transform duration-300 group-hover:scale-105">
          <BadgeCheck size={24} />
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Verified Restaurants</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              <ShieldCheck size={11} /> Trusted
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
            Only restaurants passing rigorous inspections earn the SafeBite Verified badge — so
            diners always know exactly where they stand.
          </p>
        </div>

        <span className="relative inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-200/80 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-xs transition-all duration-300 group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-md">
          Learn More
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

