export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: "customer" | "owner" | "inspector" | "admin";
  is_verified: boolean;
  created_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  latitude: number;
  longitude: number;
  safety_score: number;
  status?: "pending" | "under_review" | "active" | "approved" | "rejected";
  owner_id: string;
  owner_name?: string;
  owner_verified: boolean;
  is_high_risk: boolean;
  assigned_inspector_id?: string;
  assigned_inspector_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface Certificate {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  certificate_type: string;
  file_url: string;
  issued_date: string;
  expiry_date: string;
  status: "pending" | "approved" | "rejected" | "expired";
  created_at: string;
}

export interface Complaint {
  id: string;
  customer_id: string;
  customer_name?: string;
  restaurant_id: string;
  restaurant_name?: string;
  title: string;
  description: string;
  status: "pending" | "in_review" | "under_investigation" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  updated_at?: string;
  resolution_notes?: string;
}

export interface Inspection {
  id: string;
  inspector_id: string;
  inspector_name?: string;
  restaurant_id: string;
  restaurant_name?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  score: number | null;
  notes: string;
  scheduled_date: string;
  completed_date?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  is_read: boolean;
  created_at: string;
}

export interface AdminDashboard {
  total_users: number;
  total_customers: number;
  total_owners: number;
  total_inspectors: number;
  total_restaurants: number;
  total_certificates: number;
  total_complaints: number;
  avg_safety_score: number;
  high_risk_restaurants: number;
  pending_owners: number;
  pending_complaints: number;
  pending_certificates: number;
  recent_users: User[];
  recent_restaurants: Restaurant[];
  pending_owner_verifications: User[];
  pending_complaints_list: Complaint[];
  pending_certificates_list: Certificate[];
  expiring_certificates: Certificate[];
  overdue_inspections: Inspection[];
  high_risk_list: Restaurant[];
  activities?: Record<string, unknown>[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface RestaurantFilters {
  search?: string;
  min_safety_score?: number;
  max_safety_score?: number;
  is_high_risk?: boolean;
  sort_by?: "newest" | "safety_score" | "name";
  page?: number;
  per_page?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  role: string;
}
