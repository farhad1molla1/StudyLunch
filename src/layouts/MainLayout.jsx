import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const { logout, currentUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Browse Topics', path: '/topics', icon: '🔍' },
    { label: 'My Sessions', path: '/sessions', icon: '🎒' },
    { label: 'Study Locker', path: '/locker', icon: '💼' },
    { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="brand-header" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          {/* Using requested asset path safely */}
          <div className="brand-logo-container">
            <img 
              src="/assets/Study-lunch-icon-deliver (1).jpg" 
              alt="StudyLunch Icon" 
              className="brand-icon"
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          </div>
          <div className="brand-text">StudyLunch</div>
        </div>

        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <button 
                className={`nav-btn ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-header">
           <div className="header-greeting">
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sl-ink)' }}>
                 Learn Together. Appreciate Together.
              </span>
           </div>
           <div className="header-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <div className="avatar">
                 {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'S'}
              </div>
           </div>
        </header>

        <main className="content-scroll-area">
          {/* CRITICAL: Must render children OR Outlet to prevent blank screen */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;