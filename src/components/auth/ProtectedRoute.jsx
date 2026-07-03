import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader/Loader'; // ✅ Using existing Loader

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show full-page loader while checking auth state
    return <Loader variant="page" />;
  }

  if (!user) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the protected component
  return children;
};

export default ProtectedRoute;