import { Link } from "react-router-dom";
import { motion, type Variants } from "motion/react";
import {
  Shield, ShieldCheck, Brain, MessageSquareWarning, FileCheck,
  Search, Bell, BadgeCheck, ArrowRight, Star,
  Menu, X, MapPin, Utensils, Users, TrendingUp,
  ChevronRight, Heart, Zap, Check, Quote,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

/* ─── Animated Counter Component ─── */
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
    const duration = 1600; // 1.6 seconds total animation duration
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

/* ─── Animation variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Data ─── */
const features = [
  { icon: Brain, title: "AI Safety Scores", description: "Machine learning algorithms analyze restaurant hygiene data and generate real-time safety scores." },
  { icon: MessageSquareWarning, title: "Complaint Management", description: "Streamlined complaint filing and tracking that ensures every food safety concern is addressed promptly." },
  { icon: FileCheck, title: "Certificate Tracking", description: "Automated tracking of food safety certificates and licenses so you never miss an expiration date." },
  { icon: Search, title: "Real-time Inspections", description: "Live inspection updates and detailed reports give you complete visibility into restaurant compliance." },
  { icon: Bell, title: "Smart Notifications", description: "Intelligent alerts about safety rating changes, new complaints, and important regulatory updates." },
  { icon: BadgeCheck, title: "Verified Restaurants", description: "Only restaurants that meet our strict safety criteria earn the SafeBite Verified badge." },
];

const steps = [
  { number: "01", title: "Sign Up", icon: Zap, description: "Create your account in seconds. Whether you're a customer, restaurant owner, or health inspector — SafeBite is built for you." },
  { number: "02", title: "Get Insights", icon: TrendingUp, description: "Access real-time safety scores, inspection reports, and AI-powered analytics for any restaurant in your area." },
  { number: "03", title: "Stay Safe", icon: Heart, description: "Make informed dining decisions, track food safety compliance, and help build a safer food ecosystem for everyone." },
];

const stats = [
  { value: "5,000+", label: "Restaurants", icon: Utensils, color: "text-emerald-400" },
  { value: "10,000+", label: "Users", icon: Users, color: "text-blue-400" },
  { value: "98%", label: "Safety Rate", icon: ShieldCheck, color: "text-amber-400" },
  { value: "50+", label: "Cities", icon: MapPin, color: "text-purple-400" },
];

const testimonials = [
  { name: "Sarah Mitchell", role: "Food Blogger", rating: 5, text: "SafeBite completely changed how I choose restaurants. The AI safety scores give me confidence that I'm recommending clean, safe places to my audience.", avatar: "SM", color: "bg-emerald-500" },
  { name: "David Chen", role: "Restaurant Owner", rating: 5, text: "The certificate tracking and inspection reports helped me maintain a perfect safety record. My customers trust me more because of my SafeBite Verified badge.", avatar: "DC", color: "bg-blue-500" },
  { name: "Dr. Priya Sharma", role: "Health Inspector", rating: 5, text: "SafeBite makes my job so much easier. Real-time data, smart notifications, and streamlined complaint management — it's a game changer for public health.", avatar: "PS", color: "bg-purple-500" },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
];

/* ─── Section Header ─── */
function SectionHeader({ tag, title, highlight, subtitle }: {
  tag: string; title: string; highlight: string; subtitle: string;
}) {
  return (
    <div className="mx-auto mb-10 flex w-full max-w-3xl flex-col items-center justify-center text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 text-emerald-700 text-xs font-semibold rounded-full mb-4 border border-emerald-500/20 shadow-xs">
        <Zap size={12} className="text-emerald-600 animate-pulse" />
        <span>{tag}</span>
      </div>
      <h2 className="w-full text-center text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight text-slate-900 tracking-tight">
        {title} <span className="text-emerald-600">{highlight}</span>
      </h2>
      <p className="mx-auto mt-3.5 max-w-xl text-center text-base sm:text-lg text-slate-500 leading-relaxed font-normal">{subtitle}</p>
    </div>
  );
}

/* ─── Main Component ─── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white w-full flex flex-col items-center relative" style={{ overflowX: "hidden", minHeight: "100vh" }}>
      {/* Full-Page Continuous Grid Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.35,
          zIndex: 0,
        }}
      />

      {/* Full-Page Ambient Soft Green Radial Glow Mesh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 120% 80% at 50% 15%, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.04) 55%, transparent 85%), radial-gradient(ellipse 120% 80% at 50% 65%, rgba(16, 185, 129, 0.09) 0%, transparent 80%)",
          zIndex: 0,
        }}
      />

      {/* ────────────────────────────────────────────
          NAVBAR
      ──────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(226,232,240,0.9)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: "#059669", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={16} color="white" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Safe<span style={{ color: "#059669" }}>Bite</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ gap: 36 }}>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}
                className="hover:text-emerald-600 transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 8 }}>
            <Link to="/login" style={{ padding: "8px 18px", fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}>
              Log In
            </Link>
            <Link to="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 20px", fontSize: 14, fontWeight: 600,
              color: "white", background: "#059669", borderRadius: 10,
              textDecoration: "none", boxShadow: "0 1px 4px rgba(5,150,105,0.3)",
            }}>
              Get Started <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#475569" }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div style={{
            borderTop: "1px solid #e2e8f0", background: "white",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: "12px 24px 16px",
          }}>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: "block", padding: "12px", fontSize: 14, fontWeight: 500, color: "#334155", textDecoration: "none", borderRadius: 10 }}
                className="hover:bg-emerald-50 hover:text-emerald-600">
                {link.label}
              </a>
            ))}
            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 8, paddingTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                style={{ padding: "12px", fontSize: 14, fontWeight: 500, color: "#334155", textDecoration: "none", textAlign: "center", borderRadius: 10 }}>
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}
                style={{ padding: "12px", fontSize: 14, fontWeight: 600, color: "white", background: "#059669", textDecoration: "none", textAlign: "center", borderRadius: 10 }}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ────────────────────────────────────────────
          HERO — fully centered, single column
      ──────────────────────────────────────────── */}
      <section style={{
        width: "100%",
        background: "transparent",
        paddingTop: 148,
        paddingBottom: 24,
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
      }}>

        {/* Floating Semi-Transparent Animated Icons */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [-6, 6, -6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: 120, left: "8%", color: "rgba(5,150,105,0.18)", pointerEvents: "none" }}
          className="hidden md:block"
        >
          <Shield size={44} />
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10], rotate: [6, -6, 6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: 160, right: "8%", color: "rgba(5,150,105,0.15)", pointerEvents: "none" }}
          className="hidden md:block"
        >
          <Utensils size={40} />
        </motion.div>

        <motion.div
          animate={{ y: [-8, 12, -8], rotate: [-4, 8, -4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: 120, left: "10%", color: "rgba(5,150,105,0.18)", pointerEvents: "none" }}
          className="hidden md:block"
        >
          <BadgeCheck size={38} />
        </motion.div>

        <motion.div
          animate={{ y: [12, -8, 12], rotate: [8, -4, 8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: 80, right: "10%", color: "rgba(5,150,105,0.15)", pointerEvents: "none" }}
          className="hidden md:block"
        >
          <Brain size={38} />
        </motion.div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 32px", position: "relative", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 999, marginBottom: 28 }}>
              <Zap size={12} color="#059669" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>AI-Powered Food Safety Platform</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 24px" }}>
              Making Food{" "}
              <span style={{ color: "#059669" }}>Safer For You</span>
            </h1>

            {/* Subheadline */}
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#64748b", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 40px" }}>
              Empowering consumers, restaurants, and health inspectors with AI-driven safety scores, real-time inspections, and smart compliance tracking.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", alignItems: "center", marginBottom: 40 }}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/register" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 28px", background: "#059669", color: "white",
                  fontWeight: 600, fontSize: 15, borderRadius: 12,
                  textDecoration: "none", boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
                }}>
                  Get Started Free <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/customer/restaurants" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 28px", background: "white", color: "#334155",
                  fontWeight: 600, fontSize: 15, borderRadius: 12,
                  textDecoration: "none", border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                  View Restaurants <ChevronRight size={16} />
                </Link>
              </motion.div>
            </div>

            {/* Trust row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center" }}>
              {["No credit card", "Free to start", "Trusted by 10,000+ users"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8" }}>
                  <Check size={13} color="#10b981" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dashboard mockup — centered below text */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: 64, position: "relative" }}
          >
            <div style={{
              background: "white", borderRadius: 24, border: "1px solid #e2e8f0",
              boxShadow: "0 24px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)",
              overflow: "hidden", maxWidth: 700, margin: "0 auto",
            }}>
              {/* Header bar */}
              <div style={{ background: "linear-gradient(90deg, #059669, #10b981)", padding: "16px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShieldCheck size={18} color="white" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0 }}>Safety Dashboard</p>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>Real-time monitoring</p>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.35)", display: "block" }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.35)", display: "block" }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "block" }} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #f1f5f9" }}>
                {[
                  { label: "Safety Grade", value: "A+", color: "#059669" },
                  { label: "Compliance", value: "98%", color: "#2563eb" },
                  { label: "Monitoring", value: "24/7", color: "#0f172a" },
                ].map((s, i) => (
                  <div key={s.label} style={{ padding: "16px 12px", textAlign: "center", borderRight: i < 2 ? "1px solid #f1f5f9" : "none" }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: "0 0 4px" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Restaurant list */}
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Recent Inspections</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { name: "The Green Kitchen", score: 95, status: "Verified", bg: "#d1fae5", color: "#065f46" },
                    { name: "Harbor Bay Bistro", score: 82, status: "Good", bg: "#dbeafe", color: "#1e40af" },
                    { name: "Spice Garden", score: 71, status: "Fair", bg: "#fef3c7", color: "#92400e" },
                  ].map((r) => (
                    <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#f8fafc", borderRadius: 12 }}>
                      <div style={{ width: 32, height: 32, background: "rgba(5,150,105,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Utensils size={13} color="#059669" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>Score: {r.score}/100</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: r.bg, color: r.color, flexShrink: 0 }}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge top-right */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", top: -16, right: "10%",
                background: "white", borderRadius: 14, padding: "10px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <div style={{ width: 32, height: 32, background: "rgba(5,150,105,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={14} color="#059669" />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>+23%</p>
                <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>Safety Score</p>
              </div>
            </motion.div>

            {/* Floating badge bottom-left */}
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", bottom: -16, left: "10%",
                background: "white", borderRadius: 14, padding: "10px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <div style={{ width: 32, height: 32, background: "rgba(37,99,235,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BadgeCheck size={14} color="#2563eb" />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>Verified</p>
                <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>Restaurant</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          FEATURES
      ──────────────────────────────────────────── */}
      <section id="features" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "40px 0 20px", background: "transparent", textAlign: "center", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "0 24px", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} custom={0}>
            <SectionHeader
              tag="Features"
              title="Everything you need for"
              highlight="food safety"
              subtitle="From AI-powered safety scoring to real-time inspection tracking, SafeBite provides a complete ecosystem for food safety management."
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 1}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="group flex h-full w-full max-w-sm flex-col items-center text-center rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-8 shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-600 transition-colors duration-300 group-hover:scale-110">
                  <feature.icon size={26} className="text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5 text-center">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          HOW IT WORKS
      ──────────────────────────────────────────── */}
      <section id="how-it-works" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "40px 0 60px", background: "transparent", textAlign: "center", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "0 24px", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} custom={0}>
            <SectionHeader
              tag="How It Works"
              title="Start in"
              highlight="3 simple steps"
              subtitle="Getting started with SafeBite takes less than a minute. No complex setup, no lengthy onboarding."
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="mx-auto grid gap-6 md:grid-cols-3 w-full justify-items-center"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                custom={i + 1}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 flex flex-col items-center text-center w-full max-w-sm"
              >
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
                    <step.icon size={26} className="text-white" />
                  </div>
                  <motion.span
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-3 -right-3 text-3xl font-black text-slate-900 select-none leading-none tracking-tighter"
                  >
                    {step.number}
                  </motion.span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2.5 text-center">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed text-center">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          STATS — Balanced Dark Emerald Banner Centered
      ──────────────────────────────────────────── */}
      <section id="statistics" className="w-full flex flex-col items-center py-10 bg-transparent relative z-10">
        <div className="w-full max-w-5xl mx-auto px-6 flex flex-col items-center relative">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp} custom={0}
            className="w-full relative overflow-hidden rounded-3xl py-16 px-6 sm:py-20 sm:px-12 text-center shadow-xl flex flex-col items-center justify-center border border-emerald-900/30"
            style={{
              background: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)",
              boxShadow: "0 16px 40px rgba(6, 78, 59, 0.3)",
            }}
          >
            {/* Animated background glow orbs */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
            />

            <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-400/15 text-emerald-300 text-xs font-semibold rounded-full mb-4 border border-emerald-400/20 backdrop-blur-sm shadow-xs">
                <Zap size={12} className="text-emerald-400 animate-pulse" />
                <span>Statistics</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Trusted by thousands <span className="text-emerald-300">across the country</span>
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/90 mb-10 max-w-lg mx-auto leading-relaxed">
                Our growing network of restaurants, consumers, and health inspectors is making food safer every day.
              </p>

              <motion.div
                variants={stagger} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 w-full justify-items-center"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label} variants={fadeUp} custom={i + 1}
                    whileHover={{ y: -4, scale: 1.03 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="rounded-2xl p-6 text-center w-full max-w-xs border border-white/15 backdrop-blur-md shadow-md transition-all duration-300 flex flex-col items-center justify-center"
                    style={{ background: "rgba(255, 255, 255, 0.08)" }}
                  >
                    <stat.icon size={26} className={cn("mx-auto mb-3", stat.color)} />
                    <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1 tracking-tight">
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="text-[11px] sm:text-xs text-emerald-200/90 font-semibold uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          TESTIMONIALS
      ──────────────────────────────────────────── */}
      <section id="testimonials" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "40px 0 20px", background: "transparent", textAlign: "center", zIndex: 1 }}>
        <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "0 24px", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} custom={0}>
            <SectionHeader
              tag="Testimonials"
              title="Loved by"
              highlight="everyone"
              subtitle="See what our community has to say about how SafeBite is transforming food safety."
            />
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full justify-items-center"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name} variants={fadeUp} custom={i + 1}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex h-full w-full max-w-sm flex-col items-center text-center rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-8 shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300"
              >
                <Quote size={26} className="text-emerald-500/40 mb-3.5" />
                <div className="flex gap-1 mb-4 justify-center">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5 text-center">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto w-full justify-center">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs", t.color)}>
                    <span className="text-xs font-bold text-white">{t.avatar}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          CTA BANNER — Balanced Dark Emerald Banner with 1-Square (40px) Footer Gap
      ──────────────────────────────────────────── */}
      <section id="cta" style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        background: "transparent",
        paddingTop: 40,
        paddingBottom: 40,
        zIndex: 1,
      }}>

        <div className="w-full max-w-5xl mx-auto px-6 flex flex-col items-center relative">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp} custom={0}
            className="w-full relative overflow-hidden rounded-3xl text-center shadow-xl flex flex-col items-center justify-center border border-emerald-900/30"
            style={{
              padding: "48px 32px",
              background: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)",
              boxShadow: "0 16px 40px rgba(6, 78, 59, 0.35)",
            }}
          >
            {/* Animated background glow orbs */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
            />

            <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-400/15 text-emerald-300 text-xs font-semibold rounded-full mb-4 border border-emerald-400/20 backdrop-blur-sm shadow-xs">
                <Zap size={12} className="text-emerald-400 animate-pulse" />
                <span>Get Started</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Ready to make food <span className="text-emerald-300">safer?</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mb-7 leading-relaxed max-w-md mx-auto">
                Join thousands of consumers, restaurants, and health inspectors who trust SafeBite to keep every meal safe.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-500/30 text-decoration-none">
                    Get Started Free <ArrowRight size={16} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link to="/customer/restaurants"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all backdrop-blur-sm text-decoration-none">
                    Explore Restaurants <ChevronRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          FOOTER — Sleek Theme Matching Alignment & High Contrast
      ──────────────────────────────────────────── */}
      <footer style={{ width: "100%", background: "#051310", borderTop: "1px solid rgba(5, 150, 105, 0.2)", color: "#cbd5e1", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "64px 24px 48px" }}>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5 mb-14">
            <div className="lg:col-span-2 max-w-sm text-left">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-5 text-decoration-none">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Safe<span className="text-emerald-400">Bite</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-300 mb-6">
                AI-powered food safety platform protecting consumers, empowering restaurants, and supporting health inspectors nationwide.
              </p>
              <div className="flex gap-2.5">
                {["T", "L", "G"].map((s, i) => (
                  <a key={i} href="#"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-decoration-none"
                    style={{ background: "rgba(255, 255, 255, 0.08)", color: "#e2e8f0" }}
                    aria-label={["Twitter", "LinkedIn", "GitHub"][i]}>
                    <span className="text-xs font-semibold">{s}</span>
                  </a>
                ))}
              </div>
            </div>

            {[
              { heading: "Product", links: [{ label: "Features", href: "#features" }, { label: "How It Works", href: "#how-it-works" }, { label: "Restaurants", href: "/customer/restaurants" }, { label: "Testimonials", href: "#testimonials" }] },
              { heading: "Company", links: [{ label: "About Us", href: "#" }, { label: "Careers", href: "#" }, { label: "Blog", href: "#" }, { label: "Press", href: "#" }] },
              { heading: "Legal", links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }, { label: "Cookie Policy", href: "#" }, { label: "Contact Us", href: "#" }] },
            ].map((col) => (
              <div key={col.heading} className="text-left">
                <h4 className="text-emerald-300 font-bold uppercase text-xs tracking-wider mb-4">{col.heading}</h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link to={l.href} className="text-slate-300 hover:text-emerald-400 transition-colors text-decoration-none">{l.label}</Link>
                      ) : (
                        <a href={l.href} className="text-slate-300 hover:text-emerald-400 transition-colors text-decoration-none">{l.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} SafeBite. All rights reserved.</p>
            <p>Made with ♥ for food safety</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
