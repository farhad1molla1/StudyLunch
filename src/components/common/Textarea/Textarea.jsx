import React from 'react';

const Textarea = ({ label, placeholder, value, onChange, error, rows = 4, className = '' }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <textarea
        className={`input-field ${error ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={{ resize: 'vertical' }}
      />
      {error && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{error}</span>}
    </div>
  );
};

export default Textarea;