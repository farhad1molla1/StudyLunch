import React from 'react';
import { useNavigate } from 'react-router-dom';

const Placeholder = ({ pageName = "Feature" }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '36px 28px',
        background: 'var(--sl-surface, #ffffff)',
        borderRadius: 'var(--sl-radius-lg, 28px)',
        border: '1px solid var(--sl-border, #eadfcf)',
        boxShadow: 'var(--sl-shadow-soft, 0 10px 28px rgba(24, 43, 58, 0.08))'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍱</div>
        <h2 style={{ color: 'var(--sl-ink, #182b3a)', fontSize: '1.5rem', marginBottom: '8px' }}>
          {pageName}
        </h2>
        <p style={{ color: 'var(--sl-muted, #6f7c83)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
          This section is currently being prepared for the upcoming StudyLunch phase.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'var(--sl-primary, #0f6b62)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 'var(--sl-radius-sm, 14px)',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 107, 98, 0.2)'
          }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Placeholder;
