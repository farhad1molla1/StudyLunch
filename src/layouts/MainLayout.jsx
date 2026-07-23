import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './MainLayout.css';

const MainLayout = () => {
  const { user, dbUser } = useAuth();
  
  // Safe fallbacks so the app never crashes on missing data
  const displayName = dbUser?.displayName || user?.displayName || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/topics', label: 'Browse Topics', icon: '🔍' },
    { path: '/topics/create', label: 'Create Topic', icon: '✏️' },
    { path: '/sessions', label: 'My Sessions', icon: '📚' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/locker', label: 'Locker', icon: '💼' },
    { path: '/system', label: 'Study System', icon: '🧩' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo-title">
            <span style={{ fontSize: '1.8rem' }}>🍱</span> StudyLunch
          </h1>
          <p className="sidebar-logo-subtitle">Learn Together</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile / Streak Card */}
        <div className="sidebar-bottom-card">
          <div className="avatar-placeholder">{initial}</div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-streak">🔥 6-Day Streak</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-max-width">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;