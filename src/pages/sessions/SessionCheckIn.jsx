import React from 'react';
import './SessionCheckIn.css';

const SessionCheckIn = () => {
  return (
    <div className="checkpoint-layout animate-slide-up">
      <div className="checkpoint-card premium-card">
        <h1 className="heading-xl text-center" style={{color: 'var(--color-primary)'}}>Ready to Start?</h1>
        <p className="body text-center subtitle">Check in to enter the session workspace.</p>
        
        <div className="session-info-pill">
          <p className="body">📅 Today, 8:00 PM • 📍 Google Meet</p>
        </div>

        <div className="participants-status">
          <div className="p-card">
            <div className="p-avatar">S</div>
            <span className="status-badge success">Checked In</span>
          </div>
          <div className="p-divider">🚪</div>
          <div className="p-card">
            <div className="p-avatar mentor-bg">M</div>
            <span className="status-badge warning">Waiting...</span>
          </div>
        </div>

        <div className="action-area">
          <button className="btn-action-premium">Check In</button>
        </div>
      </div>
    </div>
  );
};

export default SessionCheckIn;