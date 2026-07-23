import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTopics } from '../../services/topicService';
import './TopicFeed.css'; // Leaving untouched as requested

const TopicFeed = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added explicit error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllTopics();
        
        // Ensure data is strictly an array to prevent .map crashes
        setTopics(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError(err.message || "Could not load topics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="feed-loading-state">
        Loading Learning Requests...
      </div>
    );
  }

  // Crash-Proof Error UI instead of White Screen
  if (error) {
    return (
      <div className="dashboard-page animate-fade-up">
        <div className="card-3d empty-feed-card" style={{ borderLeft: '4px solid #B87222' }}>
          <h2 style={{ color: 'var(--ink-blue)', marginBottom: '8px' }}>Oops!</h2>
          <p style={{ color: 'var(--text-soft)' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-create-topic" style={{ marginTop: '16px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-up">
      <div className="feed-top-bar">
        <div>
          <h1 className="dashboard-title">Browse Topics</h1>
          <p className="feed-subtitle">Find a student to help today.</p>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="card-3d empty-feed-card">
          <div className="empty-feed-icon">📚</div>
          <h2 style={{ color: 'var(--ink-blue)', marginBottom: '8px', fontSize: '1.4rem' }}>No learning requests yet.</h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>
            Be the first one to ask for help.
          </p>
          <button onClick={() => navigate('/topics/create')} className="btn-create-topic">
            Create Topic
          </button>
        </div>
      ) : (
        <div className="topics-grid">
          {topics.map(topic => {
            // CRASH-PROOFING: Safe extraction of every single variable before rendering
            if (!topic || !topic.id) return null; 

            const title = topic.title || "Untitled Request";
            const subject = topic.subject || "General";
            const status = topic.status || "open";
            const creatorName = topic.creatorName || "Student";
            const preferredTime = topic.preferredTime || "";
            
            // Safe description formatting
            const rawDesc = typeof topic.description === 'string' ? topic.description : "No description provided.";
            const previewDesc = rawDesc.length > 110 ? `${rawDesc.substring(0, 110)}...` : rawDesc;
            
            // Safe array extraction
            const skills = Array.isArray(topic.skillsNeeded) ? topic.skillsNeeded : [];

            return (
              <div key={topic.id} className="card-3d topic-card">
                <div className="topic-card-header">
                  <span className="topic-subject">{subject}</span>
                  <span className={`topic-status-badge ${status}`}>
                    {status.toUpperCase()}
                  </span>
                </div>

                <h3 className="topic-title">{title}</h3>
                
                <p className="topic-preview">{previewDesc}</p>

                {skills.length > 0 && (
                  <div className="topic-skills-row">
                    {skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-chip">{skill}</span>
                    ))}
                  </div>
                )}

                <div className="topic-card-footer">
                  <div className="creator-info">
                    <span className="creator-avatar">👤</span>
                    <span className="creator-name">{creatorName}</span>
                    {preferredTime && (
                      <span className="topic-time"> • 🕒 {preferredTime}</span>
                    )}
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