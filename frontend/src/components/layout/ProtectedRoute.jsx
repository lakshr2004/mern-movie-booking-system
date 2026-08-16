import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../features/auth/AuthContext";

function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { user, getUserRole } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  if (adminOnly && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (userOnly && role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
