import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUser } from '../../services/userService';

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { user, loading, isProfileComplete } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const [localProfileComplete, setLocalProfileComplete] = useState(isProfileComplete);

  // Fallback Check: Resolves stale context if the user just completed the Setup Wizard 
  // and is navigating to dashboard without a hard refresh.
  useEffect(() => {
    const doubleCheckProfile = async () => {
      if (user && requireProfile && !isProfileComplete) {
        const res = await getUser(user.uid);
        if (res.success && res.data?.university) {
          setLocalProfileComplete(true);
        }
      }
      setLocalLoading(false);
    };

    if (!loading) {
      doubleCheckProfile();
    }
  }, [user, loading, requireProfile, isProfileComplete]);

  if (loading || localLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: '500' }}>Loading...</p>
      </div>
    );
  }

  // Not logged in -> Kick to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but profile incomplete -> Kick to Setup Wizard
  if (requireProfile && !localProfileComplete) {
    return <Navigate to="/profile/setup" replace />;
  }

  // Logged in, profile complete, but trying to access Setup -> Kick to Dashboard
  if (!requireProfile && localProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  // All clear -> Render the protected page
  return children;
};

export default ProtectedRoute;