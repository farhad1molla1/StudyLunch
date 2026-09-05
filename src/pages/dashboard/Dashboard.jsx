import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiPlus, 
  FiBookOpen, 
  FiCalendar, 
  FiShield, 
  FiClock, 
  FiBell, 
  FiUsers, 
  FiCheckCircle, 
  FiStar, 
  FiHelpCircle 
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getAllTopics } from '../../services/topicService';
import { getSessionByTopic } from '../../services/sessionService';
import { getUserNotifications } from '../../services/notificationService';
import Loader from '../../components/common/Loader/Loader';
import { getRandomQuote } from '../../data/quotes';
import './Dashboard.css';

// 🐱 Friendly Mascot Cat Dashboard Companion
const MascotCat = () => (
  <svg width="105" height="92" viewBox="0 0 130 115" fill="none" className="mascot-cat-svg" aria-hidden="true">
    {/* Soft seated cat body */}
    <path d="M32 96 C 32 54, 88 54, 88 96 Z" fill="#FFFDF8" stroke="var(--sl-primary)" strokeWidth="2.2" strokeLinejoin="round"/>
    
    {/* Head */}
    <circle cx="60" cy="52" r="26" fill="#FFFDF8" stroke="var(--sl-primary)" strokeWidth="2.2"/>
    
    {/* Rounded Ears with soft warm tint */}
    <path d="M42 32 C 34 16, 50 19, 53 28" fill="#FFFDF8" stroke="var(--sl-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M78 32 C 86 16, 70 19, 67 28" fill="#FFFDF8" stroke="var(--sl-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="44,28 47,20 51,26" fill="#fff1c9" opacity="0.6"/>
    <polygon points="76,28 73,20 69,26" fill="#fff1c9" opacity="0.6"/>

    {/* Soft Golden Cheeks */}
    <ellipse cx="49" cy="55" rx="4" ry="2.5" fill="var(--sl-gold)" opacity="0.35" />
    <ellipse cx="71" cy="55" rx="4" ry="2.5" fill="var(--sl-gold)" opacity="0.35" />

    {/* Gentle Happy Eyes */}
    <path d="M48 51 Q 51 48 54 51" fill="none" stroke="var(--sl-primary)" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M66 51 Q 69 48 72 51" fill="none" stroke="var(--sl-primary)" strokeWidth="2.2" strokeLinecap="round"/>
    
    {/* Tiny Happy Smile */}
    <path d="M58 60 Q 60 63 62 60" fill="none" stroke="var(--sl-primary)" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Little StudyLunch Bento Box */}
    <rect x="78" y="82" width="28" height="14" rx="4" fill="var(--sl-primary-soft)" stroke="var(--sl-primary)" strokeWidth="2"/>
    <line x1="78" y1="89" x2="106" y2="89" stroke="var(--sl-primary)" strokeWidth="1.5"/>
    <rect x="83" y="84" width="7" height="3" rx="1" fill="var(--sl-gold)" opacity="0.8"/>
  </svg>
);

// Tactile empty state for upcoming sessions with mascot companion
const ScheduleEmptyState = ({ title, message, onAction, onSecondary }) => (
  <div className="schedule-empty-state-tactile">
    <div className="mascot-wrap">
      <MascotCat />
    </div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-message">{message}</p>
    <div className="empty-action-group">
      {onAction && (
        <button type="button" className="btn-tactile-primary" onClick={onAction}>
          Create request
        </button>
      )}
      <button type="button" className="btn-tactile-secondary" onClick={onSecondary}>
        View sessions
      </button>
    </div>
  </div>
);

const Dashboard = () => {
  const auth = useAuth() || {};
  const { user, currentUser, dbUser } = auth;
  const activeUser = currentUser || user;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ created: 0, mentored: 0, completed: 0, rating: '0' });
  const [myTopics, setMyTopics] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dailyQuote, setDailyQuote] = useState({
    text: "A small explanation can become someone’s turning point.",
    author: "StudyLunch"
  });

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Safe Quote Generation
        try {
          const quote = getRandomQuote();
          if (isMounted && quote && quote.text) {
            setDailyQuote({
              text: quote.text,
              author: quote.author || "StudyLunch"
            });
          }
        } catch (quoteErr) {
          console.warn("Could not load quote:", quoteErr);
        }

        const uid = activeUser?.uid;
        if (!uid) {
          if (isMounted) setLoading(false);
          return;
        }

        // 1. Safe Topics Fetch
        let allTopics = [];
        try {
          const res = await getAllTopics();
          if (Array.isArray(res)) allTopics = res;
        } catch (topicsErr) {
          console.warn("Could not load topics:", topicsErr);
        }

        // 2. Safe Notifications Fetch
        let allNotifications = [];
        try {
          const res = await getUserNotifications(uid);
          if (Array.isArray(res)) allNotifications = res;
        } catch (notifErr) {
          console.warn("Could not load notifications:", notifErr);
        }

        // Compute User Topic Stats
        const createdTopics = allTopics.filter(t => t && t.createdBy === uid);
        const mentoredTopics = allTopics.filter(t => t && t.acceptedBy === uid);
        const completed = [...createdTopics, ...mentoredTopics].filter(t => t && t.status === 'completed').length;

        let totalRating = 0;
        const ratedTopics = mentoredTopics.filter(t => t && t.status === 'completed' && Number(t.rating) > 0);
        if (ratedTopics.length > 0) {
          totalRating = ratedTopics.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) / ratedTopics.length;
        }

        if (isMounted) {
          setMyTopics(createdTopics.slice(0, 5));
          setStats({
            created: createdTopics.length,
            mentored: mentoredTopics.length,
            completed,
            rating: totalRating > 0 ? totalRating.toFixed(1) : '0'
          });
          setNotifications(allNotifications.slice(0, 5));
        }

        // 3. Safe Sessions Fetch for Active Topics
        const activeTopics = [...createdTopics, ...mentoredTopics].filter(
          t => t && (t.status === 'matched' || t.status === 'in_session')
        );

        let allSessions = [];
        if (activeTopics.length > 0) {
          try {
            const sessionPromises = activeTopics.map(async (t) => {
              try {
                const s = await getSessionByTopic(t.id);
                return Array.isArray(s) ? s : [];
              } catch {
                return [];
              }
            });
            const results = await Promise.all(sessionPromises);
            results.forEach(arr => {
              if (Array.isArray(arr)) allSessions.push(...arr);
            });
          } catch (sessionErr) {
            console.warn("Could not load sessions:", sessionErr);
          }
        }

        // Safe Date Sorting for Scheduled/Ready Sessions
        const upcoming = allSessions
          .filter(s => s && (s.status === 'scheduled' || s.status === 'ready'))
          .sort((a, b) => {
            const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : 0;
            const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : 0;
            return timeA - timeB;
          });

        if (isMounted) {
          setUpcomingSessions(upcoming);
        }
      } catch (error) {
        console.error("Dashboard data sync error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [activeUser?.uid]);

  if (loading) return <Loader variant="page" />;

  const unreadCount = notifications.filter(n => n && !n.isRead).length;
  const pendingTopics = myTopics.filter(t => t && t.status === 'open').length;
  const firstName = dbUser?.name?.split(' ')[0] || activeUser?.displayName?.split(' ')[0] || 'Student';

  return (
    <div className="dashboard-container animate-fade-in">
      
      {/* 1. WARM PERSONAL HERO */}
      <section className="dashboard-hero-tactile">
        <div className="hero-content">
          <h1 className="hero-title">Welcome back, {firstName}</h1>
          <p className="hero-subtitle">Make learning easier, together.</p>
        </div>
        <div className="hero-brand-mark" aria-hidden="true">
          <img 
            src="/assets/studylunch-icon.jpg" 
            alt="StudyLunch" 
            className="hero-brand-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </section>

      {/* 2. TODAY'S FOCUS & THOUGHT FOR TODAY */}
      <section className="dash-overview-grid">
        <div className="focus-card-tactile">
          <h2 className="overview-title">Today's Focus</h2>
          <div className="focus-tiles-grid">
            <div 
              className="focus-tile focus-tile-sky" 
              onClick={() => navigate('/sessions')} 
              role="button" 
              tabIndex={0}
            >
              <div className="focus-badge badge-sky">
                <FiCalendar />
              </div>
              <div className="focus-info">
                <span className="focus-num">{upcomingSessions.length || 0}</span>
                <span className="focus-lbl">Scheduled</span>
              </div>
            </div>

            <div 
              className="focus-tile focus-tile-yellow" 
              onClick={() => navigate('/topics')} 
              role="button" 
              tabIndex={0}
            >
              <div className="focus-badge badge-yellow">
                <FiClock />
              </div>
              <div className="focus-info">
                <span className="focus-num">{pendingTopics || 0}</span>
                <span className="focus-lbl">Waiting</span>
              </div>
            </div>

            <div 
              className="focus-tile focus-tile-mint" 
              onClick={() => navigate('/notifications')} 
              role="button" 
              tabIndex={0}
            >
              <div className="focus-badge badge-mint">
                <FiBell />
              </div>
              <div className="focus-info">
                <span className="focus-num">{unreadCount || 0}</span>
                <span className="focus-lbl">Updates</span>
              </div>
            </div>
          </div>
        </div>

        <div className="quote-card-tactile">
          <h2 className="overview-title">Thought for today</h2>
          <div className="quote-content">
            <p className="quote-text">
              {dailyQuote.text || "A small explanation can become someone's turning point."}
            </p>
            <span className="quote-attribution">— {dailyQuote.author || "StudyLunch"}</span>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTIONS (Tactile 3D App Tiles - 3 Focused Actions) */}
      <section className="quick-actions-section">
        <div className="section-header-row">
          <h2 className="section-heading">Quick Actions</h2>
        </div>
        
        <div className="quick-actions-tiles">
          {/* Action 1: Create Request - Peach/Coral */}
          <div 
            className="action-tile action-tile-peach" 
            onClick={() => navigate('/topics/create')}
            role="button"
            tabIndex={0}
          >
            <div className="tile-top">
              <div className="tile-icon-badge badge-coral">
                <FiPlus />
              </div>
              <span className="tile-mini-tag tag-coral">Create</span>
            </div>
            <div className="tile-body">
              <h3 className="tile-title">Create Request</h3>
              <span className="tile-sub">Ask for help</span>
            </div>
          </div>

          {/* Action 2: Browse Topics - Mint/Green */}
          <div 
            className="action-tile action-tile-mint" 
            onClick={() => navigate('/topics')}
            role="button"
            tabIndex={0}
          >
            <div className="tile-top">
              <div className="tile-icon-badge badge-mint">
                <FiBookOpen />
              </div>
              <span className="tile-mini-tag tag-mint">Browse</span>
            </div>
            <div className="tile-body">
              <h3 className="tile-title">Browse Topics</h3>
              <span className="tile-sub">Help a peer</span>
            </div>
          </div>

          {/* Action 3: Verified Help - Lavender/Gold (Planned) */}
          <div 
            className="action-tile action-tile-planned action-tile-lavender" 
            tabIndex={-1}
            aria-disabled="true"
          >
            <div className="tile-top">
              <div className="tile-icon-badge badge-lavender">
                <FiShield />
              </div>
              <span className="tile-mini-tag tag-gold">Planned</span>
            </div>
            <div className="tile-body">
              <h3 className="tile-title">Verified Help</h3>
              <span className="tile-sub">Planned</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN BENTO GRID */}
      <div className="dash-bento-grid">
        
        {/* LEFT COLUMN: UPCOMING SESSION */}
        <div className="bento-main">
          <section className="dashboard-card-tactile">
            <div className="card-header-flex">
              <div className="card-header-title-group">
                <h2 className="section-heading">Upcoming Session</h2>
                {upcomingSessions.length > 0 && (
                  <span className="card-counter-badge">{upcomingSessions.length} Scheduled</span>
                )}
              </div>
              <button 
                type="button" 
                className="btn-view-all-sessions" 
                onClick={() => navigate('/sessions')}
              >
                View sessions
              </button>
            </div>
            
            {upcomingSessions.length === 0 ? (
              <ScheduleEmptyState 
                title="Your schedule is clear." 
                message="Create a request or browse topics when you're ready." 
                onAction={() => navigate('/topics/create')}
                onSecondary={() => navigate('/sessions')}
              />
            ) : (
              <div 
                className="session-item-tactile" 
                onClick={() => navigate(`/sessions/${upcomingSessions[0].id}/confirm`)}
                role="button"
                tabIndex={0}
              >
                <div className="session-date-tile">
                  <span className="session-day">
                    {upcomingSessions[0].scheduledTime ? new Date(upcomingSessions[0].scheduledTime).getDate() : '—'}
                  </span>
                  <span className="session-month">
                    {upcomingSessions[0].scheduledTime ? new Date(upcomingSessions[0].scheduledTime).toLocaleString('default', { month: 'short' }) : 'Meet'}
                  </span>
                </div>
                <div className="session-details">
                  <h3 className="session-title">
                    {upcomingSessions[0].meetingType === 'online' ? 'Virtual Meeting' : 'Study Meetup'}
                  </h3>
                  <p className="session-meta">
                    <span className="session-time">
                      <FiClock className="meta-icon" /> 
                      {upcomingSessions[0].scheduledTime ? new Date(upcomingSessions[0].scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    </span>
                    {upcomingSessions[0].topicTitle && (
                      <span className="session-topic-name"> • {upcomingSessions[0].topicTitle}</span>
                    )}
                  </p>
                </div>
                <button type="button" className="btn-tactile-primary btn-room">Enter room</button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: LEARNING STATS */}
        <div className="bento-sidebar">
          <section className="dashboard-card-tactile">
            <h2 className="section-heading">Learning Stats</h2>
            <div className="stats-grid-tactile">
              <div className="stat-tile-3d stat-tile-lavender">
                <div className="stat-badge badge-lavender">
                  <FiHelpCircle />
                </div>
                <span className="stat-val">{stats.created ?? 0}</span>
                <span className="stat-lbl">Asked</span>
              </div>
              <div className="stat-tile-3d stat-tile-mint">
                <div className="stat-badge badge-mint">
                  <FiUsers />
                </div>
                <span className="stat-val">{stats.mentored ?? 0}</span>
                <span className="stat-lbl">Helped</span>
              </div>
              <div className="stat-tile-3d stat-tile-teal">
                <div className="stat-badge badge-teal">
                  <FiCheckCircle />
                </div>
                <span className="stat-val">{stats.completed ?? 0}</span>
                <span className="stat-lbl">Completed</span>
              </div>
              <div className="stat-tile-3d stat-tile-yellow">
                <div className="stat-badge badge-yellow">
                  <FiStar />
                </div>
                <span className="stat-val">{stats.rating ? `${stats.rating} ★` : '0 ★'}</span>
                <span className="stat-lbl">Trust</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;