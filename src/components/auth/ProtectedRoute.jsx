import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { user, loading, isProfileComplete } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Loading...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires a completed profile but the user hasn't completed it
  if (requireProfile && !isProfileComplete) {
    return <Navigate to="/profile/setup" replace />;
  }

  // If the route is specifically for setup, but profile is already complete
  if (!requireProfile && isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;