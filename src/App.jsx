import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';

// CORE PAGES
import Dashboard from './pages/dashboard/Dashboard';
import TopicDetails from './pages/topics/TopicDetails';
import SessionWorkspace from './pages/sessions/SessionWorkspace';

// IMPORT EXISTING PAGES (Based on your file tree)
import TopicFeed from './pages/topics/TopicFeed';
import CreateTopic from './pages/topics/CreateTopic';
import Sessions from './pages/sessions/Sessions';

// PLACEHOLDER FOR INCOMPLETE PAGES
import Placeholder from './pages/Placeholder';

const SafeLoginFallback = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h2>Please Log In</h2>
    <p>Authentication UI is loading...</p>
  </div>
);

const App = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      {!currentUser ? (
        <>
          <Route path="/login" element={<SafeLoginFallback />} /> 
          <Route path="/signup" element={<SafeLoginFallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        /* PROTECTED ROUTES */
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Active Feature Routes */}
          <Route path="/topics" element={<TopicFeed />} />
          <Route path="/topics/create" element={<CreateTopic />} />
          <Route path="/topics/:topicId" element={<TopicDetails />} />
          
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:sessionId" element={<SessionWorkspace />} />
          
          {/* Safe Placeholders for Pending Features */}
          <Route path="/notifications" element={<Placeholder title="Notifications" icon="🔔" />} />
          <Route path="/locker" element={<Placeholder title="Locker" icon="💼" />} />
          <Route path="/study-system" element={<Placeholder title="Study System" icon="🧩" />} />
          <Route path="/leaderboard" element={<Placeholder title="Leaderboard" icon="🏆" />} />
          <Route path="/profile" element={<Placeholder title="Profile" icon="👤" />} />

          {/* Catch-All Safe Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;