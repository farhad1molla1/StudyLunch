import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const auth = useAuth() || {};
  const { user, currentUser, dbUser, logout } = auth;
  const activeUser = currentUser || user;

  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth > 1024) {
        setIsCollapsed(false);
      }
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically close mobile menu upon navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: '🏠' },
    { path: '/topics', label: 'Browse Topics', shortLabel: 'Browse', icon: '🔍' },
    { path: '/topics/create', label: 'Create Topic', shortLabel: 'Create', icon: '➕' },
    { path: '/sessions', label: 'My Sessions', shortLabel: 'Sessions', icon: '🤝' },
    { path: '/notifications', label: 'Notifications', shortLabel: 'Alerts', icon: '🔔' },
    { path: '/locker', label: 'Locker', shortLabel: 'Locker', icon: '🎒' },
    { path: '/study-system', label: 'Study System', shortLabel: 'System', icon: '🍱' },
    { path: '/leaderboard', label: 'Leaderboard', shortLabel: 'Board', icon: '🏆' },
    { path: '/profile', label: 'Profile', shortLabel: 'Profile', icon: '👤' },
  ];

  const getPageTitle = () => {
    const pathname = location.pathname;
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/topics/create') return 'Create Topic';
    if (pathname === '/topics') return 'Browse Topics';
    if (pathname.startsWith('/topics/')) return 'Topic Details';
    if (pathname === '/sessions' || pathname.startsWith('/sessions/')) return 'Sessions';
    if (pathname.startsWith('/notifications')) return 'Notifications';
    if (pathname.startsWith('/locker')) return 'Locker';
    if (pathname.startsWith('/study-system')) return 'Study System';
    if (pathname.startsWith('/leaderboard')) return 'Leaderboard';
    if (pathname.startsWith('/profile')) return 'Profile';
    return 'StudyLunch';
  };

  const isNavActive = (itemPath) => {
    const pathname = location.pathname;
    if (itemPath === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    if (itemPath === '/topics') {
      // Browse active ONLY on exact /topics. NOT on /topics/create or /topics/:topicId
      return pathname === '/topics';
    }
    if (itemPath === '/topics/create') {
      // Create active ONLY on /topics/create
      return pathname === '/topics/create';
    }
    if (itemPath === '/sessions') {
      return pathname === '/sessions' || pathname.startsWith('/sessions/');
    }
    return pathname === itemPath;
  };

  const photoUrl = activeUser?.photoURL || dbUser?.photoURL;
  const userName = dbUser?.name || activeUser?.displayName || 'Student';

  return (
    <div className="layout-root animate-fade-in">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================= LEFT SIDEBAR (Warm Digital Café) ================= */}
      <aside className={`sidebar-cafe ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        <Link 
          to="/dashboard"
          className="sidebar-header" 
          onClick={() => setIsMobileMenuOpen(false)} 
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          <div className="logo-badge-cafe" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!iconError ? (
              <img 
                src="/assets/studylunch-icon.jpg" 
                alt="StudyLunch" 
                onError={() => setIconError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
              />
            ) : (
              <span>🍱</span>
            )}
          </div>
          {(!isCollapsed || isMobileMenuOpen) && (
            <div className="logo-text-wrapper">
              <h2 className="logo-title heading-md">StudyLunch</h2>
              <span className="logo-tagline caption" style={{ fontSize: "0.68rem" }}>Learn Together. Appreciate Together.</span>
            </div>
          )}

          {isMobileMenuOpen && (
            <button 
              type="button"
              className="mobile-sidebar-close" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMobileMenuOpen(false); }}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </Link>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = isNavActive(item.path);
            return (
              <NavLink 
                key={item.path} 
                to={item.path}
                end={item.path !== '/sessions'}
                className={() => `nav-pill-cafe ${active ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed && !isMobileMenuOpen ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {(!isCollapsed || isMobileMenuOpen) && <span className="nav-label body">{item.label}</span>}
                
                {item.badge && (!isCollapsed || isMobileMenuOpen) && <span className="nav-badge">{item.badge}</span>}
                {item.badge && isCollapsed && !isMobileMenuOpen && <span className="nav-badge-dot"></span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link 
            to="/profile"
            className="user-card-apricot" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ textDecoration: 'none' }}
            title="View Profile"
          >
            <div className="user-avatar-small">
              {photoUrl ? (
                <img src={photoUrl} alt={userName} referrerPolicy="no-referrer" />
              ) : (
                <div className="user-fallback">{userName.charAt(0).toUpperCase()}</div>
              )}
            </div>
            {(!isCollapsed || isMobileMenuOpen) && (
              <div className="user-info-small">
                <span className="user-name body">{userName}</span>
                <span className="user-streak caption">StudyLunch Member</span>
              </div>
            )}
          </Link>

          <button 
            type="button"
            className={`btn-sidebar-logout ${isCollapsed && !isMobileMenuOpen ? 'collapsed' : ''}`}
            onClick={handleLogout}
            title="Log Out"
            aria-label="Log Out"
          >
            <span className="logout-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            {(!isCollapsed || isMobileMenuOpen) && <span className="logout-text">Log Out</span>}
          </button>
        </div>

        <button 
          type="button"
          className="sidebar-collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button 
              type="button"
              className="mobile-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="page-title heading-lg">{getPageTitle()}</h1>
          </div>

          <div className="topbar-right">
            <button 
              type="button"
              className="topbar-logout-btn" 
              onClick={handleLogout}
              title="Log Out"
              aria-label="Log Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </header>
        <main className="content-area">
          <div className="content-container">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {navItems.slice(0, 4).map((item) => {
          const active = isNavActive(item.path);
          return (
            <NavLink 
              key={item.path} 
              to={item.path}
              end={item.path !== '/sessions'}
              className={() => `mob-nav-item ${active ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mob-nav-icon">{item.icon}</span>
              <span className="mob-nav-label">{item.shortLabel || item.label}</span>
            </NavLink>
          );
        })}
        <button 
          type="button"
          className={`mob-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="mob-nav-icon">☰</span>
          <span className="mob-nav-label">Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default MainLayout;