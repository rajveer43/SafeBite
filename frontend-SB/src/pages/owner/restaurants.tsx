import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import StatusBadge from "@/components/common/status-badge";
import SafetyScoreBadge from "@/components/common/safety-score";
import Dialog, { DialogFooter } from "@/components/ui/dialog";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/common/toast";
import {
  getOwnerRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "@/services/restaurant_service";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  X,
  Loader2,
  MapPinned,
  Building2,
  Search,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  FileWarning,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Restaurant } from "@/types";

const restaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "Phone number must contain at least 10 digits"
    ),
  latitude: z.union([z.number().min(-90).max(90), z.nan()]).optional(),
  longitude: z.union([z.number().min(-180).max(180), z.nan()]).optional(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/* Shared design tokens (matches customer/owner dashboard) */
const CARD_BORDER = "1px solid rgba(15,23,42,0.08)";
const SHADOW_REST = "0 2px 8px rgba(15,23,42,0.05)";
const SHADOW_HOVER = "0 8px 24px rgba(15,23,42,0.08)";

const FIELD_STYLE: React.CSSProperties = {
  width: "100%", borderRadius: 12, border: CARD_BORDER, fontSize: 15, color: "#0f172a", background: "#fff",
};
const FIELD_CLASS = "outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 8,
};
const ERROR_STYLE: React.CSSProperties = { fontSize: 12, color: "#dc2626", fontWeight: 500, marginTop: 6 };

export default function OwnerRestaurants() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOwnerRestaurants();
      setRestaurants(Array.isArray(res) ? res : res.data ?? []);
    } catch {
      toast("Failed to load restaurants", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const openCreateDialog = useCallback(() => {
    setEditingRestaurant(null);
    reset({
      name: "",
      address: "",
      phone: "",
      latitude: undefined,
      longitude: undefined,
    });
    setDialogOpen(true);
  }, [reset]);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      openCreateDialog();
      setSearchParams((params) => {
        params.delete("add");
        return params;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams, openCreateDialog]);

  function openEditDialog(restaurant: Restaurant, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingRestaurant(restaurant);
    reset({
      name: restaurant.name,
      address: restaurant.address || "",
      phone: (restaurant as Record<string, any>).contact_number || (restaurant as Record<string, any>).phone || "",
      latitude: restaurant.latitude ?? undefined,
      longitude: restaurant.longitude ?? undefined,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: RestaurantFormData) {
    try {
      setSubmitting(true);
      const payload = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        contact_number: data.phone,
        latitude: typeof data.latitude === "number" && !isNaN(data.latitude) ? data.latitude : 0,
        longitude: typeof data.longitude === "number" && !isNaN(data.longitude) ? data.longitude : 0,
      };
      if (editingRestaurant) {
        await updateRestaurant(editingRestaurant.id, payload);
        toast("Restaurant updated successfully", "success");
      } else {
        await createRestaurant(payload);
        toast("Restaurant created successfully", "success");
      }
      setDialogOpen(false);
      fetchRestaurants();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d: any) => `${d.loc ? d.loc.join(".") + ": " : ""}${d.msg || d}`).join("; ")
          : (editingRestaurant
              ? "Failed to update restaurant"
              : "Failed to create restaurant");
      toast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string | number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this restaurant?")) return;
    try {
      setDeletingId(id);
      await deleteRestaurant(id);
      toast("Restaurant deleted", "success");
      fetchRestaurants();
    } catch {
      toast("Failed to delete restaurant", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = restaurants.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="My Restaurants">
      <div className="flex flex-col" style={{ gap: 24 }}>

        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              My Managed Establishments
            </h1>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
              Register, inspect, and update your business locations.
            </p>
          </div>
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shrink-0"
            style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
          >
            <Plus size={17} strokeWidth={2.5} />
            Add Restaurant
          </button>
        </motion.div>

        {/* Search + count */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="flex flex-col sm:flex-row sm:items-center" style={{ gap: 12 }}
        >
          <div className="relative w-full sm:max-w-md">
            <Search size={17} className="absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ left: 16 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search establishments by name or location..."
              className={`bg-white ${FIELD_CLASS}`}
              style={{ ...FIELD_STYLE, height: 44, paddingLeft: 44, paddingRight: 16 }}
            />
          </div>
          <span
            className="inline-flex items-center self-start sm:self-auto"
            style={{ gap: 6, height: 32, padding: "0 12px", borderRadius: 10, background: "#f1f5f9", fontSize: 13, fontWeight: 600, color: "#475569" }}
          >
            <Building2 size={14} className="text-slate-500" />
            {filtered.length} Location{filtered.length === 1 ? "" : "s"}
          </span>
        </motion.div>

        {/* Cards / empty */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="w-full bg-white" style={{ borderRadius: 18, border: CARD_BORDER, boxShadow: SHADOW_REST }}>
            <div
              className="flex flex-col items-center justify-center text-center mx-auto"
              style={{ minHeight: 280, maxWidth: 460, gap: 16, padding: "40px 24px" }}
            >
              <div className="flex items-center justify-center shrink-0" style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.10)", color: "#10b981" }}>
                <Store size={26} />
              </div>
              <div style={{ maxWidth: 380 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
                  {search ? "No restaurants found" : "No restaurants added yet"}
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginTop: 8 }}>
                  {search
                    ? "Try adjusting your search query to find your establishment."
                    : "Register your first restaurant establishment to start monitoring compliance."}
                </p>
              </div>
              {!search && (
                <button
                  onClick={openCreateDialog}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer"
                  style={{ height: 44, padding: "0 20px", borderRadius: 12, marginTop: 4, boxShadow: SHADOW_REST }}
                >
                  <Plus size={16} />
                  Add Your First Restaurant
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filtered.map((restaurant, idx) => (
                <motion.div
                  key={restaurant.id}
                  variants={fadeUp}
                  custom={idx}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  className="group bg-white transition-shadow duration-200 cursor-pointer flex flex-col h-full"
                  style={{ borderRadius: 18, padding: 20, border: CARD_BORDER, boxShadow: SHADOW_REST }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW_REST; }}
                >
                  <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Top Row: Icon, Name, Status & Score */}
                    <div className="flex items-start justify-between" style={{ gap: 12 }}>
                      <div className="flex items-center min-w-0 flex-1" style={{ gap: 12 }}>
                        <div className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.10)", color: "#059669" }}>
                          <Store size={20} strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate" style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                            {restaurant.name}
                          </h3>
                          <div style={{ marginTop: 4 }}>
                            <StatusBadge status={restaurant.status || "pending"} />
                          </div>
                        </div>
                      </div>

                      {restaurant.safety_score != null && (
                        <div className="shrink-0">
                          <SafetyScoreBadge score={restaurant.safety_score} />
                        </div>
                      )}
                    </div>

                    {/* Workflow status guidance note */}
                    {(restaurant.status === "pending" || !restaurant.status) && (
                      <div className="flex items-center justify-between" style={{ gap: 8, borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#92400e" }}>
                        <span>⚠️ Submit certificates to trigger inspector review</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate("/owner/certificates"); }}
                          className="underline font-bold cursor-pointer shrink-0"
                          style={{ color: "#78350f" }}
                        >
                          Upload
                        </button>
                      </div>
                    )}
                    {restaurant.status === "under_review" && (
                      <div className="flex items-center" style={{ gap: 8, borderRadius: 10, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.20)", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#1e40af" }}>
                        <Sparkles size={13} className="text-blue-600 shrink-0" />
                        <span>Documents submitted. Awaiting inspector approval.</span>
                      </div>
                    )}
                    {restaurant.status === "rejected" && (
                      <div className="flex items-center" style={{ gap: 8, borderRadius: 10, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.20)", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#9f1239" }}>
                        <FileWarning size={13} className="text-rose-600 shrink-0" />
                        <span>Registration rejected. Please re-upload updated permits.</span>
                      </div>
                    )}
                    {restaurant.assigned_inspector_name && (
                      <div className="flex items-center" style={{ gap: 8, borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.20)", padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#3730a3" }}>
                        <ShieldCheck size={13} className="text-indigo-600 shrink-0" />
                        <span>Assigned Inspector: <strong>{restaurant.assigned_inspector_name}</strong></span>
                      </div>
                    )}

                    {/* Details Info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                      {restaurant.address && (
                        <div className="flex items-start" style={{ gap: 8, fontSize: 13, color: "#64748b" }}>
                          <MapPin size={15} className="text-slate-400 shrink-0" style={{ marginTop: 1 }} />
                          <span className="line-clamp-2">{restaurant.address}</span>
                        </div>
                      )}
                      {(restaurant as Record<string, any>).phone && (
                        <div className="flex items-center" style={{ gap: 8, fontSize: 13, color: "#64748b" }}>
                          <Phone size={15} className="text-slate-400 shrink-0" />
                          <span>{(restaurant as Record<string, any>).phone}</span>
                        </div>
                      )}
                      {restaurant.latitude != null && restaurant.longitude != null && (
                        <div className="flex items-center" style={{ gap: 8, fontSize: 12, color: "#94a3b8" }}>
                          <MapPinned size={15} className="shrink-0" />
                          <span>
                            {Number(restaurant.latitude).toFixed(4)}, {Number(restaurant.longitude).toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between" style={{ gap: 8, paddingTop: 16, marginTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <button
                        onClick={(e) => openEditDialog(restaurant, e)}
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors duration-200 cursor-pointer"
                        style={{ height: 34, padding: "0 12px", borderRadius: 10, border: CARD_BORDER, fontSize: 13, fontWeight: 600 }}
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(restaurant.id, e)}
                        disabled={String(deletingId) === String(restaurant.id)}
                        className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors duration-200 cursor-pointer disabled:opacity-60"
                        style={{ height: 34, padding: "0 12px", borderRadius: 10, border: CARD_BORDER, fontSize: 13, fontWeight: 600 }}
                      >
                        {String(deletingId) === String(restaurant.id) ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        Delete
                      </button>
                    </div>

                    <div className="flex items-center justify-center transition-all group-hover:bg-emerald-50 group-hover:text-emerald-600" style={{ width: 28, height: 28, borderRadius: 999, background: "#f1f5f9", color: "#64748b" }}>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Register / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 24 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <div className="flex items-center min-w-0" style={{ gap: 12 }}>
              <div className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(16,185,129,0.10)", color: "#059669" }}>
                <Store size={20} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>
                {editingRestaurant ? "Edit Restaurant" : "Register New Restaurant"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="flex items-center justify-center transition-colors duration-200 cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              style={{ width: 32, height: 32, borderRadius: 10 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Name */}
          <div>
            <label style={LABEL_STYLE}>Restaurant Name *</label>
            <input
              placeholder="e.g. Mocha Cafe & Bistro"
              className={FIELD_CLASS}
              style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
              {...register("name")}
            />
            {errors.name && <p style={ERROR_STYLE}>{errors.name.message}</p>}
          </div>

          {/* Address */}
          <div style={{ marginTop: 20 }}>
            <label style={LABEL_STYLE}>Street Address *</label>
            <textarea
              placeholder="Full street address and landmark..."
              rows={2}
              className={`resize-y ${FIELD_CLASS}`}
              style={{ ...FIELD_STYLE, padding: "12px 14px", lineHeight: 1.5 }}
              {...register("address")}
            />
            {errors.address && <p style={ERROR_STYLE}>{errors.address.message}</p>}
          </div>

          {/* Phone */}
          <div style={{ marginTop: 20 }}>
            <label style={LABEL_STYLE}>Phone Number *</label>
            <input
              placeholder="e.g. 9876543210"
              className={FIELD_CLASS}
              style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
              {...register("phone")}
            />
            {errors.phone && <p style={ERROR_STYLE}>{errors.phone.message}</p>}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 20 }}>
            <div>
              <label style={LABEL_STYLE}>Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="28.6139"
                className={FIELD_CLASS}
                style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
                {...register("latitude", { valueAsNumber: true })}
              />
              {errors.latitude && <p style={ERROR_STYLE}>{errors.latitude.message}</p>}
            </div>
            <div>
              <label style={LABEL_STYLE}>Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="77.2090"
                className={FIELD_CLASS}
                style={{ ...FIELD_STYLE, height: 44, padding: "0 14px" }}
                {...register("longitude", { valueAsNumber: true })}
              />
              {errors.longitude && <p style={ERROR_STYLE}>{errors.longitude.message}</p>}
            </div>
          </div>

          <DialogFooter className="!gap-3 !mt-6 !pt-5">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="inline-flex items-center justify-center text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors duration-200 cursor-pointer"
              style={{ height: 44, padding: "0 20px", borderRadius: 12, border: CARD_BORDER }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ height: 44, padding: "0 20px", borderRadius: 12, boxShadow: SHADOW_REST }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editingRestaurant ? "Save Changes" : "Create Restaurant"}
            </button>
          </DialogFooter>
        </form>
      </Dialog>
    </DashboardLayout>
  );
}
