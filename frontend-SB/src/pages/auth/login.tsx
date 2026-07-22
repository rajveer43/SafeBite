import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { login as loginApi } from "@/services/auth_service";
import { useAuth } from "@/contexts/auth_context";
import { getRoleFromToken } from "@/utils/role";
import { getErrorMessage } from "@/lib/utils";
import AuthLayout from "@/layouts/auth_layout";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const response = await loginApi(data);
      authLogin(response.access_token);
      const role = getRoleFromToken();
      switch (role) {
        case "admin": navigate("/admin"); break;
        case "owner": navigate("/owner"); break;
        case "customer": navigate("/customer"); break;
        case "inspector": navigate("/inspector"); break;
        default: setError("Unknown user role.");
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white rounded-3xl p-9 sm:p-11 pb-10 shadow-2xl shadow-slate-900/10 border border-slate-200/80 backdrop-blur-xl relative overflow-hidden"
      >
        {/* Top Icon & Welcome Header */}
        <div className="text-center mb-9">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100/90 shadow-md mx-auto mb-5"
          >
            <ShieldCheck size={32} className="text-emerald-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
          >
            Welcome back..
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base text-slate-500 mt-2.5 font-medium"
          >
            Log in to your SafeBite account to continue
          </motion.p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50/90 border border-red-200 text-red-700 text-sm font-medium rounded-2xl p-4 mb-6 flex items-center gap-2.5"
          >
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
                className="text-slate-400"
              >
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="you@gmail.com"
                style={{ paddingLeft: 52, fontSize: "15px" }}
                className={`
                  w-full h-14 rounded-2xl border bg-slate-50/70 pr-4 font-medium text-slate-900
                  placeholder:text-slate-400 outline-none transition-all duration-200
                  hover:bg-white hover:border-slate-300
                  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                  ${errors.email ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"}
                `}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
                className="text-slate-400"
              >
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                style={{ paddingLeft: 52, paddingRight: 52, fontSize: "15px" }}
                className={`
                  w-full h-14 rounded-2xl border bg-slate-50/70 font-medium text-slate-900
                  placeholder:text-slate-400 outline-none transition-all duration-200
                  hover:bg-white hover:border-slate-300
                  focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                  ${errors.password ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"}
                `}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 18,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "auto",
                  zIndex: 10,
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200 flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Login <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-500 mt-9 mb-1 font-medium">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 transition-colors">
            Create one
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
