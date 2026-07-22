import api from "./api";

export async function getInspections(params?: { status?: string; page?: number }) {
  const res = await api.get("/inspections", { params });
  const rawList = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
  return rawList.map((item: any) => ({
    ...item,
    id: item.id || item.inspection_id,
    restaurant_name: item.restaurant_name,
    scheduled_date: item.scheduled_date || item.inspection_date,
    completed_date: item.completed_date || (item.score !== null && item.score !== undefined ? item.inspection_date : undefined),
    status: item.status || (item.score !== null && item.score !== undefined ? "completed" : "scheduled"),
    notes: item.notes || item.remarks || "",
  }));
}

export async function getInspectionById(id: string | number) {
  const res = await api.get(`/inspections/${id}`);
  return res.data;
}

export async function createInspection(data: { restaurant_id: string | number; scheduled_date: string; notes?: string }) {
  const res = await api.post("/inspections", data);
  return res.data;
}

export async function updateInspection(id: string | number, data: { status?: string; score?: number; notes?: string }) {
  const res = await api.put(`/inspections/${id}`, data);
  return res.data;
}

export async function getCertificates(params?: { status?: string; page?: number }) {
  const res = await api.get("/certificates", { params });
  return res.data;
}

export async function uploadCertificate(data: FormData) {
  const res = await api.post("/certificates", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateCertificate(id: number, data: { status?: string }) {
  const res = await api.put(`/certificates/${id}`, data);
  return res.data;
}
