import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Core Providers & Layouts
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './contexts/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import PublicRoute from './components/auth/PublicRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProfileSetup from './pages/profile/ProfileSetup';

// Main Application Pages
import Dashboard from './pages/dashboard/Dashboard';
import Topics from './pages/topics/Topics';
import CreateTopic from './pages/topics/CreateTopic';
import TopicDetails from './pages/topics/TopicDetails';
import MySessions from './pages/sessions/MySessions';
import ScheduleSession from './pages/sessions/ScheduleSession';
import SessionConfirmation from './pages/sessions/SessionConfirmation';
import SessionCheckIn from './pages/sessions/SessionCheckIn';
import SessionWorkspace from './pages/sessions/SessionWorkspace';

// Other Feature Pages
import Notifications from './pages/notifications/Notifications';
import Locker from './pages/locker/Locker';
import StudyLunchSystem from './pages/studyLunch/StudyLunchSystem';
import Leaderboard from './pages/leaderboard/Leaderboard';
import Profile from './pages/profile/Profile';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("StudyLunch failed to load:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "24px",
          background: "var(--sl-bg, #f7f1e7)",
          color: "var(--sl-ink, #182b3a)",
          fontFamily: "var(--font-primary, sans-serif)",
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: "480px",
            width: "100%",
            background: "var(--sl-surface, #ffffff)",
            padding: "32px 24px",
            borderRadius: "var(--sl-radius-lg, 28px)",
            border: "1px solid var(--sl-border, #eadfcf)",
            boxShadow: "var(--sl-shadow, 0 18px 45px rgba(15, 75, 69, 0.12))"
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
            <h1 style={{ color: "var(--sl-primary, #0f6b62)", fontSize: "1.4rem", margin: "0 0 12px 0" }}>
              StudyLunch failed to load
            </h1>
            <p style={{ color: "var(--sl-muted, #6f7c83)", fontSize: "0.9rem", margin: "0 0 20px 0", wordBreak: "break-word" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "var(--sl-primary, #0f6b62)",
                color: "#ffffff",
                border: "none",
                padding: "10px 22px",
                borderRadius: "var(--sl-radius-sm, 14px)",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                borderRadius: 'var(--sl-radius-md, 20px)',
                background: 'var(--sl-surface, #ffffff)',
                color: 'var(--sl-text, #24323f)',
                boxShadow: 'var(--sl-shadow-soft, 0 10px 28px rgba(24, 43, 58, 0.08))',
                border: '1px solid var(--sl-border, #eadfcf)',
                padding: '12px 24px',
                fontWeight: '600',
              },
              success: {
                iconTheme: {
                  primary: 'var(--sl-primary, #0f6b62)',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }} 
          />
          <Routes>
            {/* =========== Public Auth Routes =========== */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* =========== Profile Setup Route =========== */}
            <Route 
              path="/profile/setup" 
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />

            {/* =========== Protected Routes with MainLayout =========== */}
            <Route 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Topic Routes */}
              <Route path="/topics" element={<Topics />} />
              <Route path="/topics/create" element={<CreateTopic />} />
              <Route path="/topics/:topicId" element={<TopicDetails />} />
              
              {/* Session Routes */}
              <Route path="/sessions" element={<MySessions />} />
              <Route path="/sessions/:sessionId" element={<Navigate to="/sessions" replace />} />
              <Route path="/sessions/:sessionId/schedule" element={<ScheduleSession />} />
              <Route path="/sessions/:sessionId/confirm" element={<SessionConfirmation />} />
              <Route path="/sessions/:sessionId/check-in" element={<SessionCheckIn />} />
              <Route path="/sessions/:sessionId/workspace" element={<SessionWorkspace />} />

              {/* Other Features */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/locker" element={<Locker />} />
              <Route path="/study-system" element={<StudyLunchSystem />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>

            {/* =========== Fallback Redirects =========== */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;