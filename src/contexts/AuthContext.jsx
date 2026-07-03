import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { 
  signup as serviceSignup, 
  login as serviceLogin, 
  googleLogin as serviceGoogleLogin, 
  logout as serviceLogout, 
  resetPassword as serviceResetPassword, 
  updateUserProfile as serviceUpdateUserProfile 
} from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    const result = await serviceSignup(name, email, password);
    if (!result.success) throw new Error(result.message);
    return result;
  };

  const login = async (email, password) => {
    const result = await serviceLogin(email, password);
    if (!result.success) throw new Error(result.message);
    return result;
  };

  const googleLogin = async () => {
    const result = await serviceGoogleLogin();
    if (!result.success) throw new Error(result.message);
    return result;
  };

  const logout = async () => {
    const result = await serviceLogout();
    if (!result.success) throw new Error(result.message);
    return result;
  };

  const resetPassword = async (email) => {
    const result = await serviceResetPassword(email);
    if (!result.success) throw new Error(result.message);
    return result;
  };

  const updateUserProfile = async (displayName, photoURL) => {
    const result = await serviceUpdateUserProfile(displayName, photoURL);
    if (!result.success) throw new Error(result.message);
    // Force user state update so UI reflects changes immediately
    setUser({ ...auth.currentUser });
    return result;
  };

  const value = {
    user,
    loading,
    signup,
    login,
    googleLogin,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};