import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToSession, saveSessionNotes, requestEndSession, confirmEndSession } from '../../services/sessionService';

const SessionWorkspace = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToSession(sessionId, (data) => {
      if (data) {
        setSession(data);
        setNotes(prev => (prev === '' && data.notes) ? data.notes : prev);
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [sessionId]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontWeight: 'bold', color: 'var(--primary-dark)' }}>Loading Workspace...</div>;

  if (!session) {
    return (
      <div className="dashboard-page" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
           <h2 style={{ color: 'var(--ink-blue)', margin: '0 0 16px 0' }}>Session Not Found</h2>
           <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>This session may have been removed or doesn't exist.</p>
           <button className="btn-submit" onClick={() => navigate('/sessions')}>Return to My Sessions</button>
        </div>
      </div>
    );
  }

  if (!user) return <div className="dashboard-page">Please log in to view this session.</div>;

  const isLearner = session.learnerId === user.uid;
  const isMentor = session.mentorId === user.uid;
  if (!isLearner && !isMentor) return <div className="dashboard-page">Unauthorized access. You are not a participant.</div>;

  const rawStatus = session.status || 'scheduled';
  const status = rawStatus === 'active' ? 'in_progress' : rawStatus === 'end_requested' ? 'waiting_end_confirmation' : rawStatus;

  // STRICT GUARDS
  if (status === 'scheduled') {
    return (
      <div className="dashboard-page animate-fade-up" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
           <h2 style={{ color: 'var(--ink-blue)', margin: '0 0 16px 0' }}>This session has not started yet.</h2>
           <p style={{ color: 'var(--text-soft)', marginBottom: '24px', lineHeight: 1.5 }}>Please schedule, confirm, and check in before opening the workspace.</p>
           <button className="btn-submit" onClick={() => navigate('/sessions')}>Back to My Sessions</button>
        </div>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="dashboard-page animate-fade-up" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
           <h2 style={{ color: '#2C7A54', margin: '0 0 16px 0' }}>Session is ready for check-in.</h2>
           <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>Both users have confirmed attendance.</p>
           <button className="btn-submit" onClick={() => navigate(`/sessions/${sessionId}/check-in`)} style={{ backgroundColor: '#2C7A54' }}>Go to Check-in</button>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="dashboard-page animate-fade-up" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
           <h2 style={{ color: 'var(--text-soft)', margin: '0 0 16px 0' }}>Session Cancelled</h2>
           <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>This session was cancelled.</p>
           <button className="btn-submit" onClick={() => navigate('/sessions')} style={{ backgroundColor: 'var(--surface-cool)', color: 'var(--text-main)', border: '1px solid var(--border-soft)' }}>Back to My Sessions</button>
        </div>
      </div>
    );
  }

  const isCompleted = status === 'completed';
  const hasEndRequest = status === 'waiting_end_confirmation';
  const didIRequest = hasEndRequest && session.endRequest?.requestedBy === user.uid;

  const handleSaveNotes = async () => {
    setSaving(true);
    try { await saveSessionNotes(sessionId, notes); } 
    catch (err) { console.error("Failed to save notes", err); } 
    finally { setSaving(false); }
  };

  const handleRequestEnd = async () => {
    try { await requestEndSession(sessionId, user.uid); } 
    catch (err) { console.error("Failed to request end", err); }
  };

  const handleConfirmEnd = async () => {
    try { await confirmEndSession(sessionId, session.topicId); } 
    catch (err) { console.error("Failed to confirm end", err); }
  };

  return (
    <div className="dashboard-page animate-fade-up" style={{ paddingBottom: '60px' }}>
      <button onClick={() => navigate('/sessions')} style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', fontWeight: 700, cursor: 'pointer', marginBottom: '16px', display: 'flex', gap: '8px', padding: 0, transition: 'color 0.2s' }}>
         ← Back to My Sessions
      </button>

      <h1 className="dashboard-title" style={{ marginBottom: '12px' }}>{session.topicTitle || session.title || "Session Workspace"}</h1>

      <div style={{ marginBottom: '24px', display: 'inline-flex', padding: '8px 16px', borderRadius: '99px', background: 'var(--surface-tint)', border: '1px solid var(--border-soft)', fontWeight: '700', color: isCompleted ? '#2C7A54' : hasEndRequest ? '#B87222' : 'var(--ink-blue)', fontSize: '0.9rem' }}>
         Status: {status.replace(/_/g, ' ').toUpperCase()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="section-label" style={{ marginBottom: '0' }}>Shared Notes</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', marginTop: '-8px' }}>Both users can view and edit these notes.</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your notes here..."
            disabled={isCompleted || hasEndRequest}
            style={{ width: '100%', minHeight: '200px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-soft)', background: 'var(--surface-tint)', fontFamily: 'inherit', resize: 'vertical', fontSize: '1rem', outline: 'none' }}
          />
          {(!isCompleted && !hasEndRequest) && (
             <button className="btn-submit" onClick={handleSaveNotes} disabled={saving} style={{ alignSelf: 'flex-start' }}>
               {saving ? 'Saving...' : 'Save Notes'}
             </button>
          )}
        </div>

        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
           <h3 className="section-label" style={{ marginBottom: '0' }}>Session Controls</h3>

           {isCompleted ? (
             <div style={{ background: 'var(--mint-soft)', padding: '20px', borderRadius: '16px', border: '1px solid var(--mint)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: '#2C7A54', fontWeight: '600' }}>✅ This session is completed.</div>
                <button className="btn-submit" onClick={() => navigate('/sessions')} style={{ backgroundColor: '#2C7A54', width: '100%' }}>Back to My Sessions</button>
             </div>
           ) : hasEndRequest ? (
             didIRequest ? (
               <div style={{ background: 'var(--surface-cool)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--border-soft)', textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', color: 'var(--ink-blue)' }}>Session is waiting for end confirmation.</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', marginTop: '8px', marginBottom: '16px' }}>The other person needs to confirm before the session ends.</p>
                  <button className="btn-submit" onClick={() => navigate('/sessions')} style={{ background: 'var(--surface-tint)', color: 'var(--ink-blue)', border: '1px solid var(--border-soft)', width: '100%' }}>Back to My Sessions</button>
               </div>
             ) : (
               <div style={{ background: 'var(--apricot-soft)', padding: '24px', borderRadius: '16px', border: '1px solid #FAD1A1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontWeight: '700', color: '#B87222', fontSize: '1.1rem', margin: 0 }}>End Session Request</p>
                  <p style={{ color: '#B87222', fontSize: '0.95rem', margin: 0 }}>The other person has requested to end this session.</p>
                  <button className="btn-submit" onClick={handleConfirmEnd} style={{ width: '100%', textAlign: 'center' }}>
                    Confirm & End Session
                  </button>
               </div>
             )
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', margin: 0 }}>When you are finished learning, request to end the session. The other person will need to confirm.</p>
                <button className="btn-cancel" onClick={handleRequestEnd} style={{ width: '100%', borderColor: 'var(--apricot)', color: '#B87222', borderStyle: 'solid', borderWidth: '1px', background: 'transparent' }}>
                   Request to End Session
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SessionWorkspace;