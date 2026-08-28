import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToUserSessions } from '../../services/sessionService';
import './MySessions.css';

const MySessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsubscribe = subscribeToUserSessions(user.uid, (data) => {
      const statusPriority = { 'in_progress': 1, 'ready': 2, 'scheduled': 3, 'waiting_end_confirmation': 4, 'completed': 5, 'cancelled': 6 };

      const sortedData = [...data].sort((a, b) => {
        const rawStatusA = a.status || 'scheduled';
        const normStatusA = rawStatusA === 'active' ? 'in_progress' : rawStatusA === 'end_requested' ? 'waiting_end_confirmation' : rawStatusA;
        const rawStatusB = b.status || 'scheduled';
        const normStatusB = rawStatusB === 'active' ? 'in_progress' : rawStatusB === 'end_requested' ? 'waiting_end_confirmation' : rawStatusB;
        
        const priorityA = statusPriority[normStatusA] || 99;
        const priorityB = statusPriority[normStatusB] || 99;
        
        if (priorityA !== priorityB) return priorityA - priorityB;
        
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setSessions(sortedData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="sessions-loading">Loading your sessions...</div>;

  if (!user) {
    return (
      <div className="dashboard-page" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
          <h2 style={{ color: 'var(--ink-blue)', marginBottom: '16px' }}>Please Log In</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>Log in to view your learning and mentoring sessions.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => {
    const rawStatus = (s.status || 'scheduled').toLowerCase();
    const stat = rawStatus === 'active' ? 'in_progress' : rawStatus;
    return stat !== 'completed' && stat !== 'cancelled';
  });
  
  const pastSessions = sessions.filter(s => {
    const rawStatus = (s.status || 'scheduled').toLowerCase();
    const stat = rawStatus === 'active' ? 'in_progress' : rawStatus;
    return stat === 'completed' || stat === 'cancelled';
  });
  
  const displayedSessions = activeTab === 'active' ? activeSessions : pastSessions;

  return (
    <div className="dashboard-page animate-fade-up" style={{ paddingBottom: '60px' }}>
      <div className="sessions-header">
        <h1 className="dashboard-title">My Sessions</h1>
        <p className="sessions-subtitle">Track the study sessions where you are learning or helping.</p>
      </div>

      <div className="sessions-tabs">
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          Active ({activeSessions.length})
        </button>
        <button className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
          Past ({pastSessions.length})
        </button>
      </div>

      {displayedSessions.length === 0 ? (
        <div className="empty-state-card card-3d">
          <div className="empty-icon">🎒</div>
          <h3 className="empty-title">No sessions yet</h3>
          <p className="empty-desc">Create a topic or help someone from Browse Topics to start a StudyLunch session.</p>
          <div className="empty-actions">
            <button className="btn-primary" onClick={() => navigate('/topics')}>Browse Topics</button>
            <button className="btn-secondary" onClick={() => navigate('/topics/create')}>Create Topic</button>
          </div>
        </div>
      ) : (
        <div className="sessions-grid">
          {displayedSessions.map((session) => {
            const title = session.topicTitle || session.title || "Untitled Study Session";
            const rawStatus = session.status || 'scheduled';
            const status = rawStatus === 'active' ? 'in_progress' : rawStatus === 'end_requested' ? 'waiting_end_confirmation' : rawStatus;
            
            const scheduledTime = session.scheduledTime || "Not scheduled yet";
            const isLearner = session.learnerId === user.uid;
            const isMentor = session.mentorId === user.uid;
            const role = isLearner && isMentor ? "Participant" : isLearner ? "Learner" : "Mentor";
            
            let meetingInfo = "Meeting details not set";
            if (session.meetingType === 'online' && session.meetingLink) meetingInfo = "Online Link Available";
            if (session.meetingType === 'offline' && session.meetingLocation) meetingInfo = session.meetingLocation;
            
            let createdDateStr = "Unknown Date";
            if (session.createdAt && typeof session.createdAt.toDate === 'function') {
              createdDateStr = session.createdAt.toDate().toLocaleDateString();
            }

            // FIXED ROUTING MATRIX
            const hasSchedule = session.scheduledTime && session.scheduledTime !== "Not scheduled yet";
            
            const actionConfig = {
              'scheduled': { 
                label: hasSchedule ? 'Confirm Attendance' : 'Set Schedule', 
                color: hasSchedule ? '#B87222' : 'var(--primary)',
                path: hasSchedule ? `/sessions/${session.id}/confirm` : `/sessions/${session.id}/schedule`
              },
              'ready': { 
                label: 'Check In', 
                color: '#2C7A54', 
                path: `/sessions/${session.id}/check-in` 
              },
              'in_progress': { 
                label: 'Open Workspace', 
                color: '#D35400', 
                path: `/sessions/${session.id}/workspace` 
              },
              'waiting_end_confirmation': { 
                label: 'Ending...', 
                color: '#B87222', 
                path: `/sessions/${session.id}/workspace` 
              },
              'completed': { label: 'Completed', color: 'var(--ink-blue)', path: null },
              'cancelled': { label: 'Cancelled', color: 'var(--text-soft)', path: null }
            };

            const action = actionConfig[status] || { label: 'View Session', color: 'var(--text-soft)', path: null };

            return (
              <div key={session.id} className="session-card card-3d">
                <div className="session-card-header">
                  <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
                  <span className={`status-badge ${status}`}>
                    {status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <h3 className="session-title">{title}</h3>
                
                <div className="session-meta">
                  <span className="meta-icon">🕒</span> 
                  {scheduledTime !== "Not scheduled yet" ? scheduledTime : `Created: ${createdDateStr}`}
                </div>
                <div className="session-meta">
                  <span className="meta-icon">📍</span> 
                  {meetingInfo}
                </div>

                {status === 'completed' && (
                  <div className="future-ready-note">✨ Rating and appreciation will be available from summary.</div>
                )}

                {status !== 'cancelled' ? (
                  action.path ? (
                    <button 
                      className="btn-session-action" 
                      onClick={() => navigate(action.path)}
                      style={{ backgroundColor: action.color }}
                    >
                      {action.label} →
                    </button>
                  ) : (
                    <div className="disabled-action-note" style={{
                      marginTop: '24px', padding: '14px', borderRadius: 'var(--radius-pill)',
                      textAlign: 'center', fontWeight: '700', backgroundColor: 'var(--surface-cool)',
                      color: action.color, border: `1px dashed ${action.color}`
                    }}>
                      {action.label}
                    </div>
                  )
                ) : (
                  <div className="cancelled-note">This session was cancelled.</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySessions;