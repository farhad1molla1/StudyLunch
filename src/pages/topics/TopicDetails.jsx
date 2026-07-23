import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTopicById, acceptTopic } from '../../services/topicService';
import { createSession } from '../../services/sessionService';
import './TopicDetails.css';

const TopicDetails = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopicById(topicId);
        setTopic(data);
      } catch (error) {
        console.error("Error fetching topic:", error);
      } finally {
        setLoading(false);
      }
    };
    if (topicId) fetchTopic();
  }, [topicId]);

  const handleBecomeMentor = async () => {
    if (!user) {
      alert("You must be logged in to mentor a topic.");
      return;
    }

    try {
      setActionLoading(true);
      const topicData = await acceptTopic(topic.id, user.uid);
      
      const newSessionId = await createSession(
        topic.id, 
        topicData.createdBy, 
        user.uid             
      );
      
      navigate(`/sessions/${newSessionId}`);
    } catch (error) {
      console.error("Mentor acceptance failed:", error);
      alert(error.message || "Failed to accept topic.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="details-loading">Loading Topic Details...</div>;
  }

  if (!topic) {
    return (
      <div className="dashboard-page animate-fade-up">
        <div className="card-3d empty-feed-card">
          <h2 style={{ color: 'var(--ink-blue)', marginBottom: '8px' }}>Topic Not Found</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>This request may have been removed or the link is broken.</p>
          <button onClick={() => navigate('/topics')} className="btn-become-mentor" style={{ width: 'auto' }}>
            Back to Browse Topics
          </button>
        </div>
      </div>
    );
  }

  const title = topic.title || "Untitled Request";
  const subject = topic.subject || topic.category || "General";
  const status = (topic.status || "open").toLowerCase();
  const description = typeof topic.description === 'string' ? topic.description : "No description provided.";
  
  const createdBy = topic.createdBy || topic.creatorId || topic.learnerId || null;
  const creatorName = topic.creatorName || topic.learnerName || topic.userName || "Student";
  const preferredTime = topic.preferredTime || topic.time || topic.schedule || "Flexible";
  
  const rawSkills = topic.skillsNeeded || topic.skills || topic.tags;
  const skills = Array.isArray(rawSkills) ? rawSkills : [];
  
  const rawAttachments = topic.attachments;
  const attachments = Array.isArray(rawAttachments) ? rawAttachments : [];

  const isCreator = user?.uid === createdBy;

  return (
    <div className="dashboard-page animate-fade-up">
      <button onClick={() => navigate('/topics')} className="btn-back-feed">
        ← Back to Browse Topics
      </button>

      <div className="topic-details-container">
        {/* Left Column */}
        <div className="topic-main-column">
          <section className="card-3d details-card">
            <div className="details-header-row">
              <span className="topic-subject">{subject}</span>
              <span className={`topic-status-badge ${status}`}>
                {status.toUpperCase()}
              </span>
            </div>

            <h1 className="details-title">{title}</h1>

            <div className="creator-meta-box">
              <div className="creator-avatar-lg">👤</div>
              <div>
                <div className="meta-label">Requested by</div>
                <div className="meta-value">{creatorName}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="meta-label">Preferred Time</div>
                <div className="meta-value">🕒 {preferredTime}</div>
              </div>
            </div>

            <div className="details-section">
              <h3 className="section-subheading">Description</h3>
              <p className="details-description">{description}</p>
            </div>

            {skills.length > 0 && (
              <div className="details-section">
                <h3 className="section-subheading">Skills Needed</h3>
                <div className="topic-skills-row">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-chip-lg">{skill}</span>
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

          </section>
        </div>

        {/* Right Column: Mentor Action */}
        <div className="topic-sidebar-column">
          <section className="card-3d mentor-action-card">
            <h3 className="mentor-card-title">Mentorship</h3>
            <p className="mentor-card-desc">
              Ready to help? Becoming a mentor creates a dedicated study session workspace for both of you.
            </p>

            {isCreator ? (
              <div className="status-notice warning">
                <span>⚠️</span> You cannot mentor your own topic.
              </div>
            ) : status === 'open' ? (
              <button 
                onClick={handleBecomeMentor} 
                disabled={actionLoading}
                className="btn-become-mentor"
              >
                {actionLoading ? "Setting up Session..." : "Become Mentor"}
              </button>
            ) : status === 'matched' ? (
              <div className="status-notice info">
                <span>🔒</span> Mentor already selected.
              </div>
            ) : status === 'completed' ? (
              <div className="status-notice success">
                <span>✅</span> Topic completed.
              </div>
            ) : (
               <div className="status-notice info">
                 <span>ℹ️</span> Status: {status.toUpperCase()}
               </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TopicDetails;