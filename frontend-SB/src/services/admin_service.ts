import api from "./api";

export async function getDashboard() {
  const [
    statsRes,
    recentUsersRes,
    recentRestaurantsRes,
    pendingOwnersRes,
    pendingComplaintsRes,
    pendingCertsRes,
    expiringCertsRes,
    overdueInspectionsRes,
    highRiskRes,
    activityRes,
  ] = await Promise.all([
    api.get("/admin/dashboard").catch(() => ({ data: {} })),
    api.get("/admin/recent-users").catch(() => ({ data: [] })),
    api.get("/admin/recent-restaurants").catch(() => ({ data: [] })),
    api.get("/admin/pending-owners").catch(() => ({ data: [] })),
    api.get("/admin/pending-complaints").catch(() => ({ data: [] })),
    api.get("/admin/pending-certificates").catch(() => ({ data: [] })),
    api.get("/admin/expiring-certificates").catch(() => ({ data: [] })),
    api.get("/admin/overdue-inspections").catch(() => ({ data: [] })),
    api.get("/admin/high-risk-restaurants").catch(() => ({ data: [] })),
    api.get("/admin/activity").catch(() => ({ data: [] })),
  ]);

  const stats = statsRes.data || {};

  return {
    ...stats,
    avg_safety_score: stats.average_safety_score ?? stats.avg_safety_score ?? 0,
    recent_users: recentUsersRes.data || [],
    recent_restaurants: recentRestaurantsRes.data || [],
    pending_owner_verifications: pendingOwnersRes.data || [],
    pending_complaints_list: pendingComplaintsRes.data || [],
    pending_certificates_list: pendingCertsRes.data || [],
    expiring_certificates: expiringCertsRes.data || [],
    overdue_inspections: overdueInspectionsRes.data || [],
    high_risk_list: highRiskRes.data || [],
    activities: activityRes.data || [],
  };
}

export async function getUsers(params?: { search?: string; role?: string; page?: number }) {
  const res = await api.get("/admin/users", { params });
  return res.data;
}

export async function verifyOwner(userId: string | number, approved: boolean) {
  const res = await api.patch(`/admin/users/${userId}/verification-status`, {
    verification_status: approved ? "VERIFIED" : "REJECTED",
  });
  return res.data;
}


export async function getActivityLogs(params?: { page?: number; per_page?: number }) {
  const res = await api.get("/admin/activity", { params });
  return res.data;
}

export async function getInspectors() {
  const res = await api.get("/admin/inspectors");
  return res.data;
}

export async function assignInspectorToRestaurant(restaurantId: string, inspectorId: string | null) {
  const res = await api.patch(`/admin/restaurants/${restaurantId}/assign-inspector`, { inspector_id: inspectorId });
  return res.data;
}


