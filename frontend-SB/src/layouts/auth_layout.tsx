import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  ShieldCheck, Sparkles, TrendingUp, Building2, MapPin,
  ClipboardCheck, Bell, CheckCircle2, Utensils, FileText,
  BarChart3, Shield, Award, AlertTriangle, Smartphone
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
      {/* Left Branding Panel — Rich Dark Emerald Gradient */}
      <div className="hidden lg:flex w-[520px] xl:w-[580px] shrink-0 flex-col justify-between p-12 xl:p-14 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #022c22 0%, #064e3b 45%, #0f172a 100%)" }}
      >
        {/* Background glowing animated ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Header logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group text-decoration-none">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg shadow-emerald-500/20"
            >
              <ShieldCheck size={20} className="text-emerald-300" />
            </motion.div>
            <span className="text-2xl font-black tracking-tight text-white">
              Safe<span className="text-emerald-400">Bite</span>
            </span>
          </Link>
        </div>

        {/* Content body */}
        <div className="relative z-10 space-y-10 my-auto py-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-400/15 text-emerald-300 text-xs font-semibold rounded-full mb-4 border border-emerald-400/20 backdrop-blur-sm shadow-xs"
            >
              <Sparkles size={13} className="text-emerald-400 animate-pulse" />
              <span>SafeBite Mission</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl xl:text-4xl font-black leading-snug tracking-tight text-white mb-4"
            >
              Every Safe Meal Starts Here
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm xl:text-base text-emerald-100/90 leading-relaxed font-semibold max-w-md mb-3"
            >
              At SafeBite, we believe everyone deserves to dine with confidence.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm xl:text-base text-emerald-100/75 leading-8 font-normal max-w-md mb-8"
            >
              Every restaurant score, inspection report, and verified badge helps you make safer choices with complete peace of mind.
            </motion.p>
          </div>

          {/* Feature Rows with Line Spacing */}
          <div className="space-y-7 my-10">
            {[
              {
                icon: ShieldCheck,
                title: "Verified Restaurants",
                desc: "Backed by official inspection data and verified safety ratings.",
                color: "text-emerald-400",
              },
              {
                icon: BarChart3,
                title: "AI Safety Scores",
                desc: "Real-time hygiene analytics & instant rating insights.",
                color: "text-blue-400",
              },
              {
                icon: AlertTriangle,
                title: "Report & Protect",
                desc: "Report food safety concerns directly to protect your community.",
                color: "text-amber-400",
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + idx * 0.1 }}
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 py-3 text-white cursor-default group"
              >
                <div className="mt-0.5 shrink-0">
                  <feature.icon size={20} className={`${feature.color} transition-transform group-hover:scale-110`} />
                </div>
                <div>
                  <h4 className="text-base font-bold mb-1 text-white tracking-wide">{feature.title}</h4>
                  <p className="text-xs text-emerald-100/75 mt-0.5 leading-relaxed font-normal">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Row in a Clean Single Line (Original Border Styling & No Text Clipping) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-8 mt-10 border-t border-white/10 px-2"
          >
            {[
              { value: "5,000+", label: "Restaurants" },
              { value: "98%", label: "Safety Rate" },
              { value: "50+", label: "Cities" },
            ].map((s) => (
              <div key={s.label} className="text-center min-w-0">
                <p className="text-xl xl:text-2xl font-black text-white tracking-tight whitespace-nowrap">
                  <AnimatedCounter value={s.value} />
                </p>
                <p className="text-xs text-emerald-200/80 font-medium mt-0.5 whitespace-nowrap">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer info */}
        <p className="relative z-10 text-xs text-emerald-200/60 font-medium pt-2">
          © SafeBite. All rights reserved.
        </p>
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

        {/* Top Half Subtle Watermark Illustration (7% opacity) */}
        <div className="absolute top-10 right-16 pointer-events-none opacity-[0.07] text-emerald-900">
          <Shield size={280} strokeWidth={1} />
        </div>
        <div className="absolute bottom-10 left-16 pointer-events-none opacity-[0.06] text-emerald-800">
          <Utensils size={240} strokeWidth={1} />
        </div>

        {/* Scattered Floating Semi-Transparent Icons */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [-6, 6, -6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-16 left-20 text-emerald-600/25 pointer-events-none"
        >
          <Shield size={36} />
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10], rotate: [6, -6, 6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-28 right-24 text-emerald-600/20 pointer-events-none"
        >
          <Utensils size={32} />
        </motion.div>

        <motion.div
          animate={{ y: [-8, 12, -8], rotate: [-4, 8, -4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-28 left-28 text-emerald-600/25 pointer-events-none"
        >
          <CheckCircle2 size={34} />
        </motion.div>

        <motion.div
          animate={{ y: [12, -8, 12], rotate: [8, -4, 8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-20 right-32 text-emerald-600/20 pointer-events-none"
        >
          <FileText size={32} />
        </motion.div>

        <motion.div
          animate={{ y: [-12, 10, -12], scale: [1, 1.1, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-1/3 left-12 text-emerald-600/15 pointer-events-none"
        >
          <BarChart3 size={38} />
        </motion.div>

        <motion.div
          animate={{ y: [10, -12, 10], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-1/3 right-12 text-emerald-600/20 pointer-events-none"
        >
          <Bell size={34} />
        </motion.div>

        {/* Main Center Card Wrapper with 3 Floating Status Cards */}
        <div className="w-full max-w-[500px] relative z-10">
          {/* Floating Card 1: 🟢 Safety Score 96/100 Excellent (Clean Floating Left) */}
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -4, scale: 1.05 }}
            className="hidden xl:flex absolute top-6 -left-36 xl:-left-44 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 px-4 shadow-xl border border-emerald-100/90 items-center gap-3.5 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Safety Score</span>
              </div>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                96/100 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-1">Excellent</span>
              </p>
            </div>
          </motion.div>

          {/* Floating Card 2: 📋 Inspection Complete La Crest Passed Today (Clean Floating Right) */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ y: -4, scale: 1.05 }}
            className="hidden xl:flex absolute bottom-8 -right-36 xl:-right-44 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 px-4 shadow-xl border border-blue-100/90 items-center gap-3.5 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inspection Complete</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                La Crest <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-1">Passed Today</span>
              </p>
            </div>
          </motion.div>

          {/* Floating Card 3: 🔔 New Alert Certificate expires in 5 days (Clean Floating Top Right) */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ y: -4, scale: 1.05 }}
            className="hidden xl:flex absolute -top-8 -right-28 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 px-4 shadow-xl border border-amber-100/90 items-center gap-3.5 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Bell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">New Alert</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                Certificate <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1">Expires in 5 days</span>
              </p>
            </div>
          </motion.div>

          {/* Soft Illustration Badge near bottom right */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute -bottom-16 left-6 xl:left-12 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 px-4 shadow-xl border border-emerald-100/80 items-center gap-3.5 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Live Safety Score</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">98.4% Verified Dining Protection</p>
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
