import React from 'react';
import './SessionSummary.css';

const SessionSummary = () => {
  return (
    <div className="summary-layout animate-fade-in">
      <div className="summary-hero premium-card">
        <div className="celebration-mascot animate-bounce">
           <span className="mascot-face">✨( ≽^•⩊•^≼ )✨</span>
        </div>
        <h1 className="heading-xl text-primary">Session Completed!</h1>
        <p className="body">Great job! You've successfully finished this learning journey.</p>
      </div>

      <div className="summary-bento">
        {/* Timeline */}
        <div className="premium-card">
          <h3 className="heading-md section-title">⏳ Journey Timeline</h3>
          <ul className="timeline">
            <li className="t-item done">Session Created</li>
            <li className="t-item done">Scheduled</li>
            <li className="t-item done">Confirmed & Checked In</li>
            <li className="t-item done">Session Started</li>
            <li className="t-item active">Completed Successfully</li>
          </ul>
        </div>

        {/* Read-only Notes */}
        <div className="premium-card">
          <h3 className="heading-md section-title">📝 Shared Notes (Read-only)</h3>
          <div className="readonly-notes body">
            These are the notes saved during your session...
          </div>
        </div>

        {/* Next Steps (Placeholders) */}
        <div className="premium-card next-steps-card">
          <h3 className="heading-md section-title">🚀 Next Steps</h3>
          <div className="next-steps-grid">
            <button className="ns-btn">⭐ Rate Session</button>
            <button className="ns-btn">💝 Send Appreciation</button>
            <button className="ns-btn">📦 View Locker</button>
            <button className="ns-btn">🍱 StudyLunch System</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;