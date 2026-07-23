import { motion } from "motion/react";
import { SectionHeader } from "./SectionHeader";
import { FeaturedAIScoreCard } from "./FeaturedAIScoreCard";
import { FeatureCard } from "./FeatureCard";
import { VerifiedBanner } from "./VerifiedBanner";
import { featureItems } from "./data";
import { stagger } from "./motion";

/* Art-directed features section.
   Rhythm: header → full-width flagship hero → capability grid → mint callout.
   Owns a near-white surface so the global page grid recedes behind it. */
export function FeatureSection() {
  return (
    <section
      id="features"
      className="relative z-[1] overflow-hidden py-32 sm:py-40 lg:py-48"
      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Local background — near-white base, a faint mint radial, and a whisper-faint grid. */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "#FBFEFC" }} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12">
        <SectionHeader />

        {/* Flagship — the focal point, spanning full width */}
        <div className="mt-20 sm:mt-24 lg:mt-28">
          <FeaturedAIScoreCard />
        </div>

        {/* Capability band — labeled, then a responsive grid (2-up on sm/md, 4-up on xl) */}
        <div className="mt-24 sm:mt-28 lg:mt-36">
          <div className="mb-8 flex items-center gap-4 sm:mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Built-in capabilities
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 lg:gap-8"
          >
            {featureItems.map((item, i) => (
              <FeatureCard key={item.title} item={item} index={i} />
            ))}
          </motion.div>
        </div>

        {/* Closing callout */}
        <div className="mt-20 sm:mt-24 lg:mt-28">
          <VerifiedBanner />
        </div>
      </div>
    </section>
  );
}

