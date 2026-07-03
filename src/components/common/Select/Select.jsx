import React from 'react';

const Select = ({ label, value, onChange, options = [], error, className = '' }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <select
        className={`input-field ${error ? 'error' : ''}`}
        value={value}
        onChange={onChange}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{error}</span>}
    </div>
  );
};

export default Select;