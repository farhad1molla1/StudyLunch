import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTopic } from '../../services/topicService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import './CreateTopic.css';

const CreateTopic = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', subject: '', description: '', skillsNeeded: '',
    preferredTime: '', university: dbUser?.university || '',
    department: dbUser?.department || '', year: dbUser?.year || ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subject) return toast.error("Title and Subject are required");
    
    setLoading(true);
    try {
      await createTopic({
        ...formData,
        createdBy: user.uid,
        creatorName: dbUser?.name || user.email,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      toast.success("Learning Request Posted! 🎉");
      navigate('/topics');
    } catch (error) {
      toast.error("Failed to post request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-topic-layout animate-fade-in">
      
      {/* A. Page Header */}
      <header className="page-header">
        <h1 className="heading-xl">Create a Learning Request</h1>
        <p className="body subtitle">Tell others what you need help with. A mentor will join you soon!</p>
      </header>

      {/* B. Main Form Card */}
      <form className="form-card-premium" onSubmit={handleSubmit}>
        
        {/* Group 1: Study Topic */}
        <div className="form-section">
          <h3 className="heading-md section-title"><span className="section-icon">📚</span> Study Topic</h3>
          <div className="form-group">
            <label className="caption">Topic Title *</label>
            <input type="text" name="title" className="premium-input" placeholder="e.g. Need help understanding React Hooks" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="caption">Subject / Course *</label>
            <input type="text" name="subject" className="premium-input" placeholder="e.g. Web Development" value={formData.subject} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="caption">Detailed Description</label>
            <textarea name="description" className="premium-textarea" placeholder="Explain what you are stuck on..." rows="4" value={formData.description} onChange={handleChange}></textarea>
          </div>
        </div>

        {/* Group 2: Learning Context */}
        <div className="form-section">
          <h3 className="heading-md section-title"><span className="section-icon">🎯</span> Learning Context</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="caption">Skills Needed</label>
              <input type="text" name="skillsNeeded" className="premium-input" placeholder="e.g. React, JavaScript" value={formData.skillsNeeded} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="caption">Preferred Time</label>
              <input type="text" name="preferredTime" className="premium-input" placeholder="e.g. Tomorrow 8 PM" value={formData.preferredTime} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="caption">University</label>
              <input type="text" name="university" className="premium-input" value={formData.university} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="caption">Department</label>
              <input type="text" name="department" className="premium-input" value={formData.department} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Group 3: Attachments Placeholder */}
        <div className="form-section">
          <h3 className="heading-md section-title"><span className="section-icon">📎</span> Attachments</h3>
          <div className="attachment-placeholder">
            <div className="upload-box">
              <span className="upload-icon">🖼️</span>
              <p className="body">Upload Image (Coming Soon)</p>
            </div>
            <div className="upload-box">
              <span className="upload-icon">📄</span>
              <p className="body">Upload PDF (Coming Soon)</p>
            </div>
          </div>
        </div>

        {/* C & D. Submit & Helper Message */}
        <div className="form-footer">
          <p className="helper-text caption">Your topic will appear on the public learning board.</p>
          <button type="submit" className="btn-submit-premium animate-bounce-hover" disabled={loading}>
            {loading ? 'Posting...' : 'Post Learning Request'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateTopic;