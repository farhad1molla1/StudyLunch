import React, { useState } from 'react';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';

const PersonalInfoStep = ({ formData, setFormData, onNext, onBack }) => {
  const [skillInput, setSkillInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const handleBioChange = (e) => {
    setFormData((prev) => ({ ...prev, bio: e.target.value }));
  };

  const handleAddTag = (type, value, setter) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !formData[type].includes(trimmedValue)) {
      setFormData((prev) => ({ ...prev, [type]: [...prev[type], trimmedValue] }));
      setter('');
    }
  };

  const handleRemoveTag = (type, tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <div className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Bio Input (Using standard input styling for textarea structure) */}
      <div className="input-group">
        <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Short Bio (Optional)</label>
        <textarea
          className="form-input"
          value={formData.bio}
          onChange={handleBioChange}
          placeholder="Tell us a bit about yourself..."
          style={{ width: '100%', padding: '12px', minHeight: '100px', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }}
        />
      </div>

      {/* Skills Input */}
      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Skills (Optional)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. Physics, Programming"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag('skills', skillInput, setSkillInput)}
            />
          </div>
          <Button type="button" variant="outline" onClick={() => handleAddTag('skills', skillInput, setSkillInput)}>Add</Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {formData.skills.map((skill, index) => (
            <span key={index} className="badge" style={{ padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' }} onClick={() => handleRemoveTag('skills', skill)}>
              {skill} ✕
            </span>
          ))}
        </div>
      </div>

      {/* Learning Goals Input */}
      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Learning Goals (Optional)"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. Improve Calculus, Practice English"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag('learningGoals', goalInput, setGoalInput)}
            />
          </div>
          <Button type="button" variant="outline" onClick={() => handleAddTag('learningGoals', goalInput, setGoalInput)}>Add</Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {formData.learningGoals.map((goal, index) => (
            <span key={index} className="badge" style={{ padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' }} onClick={() => handleRemoveTag('learningGoals', goal)}>
              {goal} ✕
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" variant="primary" onClick={onNext}>Review Profile</Button>
      </div>
    </div>
  );
};

export default PersonalInfoStep;