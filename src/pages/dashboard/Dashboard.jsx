import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllTopics } from '../../services/topicService';
import { getSessionByTopic } from '../../services/sessionService';
import { getUserNotifications } from '../../services/notificationService';
import Loader from '../../components/common/Loader/Loader';
import { getRandomQuote } from '../../data/quotes';
import './Dashboard.css';

// 🐱 Cuter, Softer Chibi Cat (Rounded ears, gentle, anime-inspired)
const MascotEmptyState = ({ title, message }) => (
  <div className="empty-state-cafe">
    <svg width="130" height="120" viewBox="0 0 130 120" fill="none" className="chibi-cat-svg">
      {/* Soft rounded body sitting comfortably */}
      <path d="M30 100 C 30 55, 90 55, 90 100 Z" fill="#FFFDF8" stroke="#2D3A6B" strokeWidth="3" strokeLinejoin="round"/>
      
      {/* Head */}
      <circle cx="60" cy="55" r="28" fill="#FFFDF8" stroke="#2D3A6B" strokeWidth="3"/>
      
      {/* Extremely ROUNDED ears (no devil points) */}
      <path d="M40 34 C 32 15, 50 18, 53 28" fill="#FFFDF8" stroke="#2D3A6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M80 34 C 88 15, 70 18, 67 28" fill="#FFFDF8" stroke="#2D3A6B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Blush Cheeks */}
      <ellipse cx="48" cy="58" rx="4.5" ry="3" fill="#FFB86C" opacity="0.4" />
      <ellipse cx="72" cy="58" rx="4.5" ry="3" fill="#FFB86C" opacity="0.4" />

      {/* Gentle sleepy/happy eyes */}
      <path d="M47 55 Q 51 51 55 55" fill="none" stroke="#2D3A6B" strokeWidth="3" strokeLinecap="round"/>
      <path d="M65 55 Q 69 51 73 55" fill="none" stroke="#2D3A6B" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Tiny happy smile */}
      <path d="M57 65 Q 60 68 63 65" fill="none" stroke="#2D3A6B" strokeWidth="2.5" strokeLinecap="round"/>
      
      {/* Cute Lunchbox/Book next to it */}
      <rect x="80" y="86" width="28" height="14" rx="4" fill="#BFE8D4" stroke="#2D3A6B" strokeWidth="2.5"/>
      <line x1="80" y1="93" x2="108" y2="93" stroke="#2D3A6B" strokeWidth="2"/>
    </svg>
    <h3 className="heading-sm">{title}</h3>
    <p className="caption">{message}</p>
  </div>
);

const Dashboard = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ created: 0, mentored: 0, completed: 0, rating: 0 });
  const [myTopics, setMyTopics] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setDailyQuote(getRandomQuote());

        const [allTopics, allNotifications] = await Promise.all([
          getAllTopics(),
          getUserNotifications(user.uid)
        ]);

        const createdTopics = allTopics.filter(t => t.createdBy === user.uid);
        const mentoredTopics = allTopics.filter(t => t.acceptedBy === user.uid);
        setMyTopics(createdTopics.slice(0, 3));

        const completed = [...createdTopics, ...mentoredTopics].filter(t => t.status === 'completed').length;
        let totalRating = 0;
        const ratedTopics = mentoredTopics.filter(t => t.status === 'completed' && t.rating > 0);
        if (ratedTopics.length > 0) totalRating = ratedTopics.reduce((acc, curr) => acc + curr.rating, 0) / ratedTopics.length;

        setStats({ created: createdTopics.length, mentored: mentoredTopics.length, completed, rating: totalRating.toFixed(1) });

        const activeTopics = [...createdTopics, ...mentoredTopics].filter(t => t.status === 'matched' || t.status === 'in_session');
        const sessionPromises = activeTopics.map(t => getSessionByTopic(t.id));
        const sessionResults = await Promise.all(sessionPromises);
        
        let allSessions = [];
        sessionResults.forEach(res => { allSessions = [...allSessions, ...res]; });
        setUpcomingSessions(allSessions.filter(s => s.status === 'scheduled' || s.status === 'ready').sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)));
        setNotifications(allNotifications.slice(0, 5));
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);

  if (loading) return <Loader variant="page" />;

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingTopics = myTopics.filter(t => t.status === 'open').length;
  const firstName = dbUser?.name?.split(' ')[0] || 'Student';

  return (
    <div className="dashboard-layout animate-fade-in">
      
      {/* 1. DIGITAL CAFE HERO */}
      <section className="hero-cafe">
        <div className="hero-text">
          <h1 className="heading-xl hero-title">Welcome back, {firstName}!</h1>
          <p className="body hero-subtitle">Let’s make learning feel a little easier.</p>
        </div>
        <div className="hero-decor">
          <span className="hero-icon">📚</span>
          <span className="hero-icon">☕</span>
        </div>
      </section>

      {/* 2. UPPER GRID (Today's Focus & Quote) */}
      <section className="dash-upper-grid">
        <div className="focus-panel">
          <h2 className="heading-md section-title">Today's Focus</h2>
          <div className="focus-chips">
            <div className="focus-chip bg-primary-soft">
              <span className="f-icon">📅</span>
              <div className="f-text"><strong>{upcomingSessions.length}</strong> Sessions</div>
            </div>
            <div className="focus-chip bg-apricot-soft">
              <span className="f-icon">⏳</span>
              <div className="f-text"><strong>{pendingTopics}</strong> Waiting</div>
            </div>
            <div className="focus-chip bg-mint-soft">
              <span className="f-icon">🔔</span>
              <div className="f-text"><strong>{unreadCount}</strong> Alerts</div>
            </div>
          </div>
        </div>

        <div className="quote-panel">
          <h2 className="heading-md section-title">Thought for Today</h2>
          <div className="quote-card-ink">
            <span className="quote-mark">"</span>
            <p className="quote-text body">{dailyQuote.text}</p>
            <p className="quote-author caption">— {dailyQuote.author}</p>
          </div>
        </div>
      </section>

      {/* 3. MAIN BENTO GRID */}
      <div className="dash-bento-grid">
        
        {/* LEFT COLUMN: UPCOMING SESSION */}
        <div className="bento-main">
          <section className="dashboard-card-cafe">
            <h2 className="heading-md section-title">Upcoming Session</h2>
            
            {upcomingSessions.length === 0 ? (
              <MascotEmptyState 
                title="Your schedule is clear." 
                message="Start a learning request when you're ready." 
              />
            ) : (
              <div className="session-item-cafe" onClick={() => navigate(`/sessions/${upcomingSessions[0].id}/confirm`)}>
                <div className="s-date-cafe bg-primary-soft">
                  <span className="s-day">{new Date(upcomingSessions[0].scheduledTime).getDate()}</span>
                  <span className="s-month">{new Date(upcomingSessions[0].scheduledTime).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="s-info">
                  <h3 className="heading-md">{upcomingSessions[0].meetingType === 'online' ? 'Virtual Meeting' : 'Study Meetup'}</h3>
                  <p className="body">☕ {new Date(upcomingSessions[0].scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button className="btn-cafe-primary">Enter Room</button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: LEARNING STATS */}
        <div className="bento-sidebar">
          <section className="dashboard-card-cafe">
            <h2 className="heading-md section-title">Learning Stats</h2>
            <div className="stats-grid-cafe">
              <div className="stat-tile bg-ink-blue-soft">
                <span className="stat-icon">📝</span>
                <span className="stat-num">{stats.created}</span>
                <span className="stat-name">Asked</span>
              </div>
              <div className="stat-tile bg-mint">
                <span className="stat-icon">🤝</span>
                <span className="stat-num">{stats.mentored}</span>
                <span className="stat-name">Helped</span>
              </div>
              <div className="stat-tile bg-primary-soft">
                <span className="stat-icon">🏆</span>
                <span className="stat-num">{stats.completed}</span>
                <span className="stat-name">Completed</span>
              </div>
              <div className="stat-tile bg-apricot-soft">
                <span className="stat-icon">🧠</span>
                <span className="stat-num">{stats.rating}</span>
                <span className="stat-name">Trust</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;