import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';

// Safely importing standard pages (ensure these paths match your folder structure)
import Dashboard from './pages/dashboard/Dashboard';
import TopicDetails from './pages/topics/TopicDetails';
import SessionWorkspace from './pages/sessions/SessionWorkspace';
// Import your Auth/Login components here (adjust paths if needed)
// import Login from './pages/auth/Login'; 
// import Signup from './pages/auth/Signup';

// A simple safe fallback for Login if the real one has issues loading right now
const SafeLoginFallback = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h2>Please Log In</h2>
    <p>Authentication UI is loading...</p>
  </div>
);

const App = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return null; // AuthContext already handles the global loading screen

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      {!currentUser ? (
        <>
          {/* Replace SafeLoginFallback with your actual <Login /> component when stable */}
          <Route path="/login" element={<SafeLoginFallback />} /> 
          <Route path="/signup" element={<SafeLoginFallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* PROTECTED ROUTES */
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Deep Routes */}
          <Route path="/topics/:topicId" element={<TopicDetails />} />
          <Route path="/sessions/:sessionId" element={<SessionWorkspace />} />
          
          {/* Catch-All Safe Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;