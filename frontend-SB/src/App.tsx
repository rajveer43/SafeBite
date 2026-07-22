import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/protected_route";
import Loading from "./components/common/loading";

const LandingPage = lazy(() => import("./pages/landing/index"));
const Login = lazy(() => import("./pages/auth/login"));
const Register = lazy(() => import("./pages/auth/register"));

const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/users"));
const AdminRestaurants = lazy(() => import("./pages/admin/restaurants"));
const AdminVerification = lazy(() => import("./pages/admin/verification"));
const AdminActivity = lazy(() => import("./pages/admin/activity"));
const AdminNotifications = lazy(() => import("./pages/admin/notifications"));

const CustomerDashboard = lazy(() => import("./pages/customer/dashboard"));
const CustomerRestaurants = lazy(() => import("./pages/customer/restaurants"));
const CustomerComplaints = lazy(() => import("./pages/customer/complaints"));
const CustomerNotifications = lazy(() => import("./pages/customer/notifications"));

const OwnerDashboard = lazy(() => import("./pages/owner/dashboard"));
const OwnerRestaurants = lazy(() => import("./pages/owner/restaurants"));
const OwnerCertificates = lazy(() => import("./pages/owner/certificates"));
const OwnerComplaints = lazy(() => import("./pages/owner/complaints"));
const OwnerNotifications = lazy(() => import("./pages/owner/notifications"));

const InspectorDashboard = lazy(() => import("./pages/inspector/dashboard"));
const InspectorInspections = lazy(() => import("./pages/inspector/inspections"));
const InspectorRestaurants = lazy(() => import("./pages/inspector/restaurants"));
const InspectorNotifications = lazy(() => import("./pages/inspector/notifications"));

const RestaurantDetail = lazy(() => import("./pages/shared/restaurant-detail"));

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <Loading size="lg" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/restaurant/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner", "customer", "inspector"]}>
                <RestaurantDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRestaurants /></ProtectedRoute>} />
          <Route path="/admin/verification" element={<ProtectedRoute allowedRoles={["admin"]}><AdminVerification /></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute allowedRoles={["admin"]}><AdminActivity /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotifications /></ProtectedRoute>} />

          {/* Customer Routes */}
          <Route path="/customer" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/restaurants" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerRestaurants /></ProtectedRoute>} />
          <Route path="/customer/complaints" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerComplaints /></ProtectedRoute>} />
          <Route path="/customer/notifications" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerNotifications /></ProtectedRoute>} />

          {/* Owner Routes */}
          <Route path="/owner" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/restaurants" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerRestaurants /></ProtectedRoute>} />
          <Route path="/owner/certificates" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerCertificates /></ProtectedRoute>} />
          <Route path="/owner/complaints" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerComplaints /></ProtectedRoute>} />
          <Route path="/owner/notifications" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerNotifications /></ProtectedRoute>} />

          {/* Inspector Routes */}
          <Route path="/inspector" element={<ProtectedRoute allowedRoles={["inspector"]}><InspectorDashboard /></ProtectedRoute>} />
          <Route path="/inspector/inspections" element={<ProtectedRoute allowedRoles={["inspector"]}><InspectorInspections /></ProtectedRoute>} />
          <Route path="/inspector/restaurants" element={<ProtectedRoute allowedRoles={["inspector"]}><InspectorRestaurants /></ProtectedRoute>} />
          <Route path="/inspector/notifications" element={<ProtectedRoute allowedRoles={["inspector"]}><InspectorNotifications /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
  );
}
