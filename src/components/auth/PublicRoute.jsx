import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const auth = useAuth();
  const loading = auth ? (auth.loading || auth.authLoading) : true;
  const user = auth ? (auth.currentUser || auth.user) : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--sl-muted, #6f7c83)', fontSize: '18px', fontWeight: '500' }}>Loading...</p>
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
};

export default PublicRoute;