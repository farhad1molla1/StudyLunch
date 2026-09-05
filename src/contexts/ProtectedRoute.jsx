import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, currentUser, authLoading } = useAuth() || {};
  const location = useLocation();

  const activeUser = currentUser || user;

  // Only show loader during the initial auth resolution
  if (authLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        padding: "40px 20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 24px",
          background: "var(--sl-surface, #ffffff)",
          borderRadius: "var(--sl-radius-md, 18px)",
          border: "1px solid var(--sl-border, #E1E8EC)",
          boxShadow: "var(--sl-shadow-soft, 0 8px 24px rgba(15, 32, 39, 0.06))",
          color: "var(--sl-primary, #0B5A55)",
          fontWeight: "600",
          fontSize: "0.95rem"
        }}>
          <span>🍱</span>
          <span>Opening StudyLunch...</span>
        </div>
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;