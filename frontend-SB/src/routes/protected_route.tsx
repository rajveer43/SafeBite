import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!allowedRoles.includes(payload.role)) return <Navigate to="/login" replace />;
    return children;
  } catch { return <Navigate to="/login" replace />; }
}
