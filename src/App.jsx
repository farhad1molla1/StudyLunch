import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Auth Guards
import PublicRoute from './components/auth/PublicRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';

// তোমার তৈরি করা আসল UI পেজগুলো কানেক্ট করা হলো
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Topics from './pages/topics/Topics';
import Sessions from './pages/sessions/Sessions';
import StudyLunchSystem from './pages/studyLunch/StudyLunchSystem';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Locker from './pages/locker/Locker';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';
import SOS from './pages/sos/SOS';

// Fallback Placeholder (যেহেতু আগে এই পেজটি மிসিং ছিল)
const ProfileSetupPlaceholder = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Profile Setup Wizard</h2>
    <p style={{ color: 'var(--text-secondary)' }}>Please complete your profile to continue.</p>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* =========== Public Routes =========== */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* =========== Semi-Protected Route (No Profile Required) =========== */}
          <Route 
            path="/profile/setup" 
            element={<ProtectedRoute requireProfile={false}><ProfileSetupPlaceholder /></ProtectedRoute>} 
          />

          {/* =========== Strictly Protected Routes =========== */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/topics" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
          <Route path="/study-system" element={<ProtectedRoute><StudyLunchSystem /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/locker" element={<ProtectedRoute><Locker /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />

          {/* =========== Fallbacks =========== */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;