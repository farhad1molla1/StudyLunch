import React, { createContext, useState, useEffect } from 'react';
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
  const [dbUser, setDbUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profileRes = await getUser(firebaseUser.uid);
          
          if (profileRes && profileRes.success && profileRes.data) {
            setDbUser(profileRes.data);
            setIsProfileComplete(!!profileRes.data.university);
            
            // Update last active on session restore/login
            await updateLastActive(firebaseUser.uid);
          } else {
            setDbUser(null);
            setIsProfileComplete(false);
          }
        } catch (error) {
          console.error("Failed to synchronize session.");
        }
      } else {
        setUser(null);
        setDbUser(null);
        setIsProfileComplete(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setDbUser(null);
      setIsProfileComplete(false);
    } catch (error) {
      console.error("Logout failed.");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    dbUser,
    isProfileComplete,
    loading,
    login: authLogin,
    signup: authSignup,
    googleLogin: authGoogleLogin,
    resetPassword: authResetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};