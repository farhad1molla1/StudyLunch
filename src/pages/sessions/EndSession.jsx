import React from 'react';
import './SessionCheckIn.css';

const EndSession = () => {
  return (
    <div className="checkpoint-layout animate-slide-up">
      <div className="checkpoint-card premium-card text-center">
        <h1 className="heading-xl" style={{color: 'var(--color-primary)'}}>Finish This Session?</h1>
        <p className="body subtitle">Review the summary before officially closing the workspace.</p>
        
        <div className="session-info-pill" style={{textAlign: 'left'}}>
          <p className="body"><strong>Topic:</strong> React Hooks Basics</p>
          <p className="body"><strong>Duration:</strong> 60 Mins</p>
        </div>

        <div className="action-area">
          {/* Logic based on role: Confirm or Wait */}
          <button className="btn-action-premium">Confirm Session End</button>
        </div>
      </div>
    </div>
  );
};

export default EndSession;