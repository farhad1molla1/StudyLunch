import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTopics } from '../../services/topicService';
import Loader from '../../components/common/Loader/Loader';
import Badge from '../../components/common/Badge/Badge';
import './Topics.css';

// 🐱 Mascot Empty State
const MascotEmptyState = ({ title, message }) => (
  <div className="mascot-empty-state animate-fade-in">
    <div className="mascot-art animate-float">
      <span className="mascot-face">( ≽^•⩊•^≼ )</span>
    </div>
    <h3 className="heading-md">{title}</h3>
    <p className="body">{message}</p>
  </div>
);

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const data = await getAllTopics();
        setTopics(data.filter(t => t.status === 'open'));
      } catch (error) {
        console.error("Failed to load topics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) return <Loader variant="page" />;

  return (
    <div className="topics-layout animate-fade-in">
      {/* A. Page Header */}
      <header className="topics-header">
        <h1 className="heading-xl">Learning Requests</h1>
        <p className="body subtitle">Find students who need help, or discover topics you can teach.</p>
      </header>

      {/* C. Empty State */}
      {topics.length === 0 ? (
        <MascotEmptyState 
          title="No learning requests yet." 
          message="Be the first one to ask for help on StudyLunch!" 
        />
      ) : (
        /* B. Feed Layout */
        <div className="topics-grid">
          {topics.map(topic => (
            <div key={topic.id} className="topic-card-premium" onClick={() => navigate(`/topics/${topic.id}`)}>
              
              <div className="card-top">
                <Badge type="primary" className="subject-badge">{topic.subject}</Badge>
                <Badge type="success" className="status-badge">OPEN</Badge>
              </div>

              <div className="card-main">
                <h2 className="heading-md topic-title">{topic.title}</h2>
                <p className="body topic-desc-preview">
                  {topic.description?.length > 100 ? `${topic.description.substring(0, 100)}...` : topic.description}
                </p>
              </div>

              <div className="card-meta">
                <div className="meta-item">
                  <span className="meta-icon">👤</span>
                  <span className="meta-text">{topic.creatorName || 'Student'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🎓</span>
                  <span className="meta-text">{topic.department || 'CSE'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🕒</span>
                  <span className="meta-text">{topic.preferredTime || 'Anytime'}</span>
                </div>
              </div>

              <div className="card-footer">
                <div className="skills-container">
                  {topic.skillsNeeded && topic.skillsNeeded.split(',').map((skill, idx) => (
                    <span key={idx} className="skill-pill">{skill.trim()}</span>
                  ))}
                </div>
                <button className="btn-view-details">View Details</button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Topics;