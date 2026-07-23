import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { fadeUp } from "./motion";

/* Art-directed header: eyebrow pill → large Apple-scale headline → measured subtitle.
   Generous vertical rhythm keeps nothing cramped. */
export function SectionHeader() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      custom={0}
      className="mx-auto flex max-w-[760px] flex-col items-center text-center"
    >
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 shadow-xs">
        <Sparkles size={12} className="text-emerald-600" />
        Platform
      </span>

      <h2 className="mb-6 text-3xl font-extrabold leading-[1.1] tracking-[-0.035em] text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
        Everything you need
        <br className="hidden sm:block" /> for <span className="text-emerald-600">food safety.</span>
      </h2>

      <p className="max-w-[650px] text-base sm:text-lg lg:text-[19px] leading-relaxed text-slate-500 font-normal">
        From AI-powered safety scoring to real-time inspection tracking, SafeBite is a complete
        ecosystem for food safety management.
      </p>
    </motion.div>
  );
}

