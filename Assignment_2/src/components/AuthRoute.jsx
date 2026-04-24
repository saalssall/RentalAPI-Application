import { Navigate, Outlet } from "react-router-dom";

export default function AuthenticatedRoute() {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}