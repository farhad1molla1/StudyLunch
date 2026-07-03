import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Infrastructure
import MainLayout from './layouts/MainLayout';

// 🛡️ Route Protection Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Import All Modular Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Topics from './pages/topics/Topics';
import Sessions from './pages/sessions/Sessions';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Locker from './pages/locker/Locker';
import Notifications from './pages/notifications/Notifications';
import SOS from './pages/sos/SOS';
import StudyLunchSystem from './pages/studyLunch/StudyLunchSystem';

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            fontWeight: '500',
          },
        }} 
      />

      <Routes>
        {/* Completely Isolated Public Authentication Pages (Protected by PublicRoute) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Main App Layout Shield Wrapped Routes (Protected by ProtectedRoute) */}
        {/* We wrap the MainLayout, so ALL nested routes automatically become protected! */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/locker" element={<Locker />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/study-system" element={<StudyLunchSystem />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;