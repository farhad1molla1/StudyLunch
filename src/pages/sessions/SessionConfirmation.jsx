import React from 'react';
// ⚠️ Keep your logic
import './SessionCheckIn.css'; // Shared CSS

const SessionConfirmation = () => {
  return (
    <div className="checkpoint-layout animate-slide-up">
      <div className="checkpoint-card premium-card">
        <h1 className="heading-xl text-center" style={{color: 'var(--color-primary)'}}>Session Confirmation</h1>
        <p className="body text-center subtitle">Review the schedule and confirm your attendance.</p>
        
        <div className="participants-status">
          <div className="p-card learner">
            <div className="p-avatar">S</div>
            <h4 className="heading-md">Student Name</h4>
            <span className="status-badge success">Confirmed</span>
          </div>
          <div className="p-divider">🤝</div>
          <div className="p-card mentor">
            <div className="p-avatar mentor-bg">M</div>
            <h4 className="heading-md">Mentor Name</h4>
            <span className="status-badge warning">Pending</span>
          </div>
        </div>

        <div className="action-area">
          {/* Logic: if user not confirmed show button, else show waiting */}
          <button className="btn-action-premium">Confirm My Attendance</button>
        </div>
      </div>
    </div>
  );
};

export default SessionConfirmation;