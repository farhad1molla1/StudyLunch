import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getSession, confirmSession } from '../../services/sessionService';
import { useAuth } from '../../hooks/useAuth';

// Reusable Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Badge from '../../components/common/Badge/Badge';

const SessionConfirmation = () => {
  const { id } = useParams(); // sessionId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const data = await getSession(id);
      
      if (!data) throw new Error('Session not found.');
      
      if (user.uid !== data.learnerId && user.uid !== data.mentorId) {
        throw new Error('Unauthorized. You are not a participant in this session.');
      }

      setSession(data);
    } catch (err) {
      setError(err.message || 'Failed to load session details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchSessionData();
    }
  }, [id, user]);

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      const result = await confirmSession(id, user.uid);
      
      toast.success('Attendance confirmed successfully!');
      
      if (result.status === 'ready') {
        toast.success('Both participants have confirmed. Session is READY!', { icon: '🔥' });
      }

      // Refresh data to update UI
      fetchSessionData();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm session.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading && !confirming && !session) return <Loader variant="page" />;

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <EmptyState icon="🔒" title="Access Denied" description={error} />
        <Button onClick={() => navigate('/dashboard')} variant="outline" style={{ marginTop: '16px' }}>Go Back</Button>
      </div>
    );
  }

  // Determine User Role & Status
  const isLearner = user.uid === session.learnerId;
  const role = isLearner ? 'learner' : 'mentor';
  const otherRole = isLearner ? 'mentor' : 'learner';
  
  const hasConfirmed = session.confirmation[role];
  const otherHasConfirmed = session.confirmation[otherRole];
  
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Not scheduled yet';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  return (
    <div style={{ padding: 'var(--space-24) var(--space-16)', maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="text-primary" style={{ marginBottom: 'var(--space-8)' }}>Session Confirmation</h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-24)' }}>
        Please review the details and confirm your attendance for this session.
      </p>

      <Card>
        {/* Status Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Meeting Details</h3>
          <Badge type={session.status === 'ready' ? 'success' : 'warning'}>
            {session.status.toUpperCase()}
          </Badge>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-16)', marginBottom: 'var(--space-32)' }}>
          <div>
            <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Scheduled For</span>
            <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
              {formatDateTime(session.scheduledTime)}
            </strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
            <div>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Duration</span>
              <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>{session.duration} Minutes</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Type</span>
              <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                {session.meetingType}
              </strong>
            </div>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              {session.meetingType === 'online' ? 'Meeting Link' : 'Meeting Location'}
            </span>
            <div style={{ 
              backgroundColor: 'var(--color-bg)', 
              padding: 'var(--space-12)', 
              borderRadius: 'var(--radius-md)', 
              marginTop: 'var(--space-4)',
              wordBreak: 'break-all'
            }}>
              {session.meetingType === 'online' ? (
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                  {session.meetingLink || 'No link provided'}
                </a>
              ) : (
                <span style={{ color: 'var(--color-text-primary)' }}>{session.meetingLocation || 'No location provided'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Status Panel */}
        <div style={{ 
          padding: 'var(--space-16)', 
          backgroundColor: session.status === 'ready' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.05)', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-24)'
        }}>
          <h4 style={{ margin: '0 0 var(--space-8) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Confirmation Status</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--text-sm)' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span>You ({role}):</span>
              <span style={{ fontWeight: 'bold', color: hasConfirmed ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {hasConfirmed ? '✅ Confirmed' : '⏳ Pending'}
              </span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ textTransform: 'capitalize' }}>Partner ({otherRole}):</span>
              <span style={{ fontWeight: 'bold', color: otherHasConfirmed ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {otherHasConfirmed ? '✅ Confirmed' : '⏳ Pending'}
              </span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        {session.status === 'scheduled' ? (
          <Button 
            variant={hasConfirmed ? "secondary" : "primary"} 
            fullWidth 
            size="large"
            onClick={handleConfirm}
            loading={confirming}
            disabled={hasConfirmed || confirming}
          >
            {hasConfirmed ? 'Waiting for the other participant...' : 'Confirm Attendance'}
          </Button>
        ) : session.status === 'ready' ? (
          <Button variant="success" fullWidth size="large" disabled>
            Session is Ready!
          </Button>
        ) : (
          <Button variant="outline" fullWidth size="large" disabled>
            Action Unavailable
          </Button>
        )}
      </Card>
    </div>
  );
};

export default SessionConfirmation;