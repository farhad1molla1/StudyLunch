import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Services
import { getAllTopics } from '../../services/topicService';
import { getSessionByTopic } from '../../services/sessionService';

// Common Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';

import './MySessions.css';

const MySessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Categorized Sessions
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [inProgressSessions, setInProgressSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);

  useEffect(() => {
    const fetchMySessions = async () => {
      try {
        setLoading(true);

        // 1. Fetch all topics to find where user is Learner or Mentor
        const allTopics = await getAllTopics();
        const myTopics = allTopics.filter(t => t.createdBy === user.uid || t.acceptedBy === user.uid);

        // 2. Fetch sessions for these topics
        const sessionPromises = myTopics.map(async (topic) => {
          const sessions = await getSessionByTopic(topic.id);
          // Attach topic title for display purposes
          return sessions.map(s => ({ ...s, topicTitle: topic.title }));
        });

        const nestedSessions = await Promise.all(sessionPromises);
        const allMySessions = nestedSessions.flat();

        // 3. Helper to check if a date is today
        const isToday = (dateString) => {
          if (!dateString) return false;
          const d = new Date(dateString);
          const today = new Date();
          return d.getDate() === today.getDate() &&
                 d.getMonth() === today.getMonth() &&
                 d.getFullYear() === today.getFullYear();
        };

        // 4. Categorize Sessions
        const today = [];
        const upcoming = [];
        const inProgress = [];
        const completed = [];

        allMySessions.forEach(session => {
          if (session.status === 'completed') {
            completed.push(session);
          } else if (session.status === 'in_progress') {
            inProgress.push(session);
          } else if (session.status === 'scheduled' || session.status === 'ready') {
            if (isToday(session.scheduledTime)) {
              today.push(session);
            } else {
              upcoming.push(session);
            }
          }
        });

        // Sort by time
        const sortByTime = (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime);
        
        setTodaysSessions(today.sort(sortByTime));
        setUpcomingSessions(upcoming.sort(sortByTime));
        setInProgressSessions(inProgress.sort(sortByTime));
        setCompletedSessions(completed.sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))); // Newest completed first

      } catch (err) {
        console.error("Error loading sessions:", err);
        setError('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMySessions();
  }, [user]);

  const getActionConfig = (status, id) => {
    switch (status) {
      case 'scheduled':
        return { text: 'Open Schedule Details', action: () => navigate(`/sessions/${id}/schedule`), variant: 'primary' };
      case 'ready':
        return { text: 'Open Confirmation', action: () => navigate(`/sessions/${id}/confirm`), variant: 'success' };
      case 'in_progress':
        return { text: 'Resume Session', action: () => navigate(`/sessions/${id}/active`), variant: 'warning' };
      case 'completed':
        return { text: 'View Summary', action: () => navigate(`/sessions/${id}/summary`), variant: 'secondary' };
      default:
        return { text: 'View Details', action: () => navigate(`/sessions/${id}`), variant: 'outline' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled': return <Badge type="primary">Scheduled</Badge>;
      case 'ready': return <Badge type="success">Ready</Badge>;
      case 'in_progress': return <Badge type="warning">In Progress</Badge>;
      case 'completed': return <Badge type="error">Completed</Badge>;
      default: return null;
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Pending Schedule';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  // Sub-component for rendering a list of session cards
  const SessionGrid = ({ sessions, emptyMessage }) => {
    if (sessions.length === 0) {
      return (
        <Card className="empty-section-card">
          <p className="text-secondary text-center m-0">{emptyMessage}</p>
        </Card>
      );
    }

    return (
      <div className="sessions-grid">
        {sessions.map(session => {
          const role = session.learnerId === user.uid ? 'Learner' : 'Mentor';
          const actionConfig = getActionConfig(session.status, session.id);

          return (
            <Card key={session.id} variant="default" className="session-item-card">
              <div className="card-top-row">
                <Badge type={role === 'Mentor' ? 'warning' : 'primary'}>{role}</Badge>
                {getStatusBadge(session.status)}
              </div>
              
              <h3 className="session-topic-title">{session.topicTitle || 'Untitled Topic'}</h3>
              
              <div className="session-details-list">
                <div className="detail-row">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">{formatDateTime(session.scheduledTime)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">{session.meetingType === 'online' ? '💻' : '📍'}</span>
                  <span className="detail-text">
                    {session.meetingType === 'online' ? 'Virtual Meeting' : 'In-Person'}
                    {session.meetingLocation && ` - ${session.meetingLocation}`}
                  </span>
                </div>
              </div>

              <div className="session-action-wrapper">
                <Button 
                  variant={actionConfig.variant} 
                  fullWidth 
                  onClick={actionConfig.action}
                >
                  {actionConfig.text}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) return <Loader variant="page" />;

  if (error) {
    return (
      <div className="my-sessions-page center-content">
        <EmptyState icon="⚠️" title="Oops!" description={error} />
      </div>
    );
  }

  const totalSessions = todaysSessions.length + upcomingSessions.length + inProgressSessions.length + completedSessions.length;

  return (
    <div className="my-sessions-page">
      <div className="page-header">
        <h1 className="text-primary">My Sessions</h1>
        <p className="text-secondary">Manage your learning and mentoring schedule.</p>
      </div>

      {totalSessions === 0 ? (
        <div className="center-content">
          <EmptyState 
            icon="🎒" 
            title="No Sessions Yet" 
            description="You don't have any scheduled or completed sessions. Browse topics to start mentoring, or create a topic to ask for help!" 
          />
          <div style={{ marginTop: 'var(--space-16)', display: 'flex', gap: 'var(--space-12)' }}>
            <Button onClick={() => navigate('/topics/create')} variant="primary">Create Topic</Button>
            <Button onClick={() => navigate('/topics')} variant="outline">Browse Topics</Button>
          </div>
        </div>
      ) : (
        <div className="sections-container">
          
          {/* 2. Today's Sessions */}
          {(todaysSessions.length > 0 || inProgressSessions.length > 0) && (
            <section className="session-section">
              <h2 className="section-title text-primary">Today's Sessions</h2>
              <SessionGrid 
                sessions={[...inProgressSessions, ...todaysSessions]} 
                emptyMessage="No sessions today." 
              />
            </section>
          )}

          {/* 1. Upcoming */}
          <section className="session-section">
            <h2 className="section-title">Upcoming</h2>
            <SessionGrid 
              sessions={upcomingSessions} 
              emptyMessage="No upcoming sessions." 
            />
          </section>

          {/* 4. Completed */}
          {completedSessions.length > 0 && (
            <section className="session-section">
              <h2 className="section-title">Completed</h2>
              <SessionGrid 
                sessions={completedSessions} 
                emptyMessage="No completed sessions yet." 
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default MySessions;