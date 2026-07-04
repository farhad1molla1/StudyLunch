import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../../services/notificationService';

// Reusable Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';

const Notifications = () => {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications(user.uid);
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;
    
    try {
      await markAsRead(notification.id);
      setNotifications((prev) => 
        prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      toast.error('Failed to mark as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(user.uid);
      setNotifications((prev) => 
        prev.map((n) => ({ ...n, isRead: true }))
      );
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification);
    // Future Navigation Placeholder
    toast(`Navigating to ${notification.relatedType} (ID: ${notification.relatedId})`, { icon: '🚀' });
  };

  // Utility: Relative Time
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

  // Utility: Notification Icon Config
  const getIcon = (type) => {
    switch (type) {
      case 'topic_created': return '📝';
      case 'mentor_accepted': return '🤝';
      case 'session_scheduled': return '📅';
      case 'session_confirmed': return '✅';
      case 'session_ready': return '🔥';
      default: return '🔔';
    }
  };

  if (loading) return <Loader variant="page" />;

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <EmptyState icon="⚠️" title="Oops!" description={error} />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: 'var(--space-24) var(--space-16)', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 className="text-primary" style={{ margin: 0 }}>Notifications</h1>
          <p className="text-secondary" style={{ margin: 'var(--space-4) 0 0 0', fontSize: 'var(--text-sm)' }}>
            You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState 
          icon="📭" 
          title="All caught up!" 
          description="You don't have any new notifications right now." 
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              variant="default"
              clickable
              onClick={() => handleNotificationClick(notification)}
              style={{ 
                padding: 'var(--space-16)',
                backgroundColor: notification.isRead ? 'var(--color-surface)' : 'rgba(99, 102, 241, 0.05)',
                borderLeft: notification.isRead ? 'none' : '4px solid var(--color-primary)'
              }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'flex-start' }}>
                
                {/* Icon */}
                <div style={{ 
                  fontSize: 'var(--text-2xl)', 
                  backgroundColor: 'var(--color-bg)', 
                  padding: 'var(--space-12)', 
                  borderRadius: 'var(--radius-full)' 
                }}>
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-base)' }}>
                      {notification.title}
                    </strong>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
                      {getRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                    {notification.message}
                  </p>
                </div>
                
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    marginTop: 'var(--space-8)'
                  }}></div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;