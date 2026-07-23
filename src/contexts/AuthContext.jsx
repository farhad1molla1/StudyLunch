import React, { createContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges, login, signup, logout, googleLogin } from '../services/authService';
import { getUser, updateLastActive } from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          // Safely attempt DB calls. If they fail, auth still works!
          try {
            await updateLastActive(user.uid);
            const profile = await getUser(user.uid);
            setDbUser(profile);
          } catch (dbErr) {
            console.error("Firestore user fetch failed, but Auth is okay:", dbErr);
          }
        } else {
          setCurrentUser(null);
          setDbUser(null);
        }
      } catch (err) {
        console.error("Auth state error:", err);
      } finally {
        // ALWAYS set loading to false so the app renders
        setLoading(false); 
      }
    });

    return unsubscribe;
  }, []);

  // NEVER return null or a blank screen. Always show a safe loader.
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main, #F3E9DB)', color: 'var(--ink-blue, #2D3A6B)', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
        Booting StudyLunch...
      </div>
    );
  }

  // Passing both 'user' and 'currentUser' to support legacy hooks
  return (
    <AuthContext.Provider value={{ currentUser, user: currentUser, dbUser, loading, login, signup, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};