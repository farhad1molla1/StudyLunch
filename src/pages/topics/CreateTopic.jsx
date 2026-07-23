import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createTopic } from '../../services/topicService';
import './CreateTopic.css';

const CreateTopic = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    skillsNeeded: '',
    preferredTime: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");

    setLoading(true);
    try {
      const skillsArray = formData.skillsNeeded
        ? formData.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await createTopic({
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        skillsNeeded: skillsArray,
        preferredTime: formData.preferredTime || 'Anytime',
        // Auto-filling from Profile (Not asking the user manually)
        university: dbUser?.university || '',
        department: dbUser?.department || '',
        academicYear: dbUser?.academicYear || '',
        createdBy: user.uid,
        creatorName: dbUser?.displayName || user.displayName || 'Student',
        creatorPhoto: user.photoURL || null
      });

      navigate('/topics');
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Failed to create topic request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page animate-fade-up">
      <div className="create-topic-header">
        <h1 className="dashboard-title">Create a Learning Request</h1>
        <p className="create-subtitle">Tell others what you need help with.</p>
      </div>

      <section className="card-3d create-form-card">
        <form onSubmit={handleSubmit} className="create-topic-form">
          <div className="form-group">
            <label>Topic Title</label>
            <input 
              type="text" 
              name="title" 
              required 
              placeholder="e.g., Understanding Binary Trees in Data Structures" 
              value={formData.title} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subject</label>
              <input 
                type="text" 
                name="subject" 
                required 
                placeholder="e.g., Computer Science" 
                value={formData.subject} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Preferred Time</label>
              <input 
                type="text" 
                name="preferredTime" 
                placeholder="e.g., Evenings (GMT+6)" 
                value={formData.preferredTime} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Skills Needed (comma-separated)</label>
            <input 
              type="text" 
              name="skillsNeeded" 
              placeholder="e.g., Python, Recursion, Logic" 
              value={formData.skillsNeeded} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              required 
              rows="6"
              placeholder="Provide context or details about what you need assistance with..." 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          {/* Attachment Placeholder */}
          <div className="form-group attachment-placeholder">
            <div className="attachment-box">
              <span className="attachment-icon">📎</span>
              <p className="attachment-text">Attach Image or PDF (Coming Soon)</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/topics')} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Posting..." : "Post Request"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateTopic;