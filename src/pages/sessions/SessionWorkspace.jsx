import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  getSessionById, 
  saveSessionNotes, 
  requestEndSession, 
  confirmEndSession 
} from '../../services/sessionService';
import { completeTopic } from '../../services/topicService';

const SessionWorkspace = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSessionById(sessionId);
        setSession(data);
        setNotes(data.notes || "");
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchSession();
  }, [sessionId]);

  const handleSaveNotes = async () => {
    try {
      await saveSessionNotes(sessionId, notes);
      alert("Notes saved successfully!");
    } catch (error) {
      alert("Failed to save notes.");
    }
  };

  const handleRequestEnd = async () => {
    try {
      setActionLoading(true);
      await requestEndSession(sessionId, user.uid);
      setSession({ ...session, status: 'waiting_end_confirmation' });
      alert("End request sent to your partner.");
    } catch (error) {
      alert("Failed to send request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmEnd = async () => {
    try {
      setActionLoading(true);
      // Completes the session document
      await confirmEndSession(sessionId);
      // Completes the parent topic document
      await completeTopic(session.topicId);
      
      alert("Session Completed successfully!");
      navigate(`/sessions/${sessionId}/summary`);
    } catch (error) {
      alert("Failed to confirm end.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <h3 className="heading-md" style={{ color: 'var(--text-soft)' }}>Loading Workspace...</h3>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <h3 className="heading-md" style={{ color: 'var(--ink-blue)' }}>Session not found.</h3>
      </div>
    );
  }

  const isMentor = user?.uid === session.mentorId;
  const isLearner = user?.uid === session.learnerId;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="dashboard-card-cafe" style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: 'var(--border-style)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-soft)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 className="heading-lg" style={{ color: 'var(--ink-blue)', margin: 0 }}>
            Study Workspace
          </h1>
          <div className="focus-chip" style={{ background: 'var(--mint-soft)', padding: '8px 16px', borderRadius: 'var(--radius-full)', color: 'var(--ink-blue)', fontWeight: 'bold' }}>
            Status: {session.status.toUpperCase().replace(/_/g, ' ')}
          </div>
        </div>

        <div style={{ 
          background: 'var(--surface-tint)', 
          padding: '24px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '32px',
          border: 'var(--border-style)'
        }}>
          <h3 className="heading-sm" style={{ color: 'var(--primary-dark)', marginBottom: '12px' }}>Shared Notes</h3>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your study notes here..."
            style={{ 
              width: '100%', 
              minHeight: '200px', 
              padding: '16px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-soft)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-secondary)',
              fontSize: '1rem',
              resize: 'vertical',
              marginBottom: '16px'
            }}
          />
          <button 
            onClick={handleSaveNotes}
            style={{ 
              padding: '10px 20px', 
              borderRadius: 'var(--radius-full)', 
              background: 'var(--primary-soft)', 
              color: 'var(--ink-blue)', 
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer' 
            }}
          >
            Save Notes
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: 'var(--border-style)', paddingTop: '24px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/sessions')} 
            style={{ 
              padding: '12px 24px', 
              borderRadius: 'var(--radius-full)', 
              border: 'var(--border-style)', 
              background: 'transparent', 
              color: 'var(--text-soft)',
              fontWeight: '700',
              cursor: 'pointer' 
            }}
          >
            Back to Sessions
          </button>
          
          {session.status !== 'waiting_end_confirmation' && session.status !== 'completed' && isMentor && (
            <button 
              onClick={handleRequestEnd}
              disabled={actionLoading}
              style={{ 
                background: 'var(--apricot)', 
                color: 'var(--ink-blue)', 
                border: 'none', 
                borderRadius: 'var(--radius-full)', 
                padding: '12px 32px', 
                fontWeight: '700', 
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-3d)'
              }}
            >
              {actionLoading ? 'Processing...' : 'Request End Session'}
            </button>
          )}

          {session.status === 'waiting_end_confirmation' && isLearner && (
            <button 
              onClick={handleConfirmEnd}
              disabled={actionLoading}
              style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
                color: 'white', 
                border: 'none', 
                borderRadius: 'var(--radius-full)', 
                padding: '12px 32px', 
                fontWeight: '700', 
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-3d)'
              }}
            >
              {actionLoading ? 'Completing...' : 'Confirm Session End'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionWorkspace;