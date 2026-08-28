import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSession, updateSessionSchedule } from '../../services/sessionService';
import './ScheduleSession.css';

const ScheduleSession = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [meetingType, setMeetingType] = useState('online');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await getSession(sessionId);
        if (data) {
          setSession(data);
          if (data.scheduledTime && data.scheduledTime !== "Not scheduled yet") {
            const parts = data.scheduledTime.split(' ');
            if (parts.length >= 2) {
              setDate(parts[0]);
              setTime(parts[1]);
            }
          }
          if (data.duration) setDuration(data.duration);
          if (data.meetingType) setMeetingType(data.meetingType);
          if (data.meetingLink) setMeetingLink(data.meetingLink);
          if (data.meetingLocation) setMeetingLocation(data.meetingLocation);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return setError("Date and time are required.");
    if (!duration || duration <= 0) return setError("Valid duration is required.");
    if (meetingType === 'online' && !meetingLink) return setError("Meeting link is required for online sessions.");
    if (meetingType === 'offline' && !meetingLocation) return setError("Meeting location is required for offline sessions.");

    setError('');
    setSaving(true);
    
    try {
      const scheduledTime = `${date} ${time}`;
      await updateSessionSchedule(sessionId, {
        scheduledTime,
        duration: parseInt(duration, 10),
        meetingType,
        meetingLink: meetingType === 'online' ? meetingLink : '',
        meetingLocation: meetingType === 'offline' ? meetingLocation : '',
        scheduledBy: user.uid
      });
      navigate(`/sessions/${sessionId}/confirm`);
    } catch (err) {
      setError("Failed to save schedule. Please try again.");
      setSaving(false);
    }
  };

  if (loading) return <div className="schedule-loading">Loading schedule details...</div>;

  if (!session || !user) {
    return (
      <div className="dashboard-page" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
          <h2 style={{ color: 'var(--ink-blue)', margin: '0 0 16px 0' }}>Session Not Found</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>This session may have been removed or doesn't exist.</p>
          <button className="btn-submit" onClick={() => navigate('/sessions')}>Back to My Sessions</button>
        </div>
      </div>
    );
  }

  const role = session.learnerId === user.uid ? "Learner" : session.mentorId === user.uid ? "Mentor" : "Participant";
  const title = session.topicTitle || "Untitled Session";
  const status = session.status || "scheduled";

  return (
    <div className="dashboard-page animate-fade-up" style={{ paddingBottom: '60px' }}>
      <button className="btn-back-link" onClick={() => navigate('/sessions')}>← Back to My Sessions</button>
      
      <div className="schedule-card card-3d">
        <div className="schedule-header">
          <div>
            <h1 className="dashboard-title" style={{ fontSize: '1.8rem' }}>Set Schedule</h1>
            <p className="schedule-subtitle">Configure time and location for <strong>{title}</strong></p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
             <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                Status: {status.replace(/_/g, ' ').toUpperCase()}
             </div>
          </div>
        </div>

        {error && <div className="status-notice warning" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

        <form className="schedule-form" onSubmit={handleSubmit}>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={status !== 'scheduled'} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required disabled={status !== 'scheduled'} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(e.target.value)} required disabled={status !== 'scheduled'} />
            </div>
            <div className="form-group">
              <label>Meeting Type</label>
              <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)} disabled={status !== 'scheduled'}>
                <option value="online">Online (Video/Audio)</option>
                <option value="offline">Offline (In-person)</option>
              </select>
            </div>
          </div>

          {meetingType === 'online' ? (
            <div className="form-group">
              <label>Meeting Link (Google Meet, Zoom, etc.)</label>
              <input type="url" placeholder="https://..." value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} required={meetingType === 'online'} disabled={status !== 'scheduled'} />
            </div>
          ) : (
            <div className="form-group">
              <label>Meeting Location</label>
              <input type="text" placeholder="Library, Cafe, Room 101..." value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)} required={meetingType === 'offline'} disabled={status !== 'scheduled'} />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/sessions')}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={saving || status !== 'scheduled'}>
              {saving ? 'Saving...' : 'Save & Continue to Confirmation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSession;