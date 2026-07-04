import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Services
import { getAllTopics } from '../../services/topicService';
import { getSessionByTopic } from '../../services/sessionService';
import { getUserNotifications } from '../../services/notificationService';

// Common Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';

import './Dashboard.css';

// Motivation Quotes List
const MOTIVATION_QUOTES = [
  "Education is the most powerful weapon which you can use to change the world.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice.",
  "Learn as if you were to live forever.",
  "Don't let what you cannot do interfere with what you can do."
];

const Dashboard = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ created: 0, mentored: 0, completed: 0, rating: 0 });
  const [myTopics, setMyTopics] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Select random quote on mount
    setQuote(MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel for speed
        const [allTopics, allNotifications] = await Promise.all([
          getAllTopics(),
          getUserNotifications(user.uid)
        ]);

        // Process Topics
        const createdTopics = allTopics.filter(t => t.createdBy === user.uid);
        const mentoredTopics = allTopics.filter(t => t.acceptedBy === user.uid);
        
        setMyTopics(createdTopics.slice(0, 3)); // Latest 3

        // Process Stats
        const completed = [...createdTopics, ...mentoredTopics].filter(t => t.status === 'completed').length;
        // Simple rating average calculation based on mentored completed topics
        let totalRating = 0;
        const ratedTopics = mentoredTopics.filter(t => t.status === 'completed' && t.rating > 0);
        if (ratedTopics.length > 0) {
           totalRating = ratedTopics.reduce((acc, curr) => acc + curr.rating, 0) / ratedTopics.length;
        }

        setStats({
          created: createdTopics.length,
          mentored: mentoredTopics.length,
          completed: completed,
          rating: totalRating.toFixed(1)
        });

        // Process Sessions (Fetching sessions for my matched/in_progress topics)
        const activeTopics = [...createdTopics, ...mentoredTopics].filter(t => t.status === 'matched' || t.status === 'in_session');
        const sessionPromises = activeTopics.map(t => getSessionByTopic(t.id));
        const sessionResults = await Promise.all(sessionPromises);
        
        let allSessions = [];
        sessionResults.forEach(res => { allSessions = [...allSessions, ...res]; });
        
        const scheduled = allSessions
          .filter(s => s.status === 'scheduled' || s.status === 'ready')
          .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
          
        setUpcomingSessions(scheduled);

        // Process Notifications
        setNotifications(allNotifications.slice(0, 5)); // Latest 5

      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <Badge type="primary">Open</Badge>;
      case 'matched': return <Badge type="warning">Matched</Badge>;
      case 'in_session': return <Badge type="success">Active</Badge>;
      case 'completed': return <Badge type="error">Completed</Badge>;
      default: return null;
    }
  };

  if (loading) return <Loader variant="page" />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="dashboard-page">
      
      {/* 1. Welcome Section */}
      <div className="dash-welcome-card">
        <div className="dash-user-info">
          <div className="dash-avatar">
            {dbUser?.photoURL ? (
              <img src={dbUser.photoURL} alt="Profile" />
            ) : (
              <div className="dash-avatar-fallback">{dbUser?.name?.charAt(0) || user.email?.charAt(0) || 'U'}</div>
            )}
          </div>
          <div>
            <h1 className="dash-greeting">{getGreeting()}, {dbUser?.name || 'Student'}! 👋</h1>
            <p className="dash-subtitle">{dbUser?.university || 'Welcome to StudyLunch'}</p>
          </div>
        </div>
      </div>

      {/* 7. Motivation Quote */}
      <div className="dash-motivation">
        <span className="quote-icon">💡</span>
        <p>"{quote}"</p>
      </div>

      <div className="dash-grid">
        {/* LEFT COLUMN: Main Content */}
        <div className="dash-main">
          
          {/* 2. Quick Actions */}
          <section className="dash-section">
            <h2 className="dash-section-title">Quick Actions</h2>
            <div className="dash-quick-actions">
              <Card variant="elevated" clickable onClick={() => navigate('/topics/create')} className="action-card action-create">
                <span className="action-icon">➕</span>
                <span className="action-text">Create Topic</span>
              </Card>
              <Card variant="elevated" clickable onClick={() => navigate('/topics')} className="action-card action-browse">
                <span className="action-icon">🔍</span>
                <span className="action-text">Browse Topics</span>
              </Card>
              <Card variant="elevated" clickable onClick={() => navigate('/notifications')} className="action-card action-notify">
                <span className="action-icon">🔔</span>
                <span className="action-text">Alerts</span>
                {unreadCount > 0 && <span className="notify-badge">{unreadCount}</span>}
              </Card>
            </div>
          </section>

          {/* 3. My Active Topics */}
          <section className="dash-section">
            <div className="section-header">
              <h2 className="dash-section-title">My Recent Topics</h2>
              <button className="view-all-btn" onClick={() => navigate('/profile')}>View All</button>
            </div>
            {myTopics.length === 0 ? (
               <Card><EmptyState icon="📝" title="No topics yet" description="You haven't requested any help recently." /></Card>
            ) : (
              <div className="dash-list">
                {myTopics.map(topic => (
                  <Card key={topic.id} variant="default" hoverable onClick={() => navigate(`/topics/${topic.id}`)} className="list-item-card">
                    <div className="list-item-content">
                      <h4 className="item-title">{topic.title}</h4>
                      <span className="item-subtitle">{topic.subject}</span>
                    </div>
                    <div>{getStatusBadge(topic.status)}</div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* 4. Upcoming Sessions */}
          <section className="dash-section">
            <h2 className="dash-section-title">Upcoming Sessions</h2>
            {upcomingSessions.length === 0 ? (
               <Card><EmptyState icon="📅" title="No upcoming sessions" description="You don't have any sessions scheduled right now." /></Card>
            ) : (
              <div className="dash-list">
                {upcomingSessions.map(session => {
                  const date = new Date(session.scheduledTime);
                  return (
                    <Card key={session.id} variant="elevated" hoverable onClick={() => navigate(`/sessions/${session.id}/confirm`)} className="session-card">
                      <div className="session-date-box">
                        <span className="month">{date.toLocaleString('default', { month: 'short' })}</span>
                        <span className="day">{date.getDate()}</span>
                      </div>
                      <div className="session-info">
                        <h4 className="item-title">{session.meetingType === 'online' ? 'Virtual Meeting' : 'In-Person Session'}</h4>
                        <span className="item-subtitle">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.duration} mins</span>
                      </div>
                      <Badge type={session.status === 'ready' ? 'success' : 'warning'}>{session.status}</Badge>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="dash-sidebar">
          
          {/* 6. Learning Statistics */}
          <section className="dash-section">
            <h2 className="dash-section-title">Your Stats</h2>
            <Card variant="glass" className="stats-card">
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-value">{stats.created}</span>
                  <span className="stat-label">Asked</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value text-success">{stats.mentored}</span>
                  <span className="stat-label">Mentored</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value text-primary">{stats.completed}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value text-warning">⭐ {stats.rating}</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </Card>
          </section>

          {/* 5. Recent Notifications */}
          <section className="dash-section">
            <div className="section-header">
              <h2 className="dash-section-title">Recent Alerts</h2>
              <button className="view-all-btn" onClick={() => navigate('/notifications')}>All</button>
            </div>
            <Card variant="default" className="notify-list-card">
              {notifications.length === 0 ? (
                <p className="text-secondary text-center" style={{ fontSize: 'var(--text-sm)' }}>No new alerts.</p>
              ) : (
                <ul className="mini-notify-list">
                  {notifications.map(notify => (
                    <li key={notify.id} className={notify.isRead ? 'read' : 'unread'}>
                      <span className="notify-dot"></span>
                      <p>{notify.title}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;