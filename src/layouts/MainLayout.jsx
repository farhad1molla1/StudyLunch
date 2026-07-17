import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './MainLayout.css';

const MainLayout = () => {
  const { user, dbUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth > 1024) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/topics', label: 'Browse Topics', icon: '📚' },
    { path: '/topics/create', label: 'Create Topic', icon: '➕' },
    { path: '/sessions', label: 'My Sessions', icon: '🤝' },
    { path: '/notifications', label: 'Notifications', icon: '🔔', badge: 3 },
    { path: '/locker', label: 'Locker', icon: '🎒' },
    { path: '/study-system', label: 'Study System', icon: '🍱' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item => location.pathname.includes(item.path) && item.path !== '/');
    return currentItem ? currentItem.label : 'StudyLunch';
  };

  const photoUrl = user?.photoURL || dbUser?.photoURL;
  const userName = dbUser?.name || 'Student';

  return (
    <div className="layout-root animate-fade-in">
      {/* ================= LEFT SIDEBAR (Warm Digital Café) ================= */}
      <aside className={`sidebar-cafe ${isCollapsed ? 'collapsed' : ''}`}>
        
        <div className="sidebar-header">
          <div className="logo-badge-cafe">🍱</div>
          {!isCollapsed && (
            <div className="logo-text-wrapper">
              <h2 className="logo-title heading-md">StudyLunch</h2>
              <span className="logo-tagline caption">Learn Together</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
            return (
              <button 
                key={item.path} 
                className={`nav-pill-cafe ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label body">{item.label}</span>}
                
                {item.badge && !isCollapsed && <span className="nav-badge">{item.badge}</span>}
                {item.badge && isCollapsed && <span className="nav-badge-dot"></span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card-apricot" onClick={() => navigate('/profile')}>
            <div className="user-avatar-small">
              {photoUrl ? (
                <img src={photoUrl} alt={userName} referrerPolicy="no-referrer" />
              ) : (
                <div className="user-fallback">{userName.charAt(0)}</div>
              )}
            </div>
            {!isCollapsed && (
              <div className="user-info-small">
                <span className="user-name body">{userName}</span>
                <span className="user-streak caption">🔥 6-Day Streak</span>
              </div>
            )}
          </div>
        </div>

        <button className="sidebar-collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="main-wrapper">
        <header className="topbar">
          <h1 className="page-title heading-lg">{getPageTitle()}</h1>
        </header>
        <main className="content-area">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="mobile-bottom-nav">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
          return (
            <button 
              key={item.path} 
              className={`mob-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="mob-nav-icon">{item.icon}</span>
              <span className="mob-nav-label caption">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;