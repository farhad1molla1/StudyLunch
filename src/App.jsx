import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Auth Guards & Layouts
import PublicRoute from './components/auth/PublicRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout'; // 🚀 Imported MainLayout

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Topics from './pages/topics/Topics';
import CreateTopic from './pages/topics/CreateTopic';
import TopicDetails from './pages/topics/TopicDetails';
import Sessions from './pages/sessions/Sessions';
import StudyLunchSystem from './pages/studyLunch/StudyLunchSystem';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Locker from './pages/locker/Locker';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';
import SOS from './pages/sos/SOS';
import ProfileSetup from './pages/profile/ProfileSetup';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
  position="top-right" 
  toastOptions={{
    style: {
      fontFamily: 'var(--font-primary)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      boxShadow: 'var(--shadow-floating)',
      padding: '12px 24px',
      fontWeight: '600',
    },
    success: {
      iconTheme: {
        primary: '#10B981', /* Success Green */
        secondary: 'white',
      },
    },
    error: {
      iconTheme: {
        primary: '#EF4444', /* Error Red */
        secondary: 'white',
      },
    },
  }} 
/>
        <Routes>
          {/* =========== Public Routes =========== */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* =========== Semi-Protected Route =========== */}
          <Route 
            path="/profile/setup" 
            element={<ProtectedRoute requireProfile={false}><ProfileSetup /></ProtectedRoute>} 
          />

          {/* =========== Strictly Protected Routes with Global MainLayout =========== */}
          <Route element={<MainLayout />}> {/* 🚀 Appended Layout Wrapper */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            <Route path="/topics" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
            <Route path="/topics/create" element={<ProtectedRoute><CreateTopic /></ProtectedRoute>} />
            <Route path="/topics/:id" element={<ProtectedRoute><TopicDetails /></ProtectedRoute>} />
            
            <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
            <Route path="/study-system" element={<ProtectedRoute><StudyLunchSystem /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/locker" element={<ProtectedRoute><Locker /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />
          </Route>

          {/* =========== Fallbacks =========== */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;