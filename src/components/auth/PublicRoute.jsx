import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { user, isProfileComplete, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Loading...</p>
      </div>
    );
  }

  // If already logged in, redirect based on profile completion status
  if (user) {
    return isProfileComplete ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/profile/setup" replace />
    );
  }

  return children;
};

export default PublicRoute;