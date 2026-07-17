import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// ⚠️ Keep your existing service imports here
import Loader from '../../components/common/Loader/Loader';
import Badge from '../../components/common/Badge/Badge';
import './MySessions.css';

const MascotEmptyState = () => (
  <div className="mascot-empty-state animate-fade-in">
    <div className="mascot-art animate-float">
      <span className="mascot-face">( ≽^•⩊•^≼ )</span>
    </div>
    <h3 className="heading-md">No sessions yet.</h3>
    <p className="body">Start by creating or accepting a learning request!</p>
  </div>
);

const MySessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ Keep your existing fetching logic here. Mocking for UI representation.
  useEffect(() => {
    setTimeout(() => setLoading(false), 500); // Simulated load
  }, []);

  if (loading) return <Loader variant="page" />;

  return (
    <div className="sessions-layout animate-fade-in">
      <header className="page-header">
        <h1 className="heading-xl">My Learning Sessions</h1>
        <p className="body subtitle">Track your scheduled, active, and completed sessions.</p>
      </header>

      {sessions.length === 0 ? (
        <MascotEmptyState />
      ) : (
        <div className="sessions-bento">
          {/* Implement your grouping logic (Upcoming, Active, Completed) over this UI */}
          {sessions.map(session => (
            <div key={session.id} className="session-premium-card hover-lift">
              <div className="s-card-top">
                <Badge type="primary">{session.role === 'mentor' ? 'Mentor' : 'Learner'}</Badge>
                <Badge type="warning">{session.status}</Badge>
              </div>
              <div className="s-card-main">
                <h3 className="heading-md">{session.topicTitle || 'Session Topic'}</h3>
                <p className="body">📅 {new Date(session.scheduledTime).toLocaleDateString()} • 🕒 {new Date(session.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="body caption">📍 {session.meetingType === 'online' ? 'Virtual Meeting' : 'In-Person'}</p>
              </div>
              <div className="s-card-action">
                <button className="btn-action-premium" onClick={() => navigate(`/sessions/${session.id}`)}>Open Session</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySessions;