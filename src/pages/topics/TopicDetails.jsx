import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTopicById, acceptTopic } from '../../services/topicService';
import { createSession } from '../../services/sessionService';

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

  const handleAcceptTopic = async () => {
    try {
      setActionLoading(true);
      
      const topicData = await acceptTopic(topic.id, user.uid);
      
      const newSessionId = await createSession(
        topic.id, 
        topicData.createdBy, 
        user.uid             
      );
      
      alert("Successfully matched! Session created.");
      navigate(`/sessions/${newSessionId}`); 
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <h3 className="heading-md" style={{ color: 'var(--text-soft)' }}>Loading topic...</h3>
      </div>
    );
  }

  if (!topic) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <h3 className="heading-md" style={{ color: 'var(--ink-blue)' }}>Topic not found.</h3>
      </div>
    );
  }

  const isCreator = user?.uid === topic.createdBy;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="dashboard-card-cafe" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: 'var(--border-style)', padding: 'var(--space-xl)', boxShadow: 'var(--shadow-soft)' }}>
        
        <h1 className="heading-xl" style={{ color: 'var(--ink-blue)', marginBottom: '16px' }}>
          {topic.title || "Untitled Request"}
        </h1>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="focus-chip" style={{ background: 'var(--apricot-soft)', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-blue)', fontWeight: 'bold' }}>
            <span>📌</span>
            {/* Added safety check for status */}
            <span>Status: {topic.status ? topic.status.toUpperCase() : 'OPEN'}</span>
          </div>
          <div className="focus-chip" style={{ background: 'var(--mint-soft)', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-blue)', fontWeight: 'bold' }}>
            <span>📚</span>
            <span>Subject: {topic.subject || "General"}</span>
          </div>
        </div>

        <div style={{ 
          background: 'var(--surface-tint)', 
          padding: '24px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '32px',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.7), 0 4px 12px rgba(48, 39, 30, 0.03)'
        }}>
          <h3 className="heading-sm" style={{ color: 'var(--primary-dark)', marginBottom: '12px' }}>Description</h3>
          <p className="body" style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)', lineHeight: '1.6' }}>
            {topic.description || "No description provided."}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button 
            onClick={() => navigate('/topics')} 
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
            Back to Feed
          </button>
          
          {!isCreator && topic.status === 'open' && (
            <button 
              onClick={handleAcceptTopic}
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
              {actionLoading ? 'Creating Session...' : 'Accept & Help'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TopicDetails;