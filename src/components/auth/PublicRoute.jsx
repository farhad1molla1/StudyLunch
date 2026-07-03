import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../common/Loader/Loader'; // ✅ Using existing Loader

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show full-page loader while checking auth state
    return <Loader variant="page" />;
  }

  if (user) {
    // If already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in, render the public component (Login/Signup)
  return children;
};

export default PublicRoute;