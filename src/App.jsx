import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers & Layouts
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './contexts/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Public Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import TopicFeed from './pages/topics/TopicFeed';
import CreateTopic from './pages/topics/CreateTopic';
import TopicDetails from './pages/topics/TopicDetails';
import MySessions from './pages/sessions/MySessions';
import Placeholder from './pages/Placeholder';

// Temporary Error Boundary Component to prevent WSOD
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error, errorInfo) {
    console.error("StudyLunch Boot Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fffaf1', color: '#084b45', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1>StudyLunch failed to load.</h1>
          <p>Please check the console for details.</p>
          <pre style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eadfcf', color: '#d32f2f' }}>{this.state.errorMsg}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Route Chain */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                
                {/* Core Routing */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Topics */}
                <Route path="/topics" element={<TopicFeed />} />
                <Route path="/topics/create" element={<CreateTopic />} />
                <Route path="/topics/:topicId" element={<TopicDetails />} />

                {/* Sessions Hub */}
                <Route path="/sessions" element={<MySessions />} />
                
                {/* Prevent bypassing Check-in directly into a broken Workspace view */}
                <Route path="/sessions/:sessionId" element={<Navigate to="/sessions" replace />} />

                {/* Placeholders for Future Modules */}
                <Route path="/notifications" element={<Placeholder title="Notifications" icon="🔔" />} />
                <Route path="/locker" element={<Placeholder title="Study Locker" icon="💼" />} />
                <Route path="/study-system" element={<Placeholder title="Study System" icon="🧩" />} />
                <Route path="/leaderboard" element={<Placeholder title="Leaderboard" icon="🏆" />} />
                <Route path="/profile" element={<Placeholder title="Profile" icon="👤" />} />

              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;