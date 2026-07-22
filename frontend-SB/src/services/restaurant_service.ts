import api from "./api";

export async function getRestaurants(params?: Record<string, unknown>) {
  const res = await api.get("/restaurants", { params });
  const rawList = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  return rawList.map((item: any) => ({
    ...item,
    id: item.id || item.restaurant_id,
    phone_number: item.phone_number || item.contact_number || "",
    status: item.status || "pending",
    is_high_risk: item.is_high_risk ?? (item.safety_score !== null && item.safety_score !== undefined ? item.safety_score < 60 : false),
  }));
}

export async function getRestaurantById(id: string) {
  const res = await api.get(`/restaurants/${id}`);
  const item = res.data;
  return {
    ...item,
    id: item.id || item.restaurant_id,
    phone_number: item.phone_number || item.contact_number || "",
    status: item.status || "pending",
    is_high_risk: item.is_high_risk ?? (item.safety_score !== null && item.safety_score !== undefined ? item.safety_score < 60 : false),
  };
}

export async function createRestaurant(data: Record<string, unknown>) {
  const res = await api.post("/restaurants", data);
  return res.data;
}

export async function updateRestaurant(id: string | number, data: Record<string, unknown>) {
  const res = await api.put(`/restaurants/${id}`, data);
  return res.data;
}

export async function updateRestaurantStatus(id: string | number, status: string, notes?: string) {
  const res = await api.put(`/restaurants/${id}/status`, { status, notes });
  return res.data;
}

export async function deleteRestaurant(id: string | number) {
  const res = await api.delete(`/restaurants/${id}`);
  return res.data;
}

export async function getOwnerRestaurants() {
  let res;
  try {
    res = await api.get("/restaurants/my-restaurants");
  } catch {
    res = await api.get("/owner/restaurants");
  }
  const rawList = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  return rawList.map((item: any) => ({
    ...item,
    id: item.id || item.restaurant_id,
    phone_number: item.phone_number || item.contact_number || "",
    status: item.status || "pending",
    is_high_risk: item.is_high_risk ?? (item.safety_score !== null && item.safety_score !== undefined ? item.safety_score < 60 : false),
  }));
}

export async function getNearbyRestaurants(params?: { lat?: number; lng?: number; radius?: number }) {
  const res = await api.get("/restaurants/nearby", { params });
  return res.data;
}

export async function getRestaurantInspections(restaurantId: string) {
  const res = await api.get(`/inspections/restaurant/${restaurantId}`);
  const rawList = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  return rawList.map((item: any) => ({
    ...item,
    id: item.id || item.inspection_id,
    scheduled_date: item.scheduled_date || item.inspection_date,
    completed_date: item.completed_date || (item.score !== null && item.score !== undefined ? item.inspection_date : undefined),
    status: item.status || (item.score !== null && item.score !== undefined ? "completed" : "scheduled"),
    notes: item.notes || item.remarks || "",
  }));
}

export async function getRestaurantComplaintsById(restaurantId: string) {
  const res = await api.get(`/complaints/restaurant/${restaurantId}`);
  const rawList = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  return rawList.map((item: any) => ({
    ...item,
    id: item.id || item.complaint_id,
  }));
}

export async function getRestaurantCertificatesById(restaurantId: string) {
  const res = await api.get(`/certificates`, { params: { restaurant_id: restaurantId } });
  const rawList = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  return rawList.map((item: any) => ({
    ...item,
    id: item.id || item.certificate_id,
  }));
}
