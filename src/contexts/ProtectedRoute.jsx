import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const auth = useAuth();

  const currentUser = auth?.currentUser || auth?.user || null;
  const loading = auth?.loading || auth?.authLoading || false;

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "var(--sl-bg, #f7f1e7)", 
        color: "var(--sl-primary-dark, #084b45)", 
        fontWeight: 800, 
        fontSize: "1.2rem" 
      }}>
        Loading StudyLunch...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? children : <Outlet />;
}