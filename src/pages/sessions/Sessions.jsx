import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserSessions } from '../../services/sessionService';

const Sessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getUserSessions(user.uid);
        setSessions(data);
      } catch (err) {
        console.error("Failed to load sessions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  if (loading) return <div style={{ padding: '40px', color: 'var(--ink-blue)', fontWeight: 'bold' }}>Loading Sessions...</div>;

  return (
    <div className="dashboard-page animate-fade-up">
      <h1 className="dashboard-title">My Sessions</h1>
      {sessions.length === 0 ? (
        <div className="card-3d" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
          <h2 style={{ color: 'var(--ink-blue)' }}>No active sessions.</h2>
          <p style={{ color: 'var(--text-soft)' }}>Accept a topic or create a request to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {sessions.map(session => (
            <div key={session.id} className="card-3d pressable" onClick={() => navigate(`/sessions/${session.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--ink-blue)', marginBottom: '4px' }}>Session Workspace</h3>
                <span style={{ background: 'var(--mint-soft)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 'bold' }}>{session.status}</span>
              </div>
              <button style={{ padding: '8px 16px', borderRadius: '99px', background: 'var(--surface-tint)', border: '1px solid var(--border-soft)', cursor: 'pointer', fontWeight: 'bold' }}>Enter</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;