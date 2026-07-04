import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getSession, scheduleSession } from '../../services/sessionService';
import { useAuth } from '../../hooks/useAuth';

// Reusable Components
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';

const ScheduleSession = () => {
  const { id } = useParams(); // sessionId
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '30', // Minimum 30 mins
    meetingType: 'offline', // default
    meetingLocation: '',
    meetingLink: '',
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await getSession(id);
        
        if (!data) throw new Error('Session not found.');
        
        // Authorization Check: Only Mentor can schedule
        if (user && data.mentorId !== user.uid) {
          throw new Error('Unauthorized. Only the assigned mentor can schedule this session.');
        }

        if (data.status !== 'scheduled') {
           throw new Error('This session is already in progress or completed and cannot be rescheduled.');
        }

        setSessionData(data);
      } catch (err) {
        setError(err.message || 'Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) fetchSession();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Core Validations
    if (!formData.date || !formData.time) {
      toast.error('Please select both date and time.');
      return;
    }

    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime < new Date()) {
      toast.error('The scheduled time cannot be in the past.');
      return;
    }

    if (Number(formData.duration) < 30) {
      toast.error('Session duration must be at least 30 minutes.');
      return;
    }

    if (formData.meetingType === 'offline' && !formData.meetingLocation.trim()) {
      toast.error('Please provide a meeting location for offline sessions.');
      return;
    }

    if (formData.meetingType === 'online') {
      if (!formData.meetingLink.trim()) {
        toast.error('Please provide a meeting link (Google Meet, Zoom, etc.).');
        return;
      }
      if (!validateURL(formData.meetingLink)) {
        toast.error('Please provide a valid URL for the meeting link.');
        return;
      }
    }

    // 2. Prepare Data for Firestore
    const payload = {
      scheduledTime: selectedDateTime.toISOString(), // Standardizing format
      duration: Number(formData.duration),
      meetingType: formData.meetingType,
      meetingLocation: formData.meetingLocation.trim(),
      meetingLink: formData.meetingLink.trim(),
    };

    // 3. Save via Service
    try {
      setSaving(true);
      await scheduleSession(id, payload);
      toast.success('Session scheduled successfully!');
      navigate('/dashboard'); // Or navigate back to the specific session/topic page
    } catch (err) {
      toast.error(err.message || 'Failed to schedule session.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader variant="page" />;

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
         <EmptyState icon="⚠️" title="Cannot Schedule" description={error} />
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-24) var(--space-16)', maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="text-primary" style={{ marginBottom: 'var(--space-8)' }}>Schedule Session</h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-24)' }}>Set the date, time, and location for your upcoming mentoring session.</p>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
          
          <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
            <Input
              label="Date *"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              fullWidth
              disabled={saving}
              required
            />
            <Input
              label="Time *"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              fullWidth
              disabled={saving}
              required
            />
          </div>

          <Input
            label="Expected Duration (Minutes) *"
            type="number"
            name="duration"
            min="30"
            value={formData.duration}
            onChange={handleChange}
            fullWidth
            disabled={saving}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
              Meeting Type *
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="meetingType"
                  value="offline"
                  checked={formData.meetingType === 'offline'}
                  onChange={handleChange}
                  disabled={saving}
                />
                In-Person (Offline)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="meetingType"
                  value="online"
                  checked={formData.meetingType === 'online'}
                  onChange={handleChange}
                  disabled={saving}
                />
                Virtual (Online)
              </label>
            </div>
          </div>

          {/* Conditional Inputs based on Meeting Type */}
          {formData.meetingType === 'offline' ? (
             <Input
               label="Meeting Location *"
               name="meetingLocation"
               placeholder="e.g. University Library, Cafe..."
               value={formData.meetingLocation}
               onChange={handleChange}
               fullWidth
               disabled={saving}
               required
             />
          ) : (
            <Input
               label="Meeting Link *"
               type="url"
               name="meetingLink"
               placeholder="e.g. https://meet.google.com/..."
               value={formData.meetingLink}
               onChange={handleChange}
               fullWidth
               disabled={saving}
               required
             />
          )}

          <div style={{ marginTop: 'var(--space-16)' }}>
             <Button type="submit" variant="primary" fullWidth size="large" loading={saving}>
               Confirm Schedule
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ScheduleSession;