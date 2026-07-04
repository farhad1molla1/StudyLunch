import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Auth Guards
import PublicRoute from './components/auth/PublicRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
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

// 🚀 আসল Profile Setup Wizard ইম্পোর্ট করা হলো
import ProfileSetup from './pages/profile/ProfileSetup';

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
          {/* 🚀 এখানে ডামি প্লেসহোল্ডারের বদলে আসল ProfileSetup বসানো হলো */}
          <Route 
            path="/profile/setup" 
            element={<ProtectedRoute requireProfile={false}><ProfileSetup /></ProtectedRoute>} 
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