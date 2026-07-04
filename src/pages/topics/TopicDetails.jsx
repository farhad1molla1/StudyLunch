import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Import Toast
import { getTopicById, acceptTopic } from '../../services/topicService';
import { useAuth } from '../../hooks/useAuth';

// Common Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';

import './TopicDetails.css';

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false); // Accepting loading state
  const [error, setError] = useState('');

  // Wrap fetch function in useCallback so we can reuse it to refresh data
  const fetchTopicDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTopicById(id);
      setTopic(data);
    } catch (err) {
      setError(err.message || 'Failed to load topic details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTopicDetails();
    }
  }, [fetchTopicDetails, id]);

  // Handle Mentor Acceptance
  const handleAcceptMentor = async () => {
    if (!user) return;
    
    try {
      setAccepting(true);
      await acceptTopic(id, user.uid);
      
      toast.success('🎉 You are now the mentor for this session.');
      
      // Refresh the page data silently to update UI to "matched" state
      const updatedData = await getTopicById(id);
      setTopic(updatedData);
    } catch (err) {
      toast.error(err.message || 'Failed to accept topic.');
    } finally {
      setAccepting(false);
    }
  };

  const getBadgeConfig = (status) => {
    switch (status) {
      case 'open': return { type: 'primary', label: 'Open' };
      case 'matched': return { type: 'warning', label: 'Matched' };
      case 'in_session': return { type: 'success', label: 'In Session' };
      case 'completed': return { type: 'error', label: 'Completed' };
      default: return { type: 'primary', label: status || 'Unknown' };
    }
  };

  if (loading && !accepting && !topic) return <Loader variant="page" />;

  if (error) {
    return (
      <div className="topic-details-page center-content">
        <div className="error-container text-center">
          <h2 className="text-danger mb-16">Oops!</h2>
          <p className="text-secondary mb-24">{error}</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-details-page center-content">
        <EmptyState 
          icon="🔍" 
          title="Topic Not Found" 
          description="The learning request you are looking for does not exist or has been removed."
        />
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Button onClick={() => navigate('/dashboard')} variant="primary">Return Home</Button>
        </div>
      </div>
    );
  }

  // Action Button Logic
  const badgeConfig = getBadgeConfig(topic.status);
  const isCreator = user?.uid === topic.createdBy;
  const isOpen = topic.status === 'open';

  let buttonText = 'Become Mentor';
  let buttonDisabled = false;

  if (isCreator) {
    buttonText = 'You cannot mentor your own topic.';
    buttonDisabled = true;
  } else if (!isOpen) {
    buttonText = `Topic is ${badgeConfig.label}`;
    buttonDisabled = true;
  }

  return (
    <div className="topic-details-page">
      <div className="td-page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back to Feed
        </button>
      </div>

      <div className="td-grid">
        {/* Main Content */}
        <div className="td-main-content">
          <Card variant="default" className="td-hero-card">
            <div className="td-hero-header">
              <Badge type={badgeConfig.type}>{badgeConfig.label}</Badge>
              <span className="td-subject text-primary">{topic.subject}</span>
            </div>
            
            <h1 className="td-title">{topic.title}</h1>

            <div className="td-creator-profile">
              <div className="td-avatar">
                {topic.creatorPhoto ? (
                  <img src={topic.creatorPhoto} alt={topic.creatorName} />
                ) : (
                  <div className="td-avatar-placeholder">{topic.creatorName?.charAt(0) || 'U'}</div>
                )}
              </div>
              <div className="td-creator-info">
                <p className="td-creator-name">{topic.creatorName || 'Anonymous User'}</p>
                <p className="td-creator-role">Topic Creator</p>
              </div>
            </div>

            <div className="td-divider"></div>

            <h3 className="td-section-title">Description</h3>
            <p className="td-description">{topic.description}</p>

            <div className="td-divider"></div>

            <h3 className="td-section-title">Attachments</h3>
            <div className="td-attachments">
              {!topic.attachments || topic.attachments.length === 0 ? (
                <p className="text-secondary">No attachments provided.</p>
              ) : (
                <div className="td-attachment-list">
                  {topic.attachments.map((file, index) => (
                    <div key={index} className="td-attachment-item">
                      {file.type === 'image' ? (
                        <div className="td-image-preview">
                          <img src={file.url} alt={file.name || 'Attachment'} />
                        </div>
                      ) : (
                        <div className="td-pdf-preview">
                          <span className="pdf-icon">📄</span>
                          <span className="file-name">{file.name || 'Document.pdf'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="td-sidebar">
          
          {/* Action Card */}
          <Card variant="elevated" className="td-action-card">
            <h3 className="td-action-title">Ready to help?</h3>
            <p className="td-action-desc">Share your knowledge and earn credits by mentoring this student.</p>
            <Button 
              variant={buttonDisabled ? 'secondary' : 'primary'}
              fullWidth 
              size="large"
              loading={accepting}
              disabled={buttonDisabled || accepting}
              onClick={handleAcceptMentor}
            >
              {buttonText}
            </Button>
          </Card>

          {/* Academic & Topic Meta Details */}
          <Card variant="default" className="td-meta-card">
            <h3 className="td-meta-title">Academic Details</h3>
            <ul className="td-meta-list">
              <li>
                <span className="meta-label">University</span>
                <span className="meta-value">{topic.university || 'N/A'}</span>
              </li>
              <li>
                <span className="meta-label">Department</span>
                <span className="meta-value">{topic.department || 'N/A'}</span>
              </li>
              <li>
                <span className="meta-label">Year</span>
                <span className="meta-value">{topic.year || 'N/A'}</span>
              </li>
              <li>
                <span className="meta-label">Preferred Time</span>
                <span className="meta-value">{topic.preferredTime || 'Anytime'}</span>
              </li>
            </ul>

            <div className="td-divider"></div>

            <h3 className="td-meta-title">Skills Needed</h3>
            <div className="td-skills-list">
              {topic.skillsNeeded && topic.skillsNeeded.length > 0 ? (
                topic.skillsNeeded.map((skill, index) => (
                  <span key={index} className="td-skill-badge">{skill}</span>
                ))
              ) : (
                <span className="text-secondary">Not specified</span>
              )}
            </div>

            <div className="td-divider"></div>

            <h3 className="td-meta-title">Participants</h3>
            <div className="td-participants-list">
              <div className="td-participant-item">
                <span className="participant-role">Learner:</span>
                <span className="participant-name">{topic.creatorName || 'Anonymous'}</span>
              </div>
              
              {topic.participants && topic.participants.length > 1 && (
                <div className="td-participant-item mt-8">
                  <span className="participant-role">Mentor:</span>
                  <span className="participant-name text-success">Assigned</span>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default TopicDetails;