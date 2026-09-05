import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getUser, updateLastActive } from '../services/userService';
import { 
  login as authLogin, 
  signup as authSignup, 
  googleLogin as authGoogleLogin, 
  resetPassword as authResetPassword 
} from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(() => {
    try {
      const cached = sessionStorage.getItem('studylunch_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Instant auth resolution: don't block navigation on background profile fetch
        setAuthLoading(false);

        try {
          const profileRes = await getUser(firebaseUser.uid);
          
          if (profileRes && (profileRes.success || profileRes.data)) {
            const data = profileRes.data || profileRes;
            setDbUser(data);
            setIsProfileComplete(!!data.university);
            try {
              sessionStorage.setItem('studylunch_user_profile', JSON.stringify(data));
            } catch {
              // Ignore session storage errors
            }
            
            // Update last active in background
            updateLastActive(firebaseUser.uid).catch(() => {});
          } else {
            setDbUser(null);
            setIsProfileComplete(false);
          }
        } catch (error) {
          console.warn("Could not synchronize profile in background:", error);
        }
      } else {
        setUser(null);
        setDbUser(null);
        setIsProfileComplete(false);
        try {
          sessionStorage.removeItem('studylunch_user_profile');
        } catch {
          // Ignore
        }
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setDbUser(null);
      setIsProfileComplete(false);
      try {
        sessionStorage.removeItem('studylunch_user_profile');
      } catch {
        // Ignore
      }
    } catch (error) {
      console.error("Logout failed.", error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    currentUser: user,
    user,
    loading: authLoading,
    authLoading,
    isAuthenticated: !!user,
    dbUser,
    isProfileComplete,
    login: authLogin,
    signup: authSignup,
    googleLogin: authGoogleLogin,
    resetPassword: authResetPassword,
    logout
  }), [user, dbUser, isProfileComplete, authLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;