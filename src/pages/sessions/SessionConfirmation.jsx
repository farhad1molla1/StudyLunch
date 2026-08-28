import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSession, confirmSession } from '../../services/sessionService';
import './ScheduleSession.css'; // Reuses styles from Schedule form safely

const SessionConfirmation = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
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

  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      const updated = await confirmSession(sessionId, user.uid);
      setSession(updated);
    } catch (err) {
      setError("Failed to confirm. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="schedule-loading">Loading confirmation...</div>;

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

  const title = session.topicTitle || "Untitled Session";
  const status = session.status || "scheduled";
  const scheduledTime = session.scheduledTime || "Not scheduled yet";
  const duration = session.duration || 60;
  const confirmations = session.confirmation || { learner: false, mentor: false };
  
  const isLearner = session.learnerId === user.uid;
  const isMentor = session.mentorId === user.uid;
  
  if (!isLearner && !isMentor) return <div className="dashboard-page">Unauthorized access.</div>;

  const role = isLearner ? "Learner" : "Mentor";
  const iHaveConfirmed = isLearner ? confirmations.learner : confirmations.mentor;
  const bothConfirmed = confirmations.learner && confirmations.mentor;

  return (
    <div className="dashboard-page animate-fade-up" style={{ paddingBottom: '60px' }}>
      <button className="btn-back-link" onClick={() => navigate('/sessions')}>← Back to My Sessions</button>

      <div className="schedule-card card-3d">
        <div className="schedule-header">
          <div>
            <h1 className="dashboard-title" style={{ fontSize: '1.8rem' }}>Confirm Attendance</h1>
            <p className="schedule-subtitle">Review details for <strong>{title}</strong></p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
          </div>
        </div>

        {error && <div className="status-notice warning" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          <div className="form-row">
            <div style={{ padding: '16px', background: 'var(--surface-tint)', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 700, textTransform: 'uppercase' }}>Time & Date</span>
              <div style={{ fontSize: '1.1rem', color: 'var(--ink-blue)', fontWeight: 700, marginTop: '4px' }}>{scheduledTime}</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--surface-tint)', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 700, textTransform: 'uppercase' }}>Duration</span>
              <div style={{ fontSize: '1.1rem', color: 'var(--ink-blue)', fontWeight: 700, marginTop: '4px' }}>{duration} Minutes</div>
            </div>
          </div>
          
          <div style={{ padding: '16px', background: 'var(--surface-cool)', borderRadius: '12px', border: '1px dashed var(--border-soft)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 700, textTransform: 'uppercase' }}>Location / Link ({session.meetingType || 'Unknown'})</span>
            <div style={{ fontSize: '1.05rem', color: 'var(--ink-blue)', fontWeight: 600, marginTop: '4px', wordBreak: 'break-all' }}>
              {session.meetingType === 'online' ? (session.meetingLink || "No link provided") : (session.meetingLocation || "No location provided")}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: 'var(--ink-blue)' }}>Participant Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', background: confirmations.learner ? 'var(--mint-soft)' : 'var(--surface-tint)', border: confirmations.learner ? '1px solid #2C7A54' : '1px solid var(--border-soft)' }}>
                <div style={{ fontWeight: 800, color: confirmations.learner ? '#2C7A54' : 'var(--text-soft)', fontSize: '1.1rem', marginBottom: '4px' }}>Learner</div>
                <div style={{ fontWeight: 600, color: confirmations.learner ? '#2C7A54' : 'var(--text-soft)' }}>
                  {confirmations.learner ? '✅ Confirmed' : 'Waiting...'}
                </div>
             </div>
             <div style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', background: confirmations.mentor ? 'var(--mint-soft)' : 'var(--surface-tint)', border: confirmations.mentor ? '1px solid #2C7A54' : '1px solid var(--border-soft)' }}>
                <div style={{ fontWeight: 800, color: confirmations.mentor ? '#2C7A54' : 'var(--text-soft)', fontSize: '1.1rem', marginBottom: '4px' }}>Mentor</div>
                <div style={{ fontWeight: 600, color: confirmations.mentor ? '#2C7A54' : 'var(--text-soft)' }}>
                  {confirmations.mentor ? '✅ Confirmed' : 'Waiting...'}
                </div>
             </div>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '32px' }}>
          {status === 'ready' || bothConfirmed ? (
            <div style={{ width: '100%', padding: '16px', background: 'var(--mint-soft)', color: '#2C7A54', textAlign: 'center', borderRadius: 'var(--radius-pill)', fontWeight: 700, border: '1px solid #2C7A54' }}>
              Both participants confirmed. Session is ready.
            </div>
          ) : iHaveConfirmed ? (
            <div style={{ width: '100%', padding: '16px', background: 'var(--surface-cool)', color: 'var(--text-main)', textAlign: 'center', borderRadius: 'var(--radius-pill)', fontWeight: 700, border: '1px dashed var(--border-soft)' }}>
              You have confirmed. Waiting for partner...
            </div>
          ) : (
            <button className="btn-submit" onClick={handleConfirm} disabled={confirming} style={{ width: '100%' }}>
              {confirming ? 'Confirming...' : 'Confirm My Attendance'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionConfirmation;