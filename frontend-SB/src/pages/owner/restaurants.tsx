import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard_layout";
import PageHeader from "@/components/common/page-header";
import SearchBar from "@/components/common/search-bar";
import EmptyState from "@/components/common/empty-state";
import StatusBadge from "@/components/common/status-badge";
import SafetyScoreBadge from "@/components/common/safety-score";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
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
      <div className="flex flex-col gap-6 sm:gap-8 w-full pb-16">
        
        {/* Page Header with Primary Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="My Managed Establishments"
            description="Register, inspect, and update your business locations"
          />
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-lg transition-all shadow-md shadow-emerald-950/20 cursor-pointer border border-emerald-400/30 active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Restaurant</span>
          </button>
        </div>

        {/* Search & Statistics Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-xs">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search establishments by name or location..."
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700">
              <Building2 size={13} className="text-slate-500" />
              {filtered.length} Location{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Restaurant Cards Container */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Store}
            title={search ? "No restaurants found" : "No restaurants added yet"}
            description={
              search
                ? "Try adjusting your search query to find your establishment."
                : "Register your first restaurant establishment to start monitoring compliance."
            }
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
                  className="group rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-emerald-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon, Name, Status & Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                          <Store size={20} strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                            {restaurant.name}
                          </h3>
                          <div className="mt-1">
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
                      <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center justify-between gap-2">
                        <span>⚠️ Submit certificates to trigger inspector review</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/owner/certificates");
                          }}
                          className="text-[11px] h-6 px-2 text-amber-900 underline font-bold"
                        >
                          Upload
                        </Button>
                      </div>
                    )}
                    {restaurant.status === "under_review" && (
                      <div className="rounded-lg bg-blue-50 p-2.5 border border-blue-200 text-blue-800 text-[11px] font-medium flex items-center gap-1.5">
                        <Sparkles size={13} className="text-blue-600 shrink-0" />
                        <span>Documents submitted. Awaiting inspector approval.</span>
                      </div>
                    )}
                    {restaurant.status === "rejected" && (
                      <div className="rounded-lg bg-rose-50 p-2.5 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                        <FileWarning size={13} className="text-rose-600 shrink-0" />
                        <span>Registration rejected. Please re-upload updated permits.</span>
                      </div>
                    )}
                    {restaurant.assigned_inspector_name && (
                      <div className="rounded-lg bg-indigo-50 p-2.5 border border-indigo-200 text-indigo-800 text-[11px] font-medium flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-indigo-600 shrink-0" />
                        <span>Assigned Inspector: <strong>{restaurant.assigned_inspector_name}</strong></span>
                      </div>
                    )}

                    {/* Details Info */}
                    <div className="space-y-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      {restaurant.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{restaurant.address}</span>
                        </div>
                      )}
                      {(restaurant as Record<string, any>).phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{(restaurant as Record<string, any>).phone}</span>
                        </div>
                      )}
                      {restaurant.latitude != null && restaurant.longitude != null && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <MapPinned className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {Number(restaurant.latitude).toFixed(4)}, {Number(restaurant.longitude).toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-slate-700 hover:text-emerald-600 hover:border-emerald-300"
                        onClick={(e) => openEditDialog(restaurant, e)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                        onClick={(e) => handleDelete(restaurant.id, e)}
                        disabled={String(deletingId) === String(restaurant.id)}
                      >
                        {String(deletingId) === String(restaurant.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </Button>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modern Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 z-10 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Store size={18} className="text-emerald-600" />
                {editingRestaurant ? "Edit Restaurant Details" : "Register New Restaurant"}
              </h2>
              <Button
                variant="ghost"
                size="xs"
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                  Restaurant Name *
                </label>
                <Input
                  placeholder="e.g. Mocha Cafe & Bistro"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                  Street Address *
                </label>
                <Textarea
                  placeholder="Full street address and landmark..."
                  rows={2}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                  Phone Number *
                </label>
                <Input
                  placeholder="e.g. 9876543210"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                    Latitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="28.6139"
                    {...register("latitude", { valueAsNumber: true })}
                  />
                  {errors.latitude && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 block">
                    Longitude
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="77.2090"
                    {...register("longitude", { valueAsNumber: true })}
                  />
                  {errors.longitude && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingRestaurant ? "Save Changes" : "Create Restaurant"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}

