import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTopics } from '../../services/topicService';
import { getSubjectColor } from '../../utils/subjectColors';
import './TopicFeed.css';

const TopicFeed = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        const data = await getAllTopics();
        setTopics(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load topics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadTopics();
  }, []);

  if (loading) {
    return <div className="feed-loading-state">Loading topics...</div>;
  }

  return (
    <div className="dashboard-page animate-fade-up">
      <div className="feed-top-bar">
        <div>
          <h1 className="dashboard-title">Browse Topics</h1>
          <p className="feed-subtitle">Find peers to help or topics to learn together.</p>
        </div>
        <button className="btn-create-topic" onClick={() => navigate('/topics/create')}>
          + Create Topic
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--apricot-soft)', color: '#B87222', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {topics.length === 0 && !error ? (
        <div className="empty-feed-card card-3d">
          <div className="empty-feed-icon">📚</div>
          <h3>No topics found</h3>
          <p style={{ color: 'var(--text-soft)', marginTop: '8px' }}>Be the first to create a study topic!</p>
        </div>
      ) : (
        <div className="topics-grid">
          {topics.map((topic) => {
            // Safe fallback data parsing
            const subject = topic.subject || 'General';
            const status = topic.status || 'open';
            const creatorName = topic.creatorName || 'Student';
            const preferredTime = topic.preferredTime || 'Flexible';
            const skillsNeeded = Array.isArray(topic.skillsNeeded) ? topic.skillsNeeded : [];
            
            // Get consistent UI colors based on subject
            const colors = getSubjectColor(subject);

            return (
              <div 
                key={topic.id} 
                className="topic-card"
                style={{ borderLeft: `4px solid ${colors.accent}` }}
              >
                <div className="topic-card-header">
                  <span 
                    className="topic-subject" 
                    style={{ 
                      backgroundColor: colors.bg, 
                      color: colors.text, 
                      border: `1px solid ${colors.border}` 
                    }}
                  >
                    {subject}
                  </span>
                  <span className={`topic-status-badge ${status}`}>
                    {status.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="topic-title">{topic.title || 'Untitled Topic'}</h3>
                <p className="topic-preview">
                  {topic.description 
                    ? topic.description.length > 90 
                      ? `${topic.description.substring(0, 90)}...` 
                      : topic.description
                    : 'No description provided.'}
                </p>

                {skillsNeeded.length > 0 && (
                  <div className="topic-skills-row">
                    {skillsNeeded.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-chip">{skill}</span>
                    ))}
                    {skillsNeeded.length > 3 && (
                      <span className="skill-chip" style={{ background: 'transparent' }}>
                        +{skillsNeeded.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="topic-card-footer">
                  <div className="creator-info">
                    <span className="creator-name">{creatorName}</span>
                    <span className="topic-time">🕒 {preferredTime}</span>
                  </div>
                  <button 
                    className="btn-view-details"
                    onClick={() => navigate(`/topics/${topic.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicFeed;