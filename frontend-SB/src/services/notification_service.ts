import api from "./api";

export async function getNotifications(params?: { is_read?: boolean; page?: number }) {
  const res = await api.get("/notifications", { params });
  return res.data;
}

export async function markAsRead(id: string | number) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllAsRead() {
  const res = await api.patch("/notifications/read-all");
  return res.data;
}

export async function deleteNotification(id: string | number) {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get("/notifications/unread-count");
  return res.data;
}
