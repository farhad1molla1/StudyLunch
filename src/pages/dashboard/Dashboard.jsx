import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studyQuotes } from '../../data/quotes';
import { getAllTopics } from '../../services/topicService';
import { getUserSessions } from '../../services/sessionService';
import './Dashboard.css';

const Dashboard = () => {
  const { user, dbUser } = useAuth();
  const [quote, setQuote] = useState(studyQuotes[0]);
  
  const [counts, setCounts] = useState({ sessions: 0, waiting: 0, alerts: 0 });

  useEffect(() => {
    const randomQuote = studyQuotes[Math.floor(Math.random() * studyQuotes.length)];
    setQuote(randomQuote);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        let activeSessionsCount = 0;
        let waitingTopicsCount = 0;

        try {
          const allTopics = await getAllTopics();
          waitingTopicsCount = allTopics.filter(t => t.createdBy === user.uid && t.status === 'open').length;
        } catch (e) { console.error("Safe Fetch Error (Topics):", e); }

        try {
          const allSessions = await getUserSessions(user.uid);
          activeSessionsCount = allSessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;
        } catch (e) { console.error("Safe Fetch Error (Sessions):", e); }

        setCounts({
          sessions: activeSessionsCount,
          waiting: waitingTopicsCount,
          alerts: 0 
        });
      } catch (error) {
        console.error("Dashboard metric fetch failed:", error);
      }
    };

    fetchDashboardData();
  }, [user]);

  const displayName = dbUser?.displayName || user?.displayName || 'Student';
  const askedCount = dbUser?.asked || 0;
  const helpedCount = dbUser?.helped || 0;
  const completedCount = dbUser?.completed || 0;
  const trustScore = dbUser?.trust || 0;

  return (
    <div className="dashboard-page animate-fade-up">
      <h1 className="dashboard-title">Dashboard</h1>

      <section className="card-3d welcome-hero">
        <div className="hero-text-content">
          <h2>Welcome back, {displayName}!</h2>
          <p>Let’s make learning feel a little easier.</p>
        </div>
        <div className="hero-icons animate-float">
          🎒
        </div>
      </section>

      <div className="dashboard-top-grid">
        <section className="card-3d focus-section">
          <h3 className="section-label">🎯 Today's Focus</h3>
          <div className="focus-chips">
            <div className="chip sessions">
              <strong>{counts.sessions}</strong> Sessions
            </div>
            <div className="chip waiting">
              <strong>{counts.waiting}</strong> Waiting
            </div>
            <div className="chip alerts">
              <strong>{counts.alerts}</strong> Alerts
            </div>
          </div>
        </section>

        <section className="card-3d quote-section">
          <h3 className="section-label">💡 Thought for Today</h3>
          <div className="quote-text">"{quote.text}"</div>
          <div className="quote-author">— {quote.author}</div>
        </section>
      </div>

      <div className="dashboard-main-grid">
        <section className="card-3d upcoming-card pressable">
          <h3 className="section-label">📅 Upcoming Session</h3>
          <div className="empty-state-card">
            <div className="css-cat-mascot">
              <div className="css-cat-ear ear-left"></div>
              <div className="css-cat-ear ear-right"></div>
              <div className="css-cat-face">^ ω ^</div>
            </div>
            <p className="empty-text">Your schedule is clear.</p>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem' }}>
              Start a learning request when you're ready.
            </p>
          </div>
        </section>

        <section className="card-3d stats-card">
          <h3 className="section-label">📊 Learning Stats</h3>
          <div className="stats-grid">
            <div className="stat-box stat-asked">
              <div className="stat-value">{askedCount}</div>
              <div className="stat-label">Asked</div>
            </div>
            <div className="stat-box stat-helped">
              <div className="stat-value">{helpedCount}</div>
              <div className="stat-label">Helped</div>
            </div>
            <div className="stat-box stat-completed">
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-box stat-trust">
              <div className="stat-value">{trustScore}</div>
              <div className="stat-label">Trust</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;