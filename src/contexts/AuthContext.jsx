import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// 1. Export AuthContext explicitly so named imports like { AuthContext } never fail
export const AuthContext = createContext(null);

// 2. Export useAuth hook directly from the provider file
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 3. Export AuthProvider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  // Memoized value supplying all necessary aliases to prevent destructuring errors
  const value = useMemo(() => ({
    currentUser,
    user: currentUser, 
    loading,
    authLoading: loading, 
    isAuthenticated: !!currentUser,
    logout
  }), [currentUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Default export fallback
export default AuthContext;