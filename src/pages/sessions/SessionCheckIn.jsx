import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getSession, checkIn } from '../../services/sessionService';
import { getTopicById } from '../../services/topicService';
import { useAuth } from '../../hooks/useAuth';

// Reusable Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Badge from '../../components/common/Badge/Badge';

const SessionCheckIn = () => {
  const { id } = useParams(); // sessionId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState('');

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const sessionData = await getSession(id);
      
      if (!sessionData) throw new Error('Session not found.');
      
      if (user.uid !== sessionData.learnerId && user.uid !== sessionData.mentorId) {
        throw new Error('Unauthorized. You are not a participant in this session.');
      }

      // Fetch Topic to display title and subject
      const topicData = await getTopicById(sessionData.topicId);
      
      setSession(sessionData);
      setTopic(topicData);
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

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const result = await checkIn(id, user.uid);
      
      if (result.status === 'in_progress') {
        toast.success('Both participants arrived. Session Started! 🚀');
      } else {
        toast.success('Checked in successfully! Waiting for partner.');
      }

      fetchSessionData(); // Refresh to get the latest state
    } catch (err) {
      toast.error(err.message || 'Failed to check in.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading && !checkingIn && !session) return <Loader variant="page" />;

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <EmptyState icon="🛑" title="Cannot Access" description={error} />
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Determine User Role
  const isLearner = user.uid === session.learnerId;
  const role = isLearner ? 'learner' : 'mentor';
  const otherRole = isLearner ? 'mentor' : 'learner';
  
  const hasCheckedIn = session.checkIn[role];
  const otherHasCheckedIn = session.checkIn[otherRole];
  const isSessionStarted = session.status === 'in_progress';
  
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Time not set';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  return (
    <div style={{ padding: 'var(--space-24) var(--space-16)', maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="text-primary" style={{ marginBottom: 'var(--space-8)' }}>Session Check-In</h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-24)' }}>
        You must check in to officially start the session and record attendance.
      </p>

      <Card>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-16)' }}>
          <div>
            <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--text-lg)' }}>
              {topic?.title || 'Loading Topic...'}
            </h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
              {topic?.subject || 'Subject'}
            </span>
          </div>
          <Badge type={isSessionStarted ? 'success' : (session.status === 'ready' ? 'primary' : 'warning')}>
            {session.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(100, 116, 139, 0.1)', margin: 'var(--space-16) 0' }} />

        {/* Meeting Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
            <div>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Scheduled Time</span>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                {formatDateTime(session.scheduledTime)}
              </strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Meeting Type</span>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
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

        {/* Check-In Status Panel */}
        <div style={{ 
          padding: 'var(--space-16)', 
          backgroundColor: isSessionStarted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.05)', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-24)'
        }}>
          <h4 style={{ margin: '0 0 var(--space-8) 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
            Attendance Roster
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--text-sm)' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
              <span style={{ textTransform: 'capitalize' }}>You ({role}):</span>
              <span style={{ fontWeight: 'bold', color: hasCheckedIn ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {hasCheckedIn ? '✓ Arrived' : 'Not Checked In'}
              </span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ textTransform: 'capitalize' }}>Partner ({otherRole}):</span>
              <span style={{ fontWeight: 'bold', color: otherHasCheckedIn ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {otherHasCheckedIn ? '✓ Arrived' : 'Waiting...'}
              </span>
            </li>
          </ul>
        </div>

        {/* Dynamic Action Area */}
        {isSessionStarted ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
            <h2 style={{ color: 'var(--color-success)', margin: '0 0 var(--space-8) 0' }}>Session Started! 🎉</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
              The meeting is currently in progress. Have a great learning experience.
            </p>
          </div>
        ) : session.status === 'ready' ? (
          <Button 
            variant={hasCheckedIn ? "secondary" : "primary"} 
            fullWidth 
            size="large"
            onClick={handleCheckIn}
            loading={checkingIn}
            disabled={hasCheckedIn || checkingIn}
          >
            {hasCheckedIn ? 'Waiting for partner to arrive...' : 'Check In Now'}
          </Button>
        ) : (
          <Button variant="outline" fullWidth size="large" disabled>
            Check-In Unavailable
          </Button>
        )}
      </Card>
    </div>
  );
};

export default SessionCheckIn;