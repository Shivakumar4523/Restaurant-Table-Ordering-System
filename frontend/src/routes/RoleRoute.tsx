import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/api";

function homeForRole(role: Role) {
  if (role === "kitchen") return "/kitchen";
  if (role === "bar") return "/bar-service";
  if (role === "admin") return "/admin";
  return "/staff/orders";
}

export function RoleRoute({ roles }: { roles: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-cream text-sm font-black text-forest-700">Checking access...</div>;
  }

  if (!user) {
    return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return <Outlet />;
}
