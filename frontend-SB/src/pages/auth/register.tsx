import { useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { register as registerApi } from "@/services/auth_service";
import Card from "@/components/ui/card";
import AuthLayout from "@/layouts/auth_layout";
import { getErrorMessage } from "@/lib/utils";

const roles = [
  { value: "customer", label: "Customer", desc: "Find safe restaurants" },
  { value: "owner", label: "Restaurant Owner", desc: "Manage your restaurant" },
  { value: "inspector", label: "Inspector", desc: "Conduct inspections" },
];

/* Shared field styling — matches the login page input treatment */
const fieldIconStyle: CSSProperties = {
  position: "absolute",
  left: 18,
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
  zIndex: 10,
};

const fieldClass = (hasError: boolean) => `
  w-full h-[52px] rounded-[16px] border bg-slate-50/60 font-medium text-slate-900
  placeholder:text-slate-400/70 placeholder:font-normal outline-none transition-all duration-200
  hover:bg-white hover:border-slate-300
  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
  ${hasError ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"}
`;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone_number: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number with country code"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  role: z.string().min(1, "Please select a role"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "customer" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const { confirmPassword: _confirmPassword, ...submitData } = data;
      await registerApi(submitData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md text-center" padding="lg">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Registration Successful!</h2>
          <p className="text-slate-500 mt-2">Redirecting to login...</p>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "min(560px, calc(100vw - 48px))", marginLeft: "auto", marginRight: "auto", paddingTop: 36, paddingBottom: 36, paddingLeft: 56, paddingRight: 56 }}
        className="bg-white rounded-[24px] shadow-[0_24px_70px_-20px_rgba(15,23,42,0.22)] border border-slate-200/70 backdrop-blur-xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ lineHeight: 1.1 }}
            className="text-[30px] sm:text-[34px] font-extrabold text-slate-900 tracking-[-0.02em]"
          >
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ marginTop: 10 }}
            className="text-[15px] text-slate-400 font-normal"
          >
            Join SafeBite today
          </motion.p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginTop: 24 }}
            className="bg-red-50/90 border border-red-200 text-red-700 text-sm font-medium rounded-2xl p-4 flex items-center gap-2.5"
          >
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 24 }}>
          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2.5">
            {roles.map((role) => (
              <label
                key={role.value}
                style={{ padding: "12px 8px" }}
                className={`
                  flex flex-col items-center rounded-[14px] border cursor-pointer transition-all duration-200 text-center
                  ${selectedRole === role.value
                    ? "border-emerald-500 bg-emerald-50/70 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                  }
                `}
              >
                <input type="radio" value={role.value} className="sr-only" {...register("role")} />
                <span className="text-[12px] font-bold text-slate-800 leading-tight">{role.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-tight">{role.desc}</span>
              </label>
            ))}
          </div>
          {errors.role && <p className="text-xs text-red-500 font-medium mt-2">{errors.role.message}</p>}

          {/* Full Name */}
          <div style={{ marginTop: 18 }}>
            <label style={{ marginBottom: 6 }} className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
              Full Name
            </label>
            <div className="relative">
              <div style={fieldIconStyle} className="text-slate-400">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="John Doe"
                style={{ paddingLeft: 52, paddingRight: 18, fontSize: "15px" }}
                className={fieldClass(!!errors.name)}
                {...register("name")}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 font-medium mt-2">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div style={{ marginTop: 18 }}>
            <label style={{ marginBottom: 6 }} className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
              Email
            </label>
            <div className="relative">
              <div style={fieldIconStyle} className="text-slate-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                style={{ paddingLeft: 52, paddingRight: 18, fontSize: "15px" }}
                className={fieldClass(!!errors.email)}
                {...register("email")}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-medium mt-2">{errors.email.message}</p>}
          </div>

          {/* Phone Number */}
          <div style={{ marginTop: 18 }}>
            <label style={{ marginBottom: 6 }} className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
              Phone Number
            </label>
            <div className="relative">
              <div style={fieldIconStyle} className="text-slate-400">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                style={{ paddingLeft: 52, paddingRight: 18, fontSize: "15px" }}
                className={fieldClass(!!errors.phone_number)}
                {...register("phone_number")}
              />
            </div>
            {errors.phone_number && <p className="text-xs text-red-500 font-medium mt-2">{errors.phone_number.message}</p>}
          </div>

          {/* Password */}
          <div style={{ marginTop: 18 }}>
            <label style={{ marginBottom: 6 }} className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
              Password
            </label>
            <div className="relative">
              <div style={fieldIconStyle} className="text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                style={{ paddingLeft: 52, paddingRight: 52, fontSize: "15px" }}
                className={fieldClass(!!errors.password)}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", zIndex: 10 }}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200 flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium mt-2">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginTop: 18 }}>
            <label style={{ marginBottom: 6 }} className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
              Confirm Password
            </label>
            <div className="relative">
              <div style={fieldIconStyle} className="text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                style={{ paddingLeft: 52, paddingRight: 18, fontSize: "15px" }}
                className={fieldClass(!!errors.confirmPassword)}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 font-medium mt-2">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{ marginTop: 28 }}
            className="w-full h-[52px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[15px] rounded-[16px] transition-[background-color,box-shadow] duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p style={{ marginTop: 20 }} className="text-center text-[14px] font-medium">
          <span className="text-slate-400">Already have an account?</span>{" "}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
