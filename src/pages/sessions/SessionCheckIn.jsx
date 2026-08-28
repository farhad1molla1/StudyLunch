import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSession, checkInSession } from '../../services/sessionService';
import './SessionCheckIn.css'; 

const SessionCheckIn = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSession(sessionId);
        setSession(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setError('');
    try {
      const updated = await checkInSession(sessionId, user.uid);
      setSession(updated);
    } catch (err) {
      setError(err.message || "Failed to check-in. Please try again.");
      console.error(err);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) return <div className="checkin-loading">Loading check-in...</div>;

  if (!session || !user) {
    return (
      <div className="dashboard-page" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
          <h2 style={{ color: 'var(--ink-blue)', margin: '0 0 16px 0' }}>Session Not Found</h2>
          <button className="btn-submit" onClick={() => navigate('/sessions')}>Back to My Sessions</button>
        </div>
      </div>
    );
  }

  // Safe Fallbacks
  const title = session.topicTitle || "Untitled Session";
  const status = session.status === 'active' ? 'in_progress' : (session.status || "ready");
  const scheduledTime = session.scheduledTime || "Not scheduled yet";
  const duration = session.duration || 60;
  const checkInObj = session.checkIn || { learner: false, mentor: false };
  
  const isLearner = session.learnerId === user.uid;
  const isMentor = session.mentorId === user.uid;
  
  if (!isLearner && !isMentor) return <div className="dashboard-page">Unauthorized access.</div>;

  const role = isLearner ? "Learner" : "Mentor";
  const iHaveCheckedIn = isLearner ? checkInObj.learner : checkInObj.mentor;
  const bothCheckedIn = checkInObj.learner && checkInObj.mentor;
  
  // Render Check-in Buttons
  const renderAction = () => {
    if (status === 'scheduled') {
      return (
        <div className="checkin-status-block waiting">
          Both participants must confirm attendance before check-in is available.
        </div>
      );
    }

    if (status === 'in_progress' || bothCheckedIn) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div className="checkin-status-block success">
            Both participants checked in. Session is in progress!
          </div>
          <button className="btn-submit" onClick={() => navigate(`/sessions/${session.id}`)} style={{ width: '100%', background: '#D35400' }}>
            Open Workspace →
          </button>
        </div>
      );
    }
    
    if (iHaveCheckedIn) {
      return (
        <div className="checkin-status-block waiting">
          You have checked in. Waiting for partner...
        </div>
      );
    }
    
    return (
      <button className="btn-submit" onClick={handleCheckIn} disabled={checkingIn} style={{ width: '100%', background: '#2C7A54' }}>
        {checkingIn ? 'Checking In...' : 'Check In to Session'}
      </button>
    );
  };

  return (
    <div className="dashboard-page animate-fade-up" style={{ paddingBottom: '60px' }}>
      <button className="btn-back-link" onClick={() => navigate('/sessions')}>← Back to My Sessions</button>

      <div className="checkin-card card-3d">
        <div className="checkin-header">
          <div>
            <h1 className="dashboard-title" style={{ fontSize: '1.8rem' }}>Session Check-In</h1>
            <p className="checkin-subtitle">Arrive and unlock the workspace for <strong>{title}</strong></p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
          </div>
        </div>

        {error && <div className="status-notice warning" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          <div className="info-row">
            <div className="info-box">
              <span className="info-label">Time & Date</span>
              <div className="info-value">{scheduledTime}</div>
            </div>
            <div className="info-box">
              <span className="info-label">Duration</span>
              <div className="info-value">{duration} Minutes</div>
            </div>
          </div>
          
          <div className="info-box-wide">
            <span className="info-label">Location / Link ({session.meetingType || 'Unknown'})</span>
            <div className="info-value-wide">
              {session.meetingType === 'online' ? (session.meetingLink || "No link provided") : (session.meetingLocation || "No location provided")}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: 'var(--ink-blue)' }}>Participant Status</h3>
          <div className="participant-grid">
             <div className={`participant-box ${checkInObj.learner ? 'checked' : ''}`}>
                <div className="participant-role">Learner</div>
                <div className="participant-status">
                  {checkInObj.learner ? '✅ Present' : 'Awaiting Check-in...'}
                </div>
             </div>
             <div className={`participant-box ${checkInObj.mentor ? 'checked' : ''}`}>
                <div className="participant-role">Mentor</div>
                <div className="participant-status">
                  {checkInObj.mentor ? '✅ Present' : 'Awaiting Check-in...'}
                </div>
             </div>
          </div>
        </div>

        <div className="checkin-actions">
          {renderAction()}
        </div>
        
      </div>
    </div>
  );
};

export default SessionCheckIn;