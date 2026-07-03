import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiBookOpen, FiAlertCircle, FiBell, FiUser } from 'react-icons/fi';

function BottomNavigation() {
  const mobileTabs = [
    { path: '/dashboard', icon: <FiGrid />, label: 'Home' },
    { path: '/topics', icon: <FiBookOpen />, label: 'Topics' },
    { path: '/sos', icon: <FiAlertCircle />, label: 'SOS', isSos: true },
    { path: '/notifications', icon: <FiBell />, label: 'Alerts' },
    { path: '/profile', icon: <FiUser />, label: 'Profile' }
  ];

  return (
    <nav className="mobile-only" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '65px',
      backgroundColor: 'var(--sl-card)',
      borderTop: '2px solid #E2E8F0',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.03)',
      paddingBottom: 'env(safe-area-inset-bottom)' // Safe area mapping for modern flagship devices
    }}>
      {mobileTabs.map((tab, idx) => (
        <NavLink
          key={idx}
          to={tab.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            textDecoration: 'none',
            fontSize: '0.75rem',
            fontWeight: '600',
            transition: 'var(--sl-transition)',
            color: tab.isSos 
              ? 'var(--sl-error)' 
              : isActive ? 'var(--sl-primary)' : 'var(--sl-text-muted)',
            transform: isActive ? 'scale(1.05)' : 'scale(1)'
          })}
        >
          <div style={{ 
            fontSize: '1.35rem', 
            display: 'flex', 
            alignItems: 'center',
            padding: tab.isSos ? '6px' : '0px',
            backgroundColor: tab.isSos ? '#FFF1F2' : 'transparent',
            borderRadius: tab.isSos ? '50%' : '0'
          }}>
            {tab.icon}
          </div>
          <span className="desktop-only" style={{ display: 'none' }}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNavigation;