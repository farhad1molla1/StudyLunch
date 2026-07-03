import React from 'react';

const Input = ({ label, placeholder, value, onChange, error, helperText, type = 'text', disabled, className = '' }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`input-field ${error ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{error}</span>}
      {!error && helperText && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{helperText}</span>}
    </div>
  );
};

export default Input;