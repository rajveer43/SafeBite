import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  ShieldCheck, Sparkles,
  ClipboardCheck, Bell, CheckCircle2, Utensils, FileText,
  BarChart3, Shield, AlertTriangle, Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "motion/react";

/* Animated Counter Component for Statistics Numbers */
function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const numericString = value.replace(/[^0-9]/g, "");
  const target = parseInt(numericString, 10) || 0;
  const hasComma = value.includes(",");
  const suffix = value.includes("+") ? "+" : value.includes("%") ? "%" : "";

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1600;
    const steps = 50;
    const stepTime = duration / steps;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target]);

  const formattedNumber = hasComma
    ? displayValue.toLocaleString("en-US")
    : displayValue.toString();

  return (
    <span ref={ref}>
      {formattedNumber}{suffix}
    </span>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-slate-50 font-sans">
      {/* ============================================================
          LEFT BRANDING PANEL — Premium layered emerald hero
          Deep emerald gradient · glass cards · 8pt rhythm
          ============================================================ */}
      <div
        className="hidden lg:flex w-[520px] xl:w-[580px] shrink-0 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(155deg, #0B4A3B 0%, #08362C 55%, #062A22 100%)",
        }}
      >
        {/* ---------- Layered background depth (all < 6% presence) ---------- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Radial glow behind content */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 25% 30%, rgba(16,104,78,0.55) 0%, transparent 60%)",
            }}
          />
          {/* Large blurred accent circles — very low opacity */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -left-20 w-[26rem] h-[26rem] rounded-full blur-3xl"
            style={{ background: "#10684E" }}
          />
          <motion.div
            animate={{ scale: [1.15, 1, 1.15], opacity: [0.05, 0.03, 0.05] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-28 -right-16 w-[30rem] h-[30rem] rounded-full blur-3xl"
            style={{ background: "#10684E" }}
          />
          {/* Whisper-soft grid for structure (~4% opacity) */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(120% 100% at 30% 30%, #000 0%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(120% 100% at 30% 30%, #000 0%, transparent 75%)",
            }}
          />
        </div>

        {/* ---------- Full-height column: header · content · footer ---------- */}
        <div
          style={{ paddingLeft: 56, paddingRight: 56, paddingTop: 48, paddingBottom: 48 }}
          className="relative z-10 mx-auto flex h-full min-h-screen w-full max-w-[460px] flex-col"
        >
          {/* Header — logo + mission badge */}
          <div className="shrink-0">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-3 group no-underline"
              >
                <motion.div
                  whileHover={{ scale: 1.06, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
                  style={{
                    background: "rgba(16,104,78,0.35)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 8px 24px -8px rgba(16,104,78,0.6)",
                  }}
                >
                  <ShieldCheck size={20} className="text-emerald-300" />
                </motion.div>
                <span className="text-[22px] font-semibold tracking-tight text-white leading-none">
                  Safe<span className="text-emerald-400">Bite</span>
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              style={{ marginTop: 20 }}
            >
              <span
                className="inline-flex max-w-full items-center gap-2 rounded-full text-[12px] font-medium text-emerald-100/95 backdrop-blur-md transition-colors duration-200 cursor-default hover:bg-white/[0.12]"
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Sparkles size={13} className="shrink-0 text-emerald-300" />
                <span className="tracking-wide">Our Mission · Safer Dining for Everyone</span>
              </span>
            </motion.div>
          </div>

          {/* Main content — vertically centered in remaining space */}
          <div
            style={{ paddingTop: 40, paddingBottom: 40 }}
            className="flex flex-1 flex-col justify-center"
          >
            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="text-white font-bold text-[2.5rem] xl:text-[2.85rem] tracking-[-0.02em]"
              style={{ lineHeight: 1.1 }}
            >
              Every Safe Meal
              <br />
              Starts Here
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-[400px] text-[15px]"
              style={{ marginTop: 20, lineHeight: 1.65, color: "rgba(255,255,255,0.72)" }}
            >
              Every restaurant score, inspection report, and verified badge helps
              you dine with complete confidence — and total peace of mind.
            </motion.p>

            {/* Feature cards — consistent height, aligned icon + text */}
            <div style={{ marginTop: 32 }} className="flex w-full flex-col gap-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified Restaurants",
                  desc: "Backed by official inspection data and verified safety ratings.",
                },
                {
                  icon: BarChart3,
                  title: "AI Safety Scores",
                  desc: "Real-time hygiene analytics & instant rating insights.",
                },
                {
                  icon: AlertTriangle,
                  title: "Report & Protect",
                  desc: "Report food safety concerns directly to protect your community.",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.32 + idx * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="group flex w-full items-start rounded-2xl cursor-default hover:border-white/18"
                  style={{
                    gap: 14,
                    padding: "16px 18px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    transition:
                      "box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease, transform 0.25s ease",
                  }}
                >
                  <div
                    className="mt-0.5 w-10 h-10 shrink-0 flex items-center justify-center rounded-xl transition-shadow duration-300 group-hover:shadow-[0_0_18px_-4px_rgba(16,104,78,0.9)]"
                    style={{
                      background: "rgba(16,104,78,0.32)",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    <feature.icon size={18} className="text-emerald-300" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="text-[15px] font-semibold text-white leading-tight tracking-tight">
                      {feature.title}
                    </h4>
                    <p
                      className="text-[13px] mt-1.5 leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.58)" }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Statistics — equal columns, centered content */}
            <div style={{ marginTop: 24 }} className="grid w-full grid-cols-3 gap-3">
              {[
                { value: "5,000+", label: "Restaurants" },
                { value: "98%", label: "Safety Rate" },
                { value: "50+", label: "Cities" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.62 + i * 0.08 }}
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-start justify-center rounded-2xl"
                  style={{
                    padding: "18px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    transition: "box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease",
                  }}
                >
                  <p className="text-[24px] xl:text-[26px] font-bold text-white tracking-tight leading-none whitespace-nowrap">
                    <AnimatedCounter value={s.value} />
                  </p>
                  <p
                    className="text-[12px] mt-2.5 leading-none font-medium"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer — pinned to bottom */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="shrink-0 text-[12px] font-normal tracking-wide"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            © SafeBite. All rights reserved.
          </motion.p>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 flex justify-center items-center p-6 sm:p-12 relative bg-slate-50 min-h-screen overflow-hidden">
        {/* Soft Green Radial Background Glow */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.05) 50%, transparent 80%)",
          }}
        />

        {/* Subtle grid background pattern */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "40px 40px", opacity: 0.2,
        }} />

        {/* Top Half Subtle Watermark Illustration — pushed to background texture */}
        <div className="absolute top-10 right-16 pointer-events-none opacity-[0.04] text-emerald-900">
          <Shield size={280} strokeWidth={1} />
        </div>
        <div className="absolute bottom-10 left-16 pointer-events-none opacity-[0.035] text-emerald-800">
          <Utensils size={240} strokeWidth={1} />
        </div>

        {/* Scattered Floating Semi-Transparent Icons — quiet texture, well clear of the card */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [-6, 6, -6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-16 left-20 text-emerald-600/12 pointer-events-none"
        >
          <Shield size={36} />
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10], rotate: [6, -6, 6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-28 right-24 text-emerald-600/10 pointer-events-none"
        >
          <Utensils size={32} />
        </motion.div>

        <motion.div
          animate={{ y: [-8, 12, -8], rotate: [-4, 8, -4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-28 left-28 text-emerald-600/12 pointer-events-none"
        >
          <CheckCircle2 size={34} />
        </motion.div>

        <motion.div
          animate={{ y: [12, -8, 12], rotate: [8, -4, 8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-20 right-32 text-emerald-600/10 pointer-events-none"
        >
          <FileText size={32} />
        </motion.div>

        <motion.div
          animate={{ y: [-12, 10, -12], scale: [1, 1.1, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-1/3 left-12 text-emerald-600/[0.08] pointer-events-none"
        >
          <BarChart3 size={38} />
        </motion.div>

        <motion.div
          animate={{ y: [10, -12, 10], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-1/3 right-12 text-emerald-600/10 pointer-events-none"
        >
          <Bell size={34} />
        </motion.div>

        {/* Main Center Card Wrapper with 4 Floating Status Cards */}
        <div className="w-full max-w-[480px] relative z-10">
          {/* Floating Card — TOP LEFT · Safety Score (medium elevation, quiet) */}
          <motion.div
            initial={{ opacity: 0, x: -16, scale: 0.94 }}
            animate={{ opacity: 0.88, x: 0, scale: 1, y: [-6, 6, -6] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.4 },
              x: { duration: 0.6, delay: 0.4 },
              scale: { duration: 0.6, delay: 0.4 },
              y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ opacity: 1 }}
            style={{ padding: "14px 18px" }}
            className="hidden xl:flex absolute -top-10 -left-40 xl:-left-48 bg-white/85 backdrop-blur-md rounded-[18px] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] border border-slate-200/60 items-center gap-3.5 z-20"
          >
            <div className="w-9 h-9 rounded-[12px] bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">Safety Score</span>
              </div>
              <p className="text-[13px] font-bold text-slate-800 mt-0.5">
                96/100 <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-1">Excellent</span>
              </p>
            </div>
          </motion.div>

          {/* Floating Card — TOP RIGHT · Certificate Alert (medium elevation, quiet) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 0.88, scale: 1, y: [6, -6, 6] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.5 },
              scale: { duration: 0.6, delay: 0.5 },
              y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ opacity: 1 }}
            style={{ padding: "14px 18px" }}
            className="hidden xl:flex absolute -top-10 -right-40 xl:-right-48 bg-white/85 backdrop-blur-md rounded-[18px] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] border border-slate-200/60 items-center gap-3.5 z-20"
          >
            <div className="w-9 h-9 rounded-[12px] bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">New Alert</span>
              <p className="text-[12px] font-bold text-slate-800 mt-0.5">
                Certificate <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">Expires in 5 days</span>
              </p>
            </div>
          </motion.div>

          {/* Floating Card — BOTTOM LEFT · Live Safety Score (medium elevation, quiet) */}
          <motion.div
            initial={{ opacity: 0, x: -16, scale: 0.94 }}
            animate={{ opacity: 0.88, x: 0, scale: 1, y: [-8, 6, -8] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.6 },
              x: { duration: 0.6, delay: 0.6 },
              scale: { duration: 0.6, delay: 0.6 },
              y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ opacity: 1 }}
            style={{ padding: "14px 18px" }}
            className="hidden xl:flex absolute -bottom-10 -left-40 xl:-left-48 bg-white/85 backdrop-blur-md rounded-[18px] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] border border-slate-200/60 items-center gap-3.5 z-20"
          >
            <div className="w-9 h-9 rounded-[12px] bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-800">Live Safety Score</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">98.4% Verified Dining Protection</p>
            </div>
          </motion.div>

          {/* Floating Card — BOTTOM RIGHT · Inspection Complete (medium elevation, quiet) */}
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.94 }}
            animate={{ opacity: 0.88, x: 0, scale: 1, y: [6, -8, 6] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.7 },
              x: { duration: 0.6, delay: 0.7 },
              scale: { duration: 0.6, delay: 0.7 },
              y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ opacity: 1 }}
            style={{ padding: "14px 18px" }}
            className="hidden xl:flex absolute -bottom-10 -right-40 xl:-right-48 bg-white/85 backdrop-blur-md rounded-[18px] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] border border-slate-200/60 items-center gap-3.5 z-20"
          >
            <div className="w-9 h-9 rounded-[12px] bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">Inspection Complete</span>
              <p className="text-[12px] font-bold text-slate-800 mt-0.5">
                La Crest <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full ml-1">Passed Today</span>
              </p>
            </div>
          </motion.div>

          {/* Mobile header logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Safe<span className="text-emerald-600">Bite</span>
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
