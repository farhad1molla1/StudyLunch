import React from 'react';
import './SessionWorkspace.css';

const SessionWorkspace = () => {
  return (
    <div className="workspace-layout animate-fade-in">
      <header className="workspace-header premium-card">
        <div>
          <h1 className="heading-lg">React Hooks Basics</h1>
          <span className="caption">Session is Active • 00:15:30 Elapsed</span>
        </div>
        <button className="btn-end-session">Request End Session</button>
      </header>

      <div className="workspace-grid">
        {/* Main Content: Shared Notes */}
        <div className="workspace-main premium-card">
          <h3 className="heading-md section-title">📝 Shared Notes</h3>
          <textarea 
            className="premium-textarea workspace-editor" 
            placeholder="Type your notes here... Both participants can refer to this."
          ></textarea>
          <div className="editor-footer">
            <span className="caption text-success">✓ Auto-saved</span>
            <button className="btn-primary-small">Save Notes</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="workspace-sidebar">
          <div className="premium-card">
            <h3 className="heading-md section-title">👥 Participants</h3>
            <div className="w-participant"><div className="p-dot"></div> Student Name</div>
            <div className="w-participant"><div className="p-dot mentor-dot"></div> Mentor Name</div>
          </div>
          <div className="premium-card">
            <h3 className="heading-md section-title">📎 Materials</h3>
            <p className="caption">No attachments available.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWorkspace;