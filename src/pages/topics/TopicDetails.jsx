import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTopicById, acceptTopic } from '../../services/topicService';
import { createSession } from '../../services/sessionService';
import { getSubjectColor } from '../../utils/subjectColors';
import './TopicDetails.css';

const TopicDetails = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const data = await getTopicById(topicId);
        if (data) setTopic(data);
        else setError("Topic not found.");
      } catch (err) {
        console.error("TopicDetails fetch error:", err);
        setError("Failed to load topic details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [topicId]);

  const handleBecomeMentor = async () => {
    if (!user) return navigate('/login');
    setProcessing(true);
    setError('');

    try {
      const acceptedData = await acceptTopic(topicId, user.uid);
      const sessionId = await createSession({
        topicId: acceptedData.id,
        topicTitle: acceptedData.title || "Learning Session",
        learnerId: acceptedData.learnerId,
        mentorId: user.uid
      });
      navigate(`/sessions/${sessionId}`);
    } catch (err) {
      console.error("Accept Flow Error:", err);
      setError(err.message || "Failed to accept topic.");
      setProcessing(false);
    }
  };

  if (loading) return <div className="details-loading">Loading details...</div>;
  
  if (error || !topic) {
    return (
      <div className="dashboard-page" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="card-3d" style={{ padding: '40px', textAlign: 'center', width: '100%', maxWidth: '500px' }}>
          <h2 style={{ color: 'var(--ink-blue)', marginBottom: '16px' }}>Oops</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>{error || "Topic could not be loaded."}</p>
          <button className="btn-submit" onClick={() => navigate('/topics')}>Back to Browse Topics</button>
        </div>
      </div>
    );
  }

  const title = topic.title || 'Untitled Topic';
  const subject = topic.subject || topic.category || 'General';
  
  // Status Normalization
  let status = (topic.status || 'open').toLowerCase();
  if (status === 'active') status = 'in_session';

  const description = topic.description || "No description provided.";
  const learnerId = topic.createdBy || topic.creatorId || topic.learnerId || "";
  const creatorName = topic.creatorName || topic.learnerName || topic.userName || "Student";
  const preferredTime = topic.preferredTime || topic.time || topic.schedule || "Flexible";
  
  const rawSkills = Array.isArray(topic.skillsNeeded) ? topic.skillsNeeded : Array.isArray(topic.skills) ? topic.skills : Array.isArray(topic.tags) ? topic.tags : [];
  const attachments = Array.isArray(topic.attachments) ? topic.attachments : [];
  
  const colors = getSubjectColor(subject);

  // FIXED MENTORSHIP ACTION CARD LOGIC
  const renderMentorCard = () => {
    if (!user) {
      return (
        <div className="mentor-action-card card-3d">
          <h3 className="mentor-card-title">Join the Café</h3>
          <p className="mentor-card-desc">Please log in to become a mentor.</p>
          <button className="btn-become-mentor" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      );
    }
    
    if (status === 'cancelled') {
      return (
        <div className="mentor-action-card card-3d">
          <h3 className="mentor-card-title">Mentorship</h3>
          <p className="mentor-card-desc">Topic cancelled.</p>
        </div>
      );
    }

    if (status === 'completed') {
      return (
        <div className="mentor-action-card card-3d">
          <h3 className="mentor-card-title">Mentorship</h3>
          <p className="mentor-card-desc">Topic completed.</p>
          <div className="status-notice success"><span>✅</span> Closed.</div>
        </div>
      );
    }

    if (status === 'in_session' || status === 'in_progress') {
      return (
        <div className="mentor-action-card card-3d">
          <h3 className="mentor-card-title">Session Active</h3>
          <p className="mentor-card-desc">Session is in progress.</p>
          <button className="btn-become-mentor" onClick={() => navigate('/sessions')}>Go to My Sessions</button>
        </div>
      );
    }

    if (status === 'matched') {
      if (user.uid === learnerId) {
        return (
          <div className="mentor-action-card card-3d">
            <h3 className="mentor-card-title">Mentor Selected</h3>
            <p className="mentor-card-desc">A session has been created for this topic.</p>
            <button className="btn-become-mentor" onClick={() => navigate('/sessions')}>Go to My Sessions</button>
          </div>
        );
      } else if (user.uid === topic.acceptedBy) {
        return (
          <div className="mentor-action-card card-3d">
            <h3 className="mentor-card-title">Your Mentorship</h3>
            <p className="mentor-card-desc">You are mentoring this topic.</p>
            <button className="btn-become-mentor" onClick={() => navigate('/sessions')}>Go to My Sessions</button>
          </div>
        );
      } else {
        return (
          <div className="mentor-action-card card-3d">
            <h3 className="mentor-card-title">Mentorship</h3>
            <p className="mentor-card-desc">Mentor already selected.</p>
            <div className="status-notice info"><span>🔒</span> Session in progress.</div>
          </div>
        );
      }
    }

    // Status is 'open'
    if (user.uid === learnerId) {
      return (
        <div className="mentor-action-card card-3d">
          <h3 className="mentor-card-title">Your Request</h3>
          <p className="mentor-card-desc">This is your request.</p>
          <div className="status-notice warning"><span>⚠️</span> Waiting for a mentor.</div>
        </div>
      );
    }

    if (!learnerId) {
      return (
        <div className="mentor-action-card card-3d">
          <h3 className="mentor-card-title">Unavailable</h3>
          <p className="mentor-card-desc">This old topic is missing learner information and cannot be accepted.</p>
        </div>
      );
    }

    return (
      <div className="mentor-action-card card-3d">
        <h3 className="mentor-card-title">Ready to help?</h3>
        <p className="mentor-card-desc">
          If you understand this topic well, you can become the mentor for this session.
        </p>
        <button 
          className="btn-become-mentor" 
          onClick={handleBecomeMentor}
          disabled={processing}
        >
          {processing ? 'Connecting...' : 'Become Mentor'}
        </button>
      </div>
    );
  };

  return (
    <div className="dashboard-page animate-fade-up" style={{ paddingBottom: '60px' }}>
      <button className="btn-back-feed" onClick={() => navigate('/topics')}>
        ← Back to Browse Topics
      </button>

      {error && (
        <div className="status-notice warning" style={{ marginBottom: '24px' }}>⚠️ {error}</div>
      )}

      <div className="topic-details-container">
        
        <div className="details-card card-3d" style={{ borderLeft: `6px solid ${colors.accent}` }}>
          <div className="details-header-row">
            <span style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
              {subject}
            </span>
            <span className={`topic-status-badge ${status}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <h1 className="details-title">{title}</h1>

          <div className="creator-meta-box">
            <div className="creator-avatar-lg">
              {creatorName ? creatorName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="meta-label">Requested By</span>
              <span className="meta-value">{creatorName}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto', textAlign: 'right' }}>
              <span className="meta-label">Preferred Time</span>
              <span className="meta-value">🕒 {preferredTime}</span>
            </div>
          </div>

          <div className="details-section">
            <h3 className="section-subheading">Description</h3>
            <p className="details-description">{description}</p>
          </div>

          {rawSkills.length > 0 && (
            <div className="details-section">
              <h3 className="section-subheading">Topics / Skills Needed</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {rawSkills.map((skill, idx) => (
                  <span key={idx} className="skill-chip-lg">{skill}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="details-section">
            <h3 className="section-subheading">Attachments</h3>
            {attachments.length > 0 ? (
              <div className="attachment-view-placeholder">
                <span>📎 {attachments.length} attachment(s) available.</span>
              </div>
            ) : (
              <div className="attachment-view-placeholder">
                <span>📎 No attachments provided.</span>
              </div>
            )}
          </div>
        </div>

        <div className="action-sidebar">
          {renderMentorCard()}
        </div>
      </div>
    </div>
  );
};

export default TopicDetails;