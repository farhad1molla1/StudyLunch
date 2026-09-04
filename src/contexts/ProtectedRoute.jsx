import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  const loading = auth ? (auth.loading || auth.authLoading) : true;
  const currentUser = auth ? (auth.currentUser || auth.user) : null;

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        padding: "40px 20px"
      }}>
        <div style={{
          padding: "16px 28px",
          background: "var(--sl-surface, #ffffff)",
          borderRadius: "var(--sl-radius-md, 20px)",
          border: "1px solid var(--sl-border, #eadfcf)",
          boxShadow: "var(--sl-shadow-soft, 0 10px 28px rgba(24, 43, 58, 0.08))",
          color: "var(--sl-primary, #0f6b62)",
          fontWeight: "600",
          fontSize: "1rem"
        }}>
          Loading StudyLunch...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;