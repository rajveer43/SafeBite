import api from "./api";

export async function getComplaints(params?: { status?: string; page?: number }) {
  const res = await api.get("/complaints", { params });
  return res.data;
}

export async function getComplaintById(id: string) {
  const res = await api.get(`/complaints/${id}`);
  return res.data;
}

export async function createComplaint(data: { restaurant_id: string; title: string; description: string; priority?: string }) {
  const res = await api.post("/complaints", data);
  return res.data;
}

export async function updateComplaint(id: string, data: { status?: string; resolution_notes?: string }) {
  const res = await api.put(`/complaints/${id}`, data);
  return res.data;
}

export async function getMyComplaints() {
  const res = await api.get("/complaints/my");
  return res.data;
}
