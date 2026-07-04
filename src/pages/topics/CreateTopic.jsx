import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Services & Context
import { useAuth } from '../../hooks/useAuth';
import { createTopic } from '../../services/topicService';

// UI Components
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import './CreateTopic.css';

const CreateTopic = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    university: dbUser?.university || '',
    department: dbUser?.department || '',
    year: dbUser?.academicYear || '',
    skillsNeeded: '',
    preferredTime: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.subject.trim()) {
      setError('Title, Description, and Subject are required fields.');
      return;
    }

    // 2. Data Preparation
    const topicData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject.trim(),
      university: formData.university.trim(),
      department: formData.department.trim(),
      year: formData.year.trim(),
      // Split by comma, trim spaces, and remove empty strings
      skillsNeeded: formData.skillsNeeded
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0),
      preferredTime: formData.preferredTime.trim(),
      
      // User Context Data
      createdBy: user.uid,
      creatorName: dbUser?.name || user.displayName || 'Anonymous Student',
      creatorPhoto: dbUser?.photoURL || user.photoURL || '',
    };

    // 3. Firestore Integration
    try {
      setLoading(true);
      await createTopic(topicData);
      toast.success('🎉 Topic created successfully!');
      
      // Reset form or navigate away (e.g., to dashboard or topics list)
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.message || 'Failed to create topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-topic-page">
      <div className="create-topic-container">
        <div className="create-topic-header">
          <h1 className="text-primary">Request a Session</h1>
          <p className="text-secondary">Fill in the details below to find the perfect mentor or study partner.</p>
        </div>

        <Card variant="default" className="create-topic-card">
          <form onSubmit={handleSubmit} className="create-topic-form" noValidate>
            
            {error && (
              <div className="create-topic-error" role="alert">
                {error}
              </div>
            )}

            {/* Section 1: Basic Info */}
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-grid">
              <Input
                label="Topic Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Need help understanding React Hooks"
                required
                fullWidth
                disabled={loading}
              />
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Computer Science, Physics"
                required
                fullWidth
                disabled={loading}
              />
            </div>

            <div className="form-group">
              {/* Native textarea styled with common input classes to match design system */}
              <label className="form-label">Description <span className="required-mark">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="sl-input__field custom-textarea"
                placeholder="Describe what you want to learn or the problem you are facing..."
                rows="4"
                disabled={loading}
                required
              />
            </div>

            {/* Section 2: Academic Info */}
            <h3 className="form-section-title">Academic Details</h3>
            <div className="form-grid form-grid--3-cols">
              <Input
                label="University"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="e.g. Dhaka University"
                fullWidth
                disabled={loading}
              />
              <Input
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. CSE"
                fullWidth
                disabled={loading}
              />
              <Input
                label="Year/Semester"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g. 3rd Year"
                fullWidth
                disabled={loading}
              />
            </div>

            {/* Section 3: Learning Data */}
            <h3 className="form-section-title">Learning Preferences</h3>
            <div className="form-grid">
              <Input
                label="Skills Needed (Comma separated)"
                name="skillsNeeded"
                value={formData.skillsNeeded}
                onChange={handleChange}
                placeholder="e.g. JavaScript, React, Firebase"
                fullWidth
                disabled={loading}
                helperText="List the specific topics or tools you need help with."
              />
              <Input
                label="Preferred Time"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                placeholder="e.g. Weekends, 8 PM - 10 PM"
                fullWidth
                disabled={loading}
              />
            </div>

            {/* Attachments Placeholder */}
            <div className="form-group attachment-placeholder">
              <div className="attachment-box">
                <span className="attachment-icon">📎</span>
                <p>Drag & drop reference files here (PDF/Images)</p>
                <small className="text-secondary">Upload feature coming in the next sprint.</small>
              </div>
            </div>

            {/* Submit Action */}
            <div className="form-actions">
              <Button type="submit" variant="primary" size="large" loading={loading} fullWidth>
                Create Topic Request
              </Button>
            </div>
            
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateTopic;