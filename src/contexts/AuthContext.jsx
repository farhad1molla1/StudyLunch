import React, { createContext, useState, useEffect, useContext } from 'react';
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
          
          if (profileRes && (profileRes.success || profileRes.data)) {
            const data = profileRes.data || profileRes;
            setDbUser(data);
            setIsProfileComplete(!!data.university);
            
            // Update last active on session restore/login
            await updateLastActive(firebaseUser.uid);
          } else {
            setDbUser(null);
            setIsProfileComplete(false);
          }
        } catch (error) {
          console.error("Failed to synchronize session.", error);
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
      console.error("Logout failed.", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser: user,
    user,
    loading,
    authLoading: loading,
    isAuthenticated: !!user,
    dbUser,
    isProfileComplete,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;