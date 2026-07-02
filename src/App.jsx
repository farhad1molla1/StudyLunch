import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
    <Routes>
      {/* Root & Core Dashboard Routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* User & Features Routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/topics" element={<Topics />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/locker" element={<Locker />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/sos" element={<SOS />} />
      <Route path="/study-system" element={<StudyLunchSystem />} />
    </Routes>
  );
}

export default App;