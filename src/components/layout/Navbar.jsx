import React from 'react';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '70px',
      backgroundColor: 'var(--sl-card)',
      borderBottom: '2px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'between',
      padding: '0 24px',
      boxShadow: 'var(--sl-shadow)'
    }}>
      {/* Left: Branding */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          backgroundColor: 'var(--sl-primary)',
          color: '#FFFFFF',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--sl-radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
        }}>
          🍱
        </div>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: 'var(--sl-text)',
          letterSpacing: '-0.5px'
        }}>
          Study<span style={{ color: 'var(--sl-primary)' }}>Lunch</span>
        </span>
      </Link>

      {/* Right: Actions / Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
        {/* Notification Icon */}
        <Link to="/notifications" style={{
          position: 'relative',
          color: 'var(--sl-text-muted)',
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: 'var(--sl-radius-sm)',
          transition: 'var(--sl-transition)',
          backgroundColor: '#F1F5F9'
        }}>
          <FiBell />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--sl-error)',
            borderRadius: '50%'
          }}></span>
        </Link>

        {/* User Avatar */}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--sl-radius-md)',
            backgroundColor: 'var(--sl-accent)',
            border: '2px solid var(--sl-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            🐱
          </div>
        </Link>

        {/* Logout Button */}
        <button style={{
          border: 'none',
          backgroundColor: '#FFF1F2',
          color: 'var(--sl-error)',
          padding: '10px',
          borderRadius: 'var(--sl-radius-sm)',
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--sl-transition)'
        }} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}

export default Navbar;