import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ⚠️ Keep your existing logic & imports
import './ScheduleSession.css';

const ScheduleSession = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  // ⚠️ Keep your state and logic
  
  return (
    <div className="schedule-layout animate-fade-in">
      <header className="page-header">
        <h1 className="heading-xl">Schedule Your Session</h1>
        <p className="body subtitle">Choose when and how the learning session will happen.</p>
      </header>

      <div className="schedule-grid">
        {/* Topic Summary */}
        <div className="premium-card summary-card">
          <h3 className="heading-md section-title">📌 Topic Summary</h3>
          <h2 className="heading-lg" style={{color: 'var(--color-primary)'}}>React Hooks Basics</h2>
          <p className="body">Subject: Web Development</p>
          <p className="caption">You are scheduling as a Mentor.</p>
        </div>

        {/* Schedule Form */}
        <div className="premium-card form-card">
          <h3 className="heading-md section-title">🗓️ Session Details</h3>
          <div className="form-group">
            <label className="caption">Date</label>
            <input type="date" className="premium-input" />
          </div>
          <div className="form-group">
            <label className="caption">Time</label>
            <input type="time" className="premium-input" />
          </div>
          <div className="form-group">
            <label className="caption">Duration (mins)</label>
            <input type="number" className="premium-input" placeholder="e.g. 60" />
          </div>
          <div className="form-group">
            <label className="caption">Meeting Type & Link/Location</label>
            <input type="text" className="premium-input" placeholder="e.g. Google Meet Link" />
          </div>
          
          <div className="action-area">
            <p className="caption helper-text">Both participants will confirm before the session starts.</p>
            <button className="btn-action-premium">Save Session Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSession;