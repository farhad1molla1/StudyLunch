import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studyQuotes } from '../../data/quotes';
import { subscribeToUserTopics } from '../../services/topicService';
import { subscribeToUserSessions } from '../../services/sessionService';
import { subscribeToUserNotifications } from '../../services/notificationService';
import './Dashboard.css';

const Dashboard = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time arrays
  const [userTopics, setUserTopics] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [userAlerts, setUserAlerts] = useState([]);

  useEffect(() => {
    setQuote(studyQuotes[Math.floor(Math.random() * studyQuotes.length)]);
  }, []);

  // Real-time Dashboard Listeners
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubTopics = subscribeToUserTopics(user.uid, (data) => {
      setUserTopics(data);
      setLoading(false);
    });

    const unsubSessions = subscribeToUserSessions(user.uid, (data) => {
      setUserSessions(data);
      setLoading(false);
    });

    const unsubNotifs = subscribeToUserNotifications(user.uid, (data) => {
      setUserAlerts(data);
    });

    return () => {
      unsubTopics();
      unsubSessions();
      unsubNotifs();
    };
  }, [user]);

  // Safely calculate all metrics
  const activeSessionStatuses = ['scheduled', 'ready', 'in_progress', 'waiting_end_confirmation'];
  const activeSessions = userSessions.filter(s => activeSessionStatuses.includes(s.status));
  
  const counts = {
    sessions: activeSessions.length,
    waiting: userTopics.filter(t => t.status === 'open').length,
    alerts: userAlerts.length
  };

  const stats = {
    asked: userTopics.length,
    helped: userSessions.filter(s => s.mentorId === user?.uid && s.status === 'completed').length,
    completed: userSessions.filter(s => s.status === 'completed').length,
    trust: dbUser?.trust || dbUser?.trustScore || 0
  };

  // Determine the most urgent upcoming session
  const getUpcomingSession = () => {
    if (activeSessions.length === 0) return null;
    
    // Priority formatting
    const priority = { 'in_progress': 1, 'ready': 2, 'scheduled': 3, 'waiting_end_confirmation': 4 };
    const sorted = [...activeSessions].sort((a, b) => (priority[a.status] || 9) - (priority[b.status] || 9));
    
    return sorted[0];
  };

  const upcomingSession = getUpcomingSession();
  const displayName = dbUser?.displayName || user?.displayName || 'Student';

  if (loading && userTopics.length === 0 && userSessions.length === 0) {
    return <div className="dashboard-loading">Preparing your Café...</div>;
  }

  return (
    <div className="dashboard-page animate-fade-up">
      <h1 className="dashboard-title">Dashboard</h1>

      <section className="card-3d welcome-hero">
        <div className="hero-text-content">
          <h2>Welcome back, {displayName}!</h2>
          <p>Let’s make learning feel a little easier.</p>
        </div>
        <div className="hero-icons animate-float">🎒</div>
      </section>

      <div className="dashboard-top-grid">
        <section className="card-3d focus-section">
          <h3 className="section-label">🎯 Today's Focus</h3>
          <div className="focus-chips">
            <div className="chip sessions" onClick={() => navigate('/sessions')} style={{cursor: 'pointer'}}>
              <strong>{counts.sessions}</strong> Sessions
            </div>
            <div className="chip waiting">
              <strong>{counts.waiting}</strong> Waiting
            </div>
            <div className="chip alerts">
              <strong>{counts.alerts}</strong> Alerts
            </div>
          </div>
        </section>

        <section className="card-3d quote-section">
          <h3 className="section-label">💡 Thought for Today</h3>
          <div className="quote-text">"{quote?.text || "Learning feels easier when someone walks beside you."}"</div>
          <div className="quote-author">— {quote?.author || "StudyLunch"}</div>
        </section>
      </div>

      <div className="dashboard-main-grid">
        <section className="card-3d upcoming-wrapper">
          <h3 className="section-label">📅 Upcoming Session</h3>
          
          {upcomingSession ? (
            <div className="upcoming-active-card pressable">
              <div className="upcoming-header">
                <span className="upcoming-role">
                  {upcomingSession.mentorId === user?.uid ? "Mentor" : "Learner"}
                </span>
                <span className={`upcoming-status ${upcomingSession.status}`}>
                  {upcomingSession.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <h4 className="upcoming-title">{upcomingSession.topicTitle || "Learning Session"}</h4>
              
              <div className="upcoming-meta">
                <span className="upcoming-time">
                  🕒 {upcomingSession.scheduledTime || "Schedule pending"}
                </span>
              </div>
              
              <button 
                className="btn-enter-workspace" 
                onClick={() => navigate(`/sessions/${upcomingSession.id}`)}
              >
                Enter Workspace →
              </button>
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="css-cat-mascot">
                <div className="css-cat-ear ear-left"></div>
                <div className="css-cat-ear ear-right"></div>
                <div className="css-cat-face">^ ω ^</div>
              </div>
              <p className="empty-text">Your schedule is clear.</p>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem' }}>
                Start a learning request when you're ready.
              </p>
            </div>
          )}
        </section>

        <section className="card-3d stats-card">
          <h3 className="section-label">📊 Learning Stats</h3>
          <div className="stats-grid">
            <div className="stat-box stat-asked">
              <div className="stat-value">{stats.asked}</div>
              <div className="stat-label">Asked</div>
            </div>
            <div className="stat-box stat-helped">
              <div className="stat-value">{stats.helped}</div>
              <div className="stat-label">Helped</div>
            </div>
            <div className="stat-box stat-completed">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-box stat-trust">
              <div className="stat-value">{stats.trust}</div>
              <div className="stat-label">Trust</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;