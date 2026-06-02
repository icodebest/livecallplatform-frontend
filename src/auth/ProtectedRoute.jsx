import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
  const { authenticated, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading workspace...</div>;
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
