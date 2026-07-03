import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, FiBookOpen, FiClock, FiLayers, 
  FiAward, FiFolder, FiBell, FiAlertCircle, FiUser 
} from 'react-icons/fi';

function Sidebar() {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { path: '/topics', label: 'Topics', icon: <FiBookOpen /> },
    { path: '/sessions', label: 'Sessions', icon: <FiClock /> },
    { path: '/study-system', label: 'StudyLunch System', icon: <FiLayers /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FiAward /> }, // Fixed here
    { path: '/locker', label: 'Locker', icon: <FiFolder /> },
    { path: '/notifications', label: 'Notifications', icon: <FiBell /> },
    { path: '/sos', label: 'SOS', icon: <FiAlertCircle />, isSos: true },
    { path: '/profile', label: 'Profile', icon: <FiUser /> },
  ];

  return (
    <aside className="desktop-only" style={{
      width: '260px',
      height: 'calc(100vh - 70px)',
      position: 'sticky',
      top: '70px',
      backgroundColor: 'var(--sl-card)',
      borderRight: '2px solid #E2E8F0',
      flexDirection: 'column',
      padding: '24px 16px',
      gap: '8px',
      overflowY: 'auto'
    }}>
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--sl-radius-md)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'var(--sl-transition)',
            color: item.isSos 
              ? 'var(--sl-error)' 
              : isActive ? 'var(--sl-primary)' : 'var(--sl-text-muted)',
            backgroundColor: isActive 
              ? '#EEF2FF' 
              : item.isSos ? '#FFF1F2' : 'transparent',
            borderLeft: isActive ? '4px solid var(--sl-primary)' : '4px solid transparent',
            marginBottom: '4px'
          })}
        >
          <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}

export default Sidebar;