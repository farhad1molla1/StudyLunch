import React from 'react';
import Button from '../common/Button/Button';

const ReviewStep = ({ formData, onBack, onSubmit, loading }) => {
  return (
    <div className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="review-section" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Academic Information</h3>
        <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>University:</strong> {formData.university}</p>
        <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Department:</strong> {formData.department}</p>
        <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Academic Year:</strong> {formData.academicYear}</p>
      </div>

      <div className="review-section" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Personal Information</h3>
        <p style={{ fontSize: '14px', marginBottom: '8px' }}><strong>Bio:</strong> {formData.bio || 'Not provided'}</p>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>Skills:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {formData.skills.length > 0 ? formData.skills.map((skill, i) => <span key={i} className="badge" style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--border-color)', borderRadius: '12px' }}>{skill}</span>) : <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>None added</span>}
          </div>
        </div>

        <div>
          <strong>Learning Goals:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {formData.learningGoals.length > 0 ? formData.learningGoals.map((goal, i) => <span key={i} className="badge" style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--border-color)', borderRadius: '12px' }}>{goal}</span>) : <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>None added</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="button" variant="primary" onClick={onSubmit} loading={loading} disabled={loading}>
          Finish Setup
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;