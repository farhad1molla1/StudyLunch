import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTopicById, acceptTopic } from '../../services/topicService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader/Loader';
import Badge from '../../components/common/Badge/Badge';
import './TopicDetails.css';

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();
  
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopicById(id);
        setTopic(data);
      } catch (error) {
        toast.error("Failed to load topic.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  const handleAccept = async () => {
    if (!topic || topic.status !== 'open') return;
    setAccepting(true);
    try {
      await acceptTopic(id, user.uid, dbUser.name);
      toast.success("Awesome! You are now the mentor.");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to accept topic.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return <Loader variant="page" />;
  if (!topic) return <div className="animate-fade-in"><h2 className="heading-md">Topic not found</h2></div>;

  const isCreator = user.uid === topic.createdBy;
  const isMatched = topic.status !== 'open';

  return (
    <div className="topic-details-layout animate-fade-in">
      
      {/* A. Hero Header */}
      <div className="details-hero">
        <Badge type="primary" className="hero-badge">{topic.subject}</Badge>
        <h1 className="heading-xl">{topic.title}</h1>
        <div className="hero-meta">
          <Badge type={isMatched ? "warning" : "success"}>{topic.status.toUpperCase()}</Badge>
          <span className="meta-time">Posted on {new Date(topic.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="details-bento-grid">
        
        {/* LEFT COLUMN: Context */}
        <div className="details-main">
          
          {/* C. Problem Description */}
          <div className="details-card-premium">
            <h3 className="heading-md section-title">📝 Description</h3>
            <p className="body description-text">{topic.description || "No description provided."}</p>
          </div>

          {/* D. Skills Needed */}
          <div className="details-card-premium">
            <h3 className="heading-md section-title">🎯 Skills Needed</h3>
            <div className="skills-container">
              {topic.skillsNeeded ? topic.skillsNeeded.split(',').map((skill, idx) => (
                <span key={idx} className="skill-pill-large">{skill.trim()}</span>
              )) : <p className="body">No specific skills mentioned.</p>}
            </div>
          </div>

          {/* E. Attachments */}
          <div className="details-card-premium">
            <h3 className="heading-md section-title">📎 Attachments</h3>
            <div className="attachment-view-placeholder">
              <p className="caption">No files attached to this request.</p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="details-sidebar">
          
          {/* B. Learner Card */}
          <div className="details-card-premium learner-card">
            <div className="learner-avatar">
              {topic.creatorName?.charAt(0) || 'S'}
            </div>
            <div className="learner-info">
              <h4 className="heading-md">{topic.creatorName}</h4>
              <p className="caption">Learner</p>
            </div>
            <div className="learner-meta">
              <p className="body">🎓 {topic.university || 'N/A'}</p>
              <p className="body">📖 {topic.department || 'N/A'}</p>
            </div>
          </div>

          {/* F. Mentor Action Card */}
          <div className="details-card-premium action-card">
            <h3 className="heading-md">Ready to help?</h3>
            <p className="body">Share your knowledge and earn credits by mentoring this student.</p>
            
            <div className="action-button-wrapper">
              {isCreator ? (
                <button className="btn-disabled" disabled>You cannot mentor your own topic</button>
              ) : isMatched ? (
                <button className="btn-disabled" disabled>Mentor Already Selected</button>
              ) : (
                <button className="btn-action-premium" onClick={handleAccept} disabled={accepting}>
                  {accepting ? 'Processing...' : '🚀 Become Mentor'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopicDetails;