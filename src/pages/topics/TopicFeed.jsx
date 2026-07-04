import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTopics } from '../../services/topicService';

// Reusable Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';

import './TopicFeed.css';

const TopicFeed = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetching topics via the Service Layer (Newest first is handled in the service)
      const data = await getAllTopics();
      setTopics(data);
    } catch (err) {
      setError(err.message || 'Failed to load topics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Utility: Truncate description to 120 characters
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Utility: Convert Firestore timestamp to relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Utility: Get styling for different statuses using existing Badge types
  const getBadgeConfig = (status) => {
    switch (status) {
      case 'open':
        return { type: 'primary', label: 'Open' };
      case 'matched':
        return { type: 'warning', label: 'Matched' };
      case 'in_session':
        return { type: 'success', label: 'In Session' };
      case 'completed':
        return { type: 'error', label: 'Completed' }; // Using error type for distinct styling
      default:
        return { type: 'primary', label: status || 'Unknown' };
    }
  };

  // State 1: Loading
  if (loading) {
    return <Loader variant="page" />;
  }

  // State 2: Error
  if (error) {
    return (
      <div className="topic-feed-page center-content">
        <div className="error-container text-center">
          <h2 className="text-danger mb-16">Oops! Something went wrong.</h2>
          <p className="text-secondary mb-24">{error}</p>
          <Button onClick={fetchTopics} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  // State 3: Empty State
  if (topics.length === 0) {
    return (
      <div className="topic-feed-page center-content">
        <EmptyState 
          icon="📚" 
          title="No learning requests yet." 
          description="Be the first learner to ask for help."
        />
      </div>
    );
  }

  // State 4: Feed Display
  return (
    <div className="topic-feed-page">
      <div className="topic-feed-header">
        <h1 className="text-primary">Topic Feed</h1>
        <p className="text-secondary">Discover students who need help and share your knowledge.</p>
      </div>

      <div className="topic-feed-grid">
        {topics.map((topic) => {
          const badgeConfig = getBadgeConfig(topic.status);
          const participantsCount = topic.participants ? topic.participants.length : 0;

          return (
            <Card 
              key={topic.id} 
              variant="default" 
              hoverable
              className="topic-card"
              footer={
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  View Details
                </Button>
              }
            >
              {/* Card Header Section */}
              <div className="topic-card-header flex space-between">
                <div>
                  <h3 className="topic-title">{topic.title}</h3>
                  <span className="topic-subject">{topic.subject}</span>
                </div>
                <Badge type={badgeConfig.type}>{badgeConfig.label}</Badge>
              </div>

              {/* Creator & Time Meta */}
              <div className="topic-meta-row mb-16">
                <div className="topic-creator">
                  <span className="creator-name">{topic.creatorName || 'Anonymous'}</span>
                  <span className="dot-separator">•</span>
                  <span className="created-time">{getRelativeTime(topic.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              <p className="topic-description mb-16">
                {truncateText(topic.description)}
              </p>

              {/* Academic & Session Details Grid */}
              <div className="topic-details-grid">
                <div className="detail-item">
                  <span className="detail-label">University</span>
                  <span className="detail-value">{topic.university || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{topic.department || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Preferred Time</span>
                  <span className="detail-value">{topic.preferredTime || 'Anytime'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Participants</span>
                  <span className="detail-value">{participantsCount}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TopicFeed;