import React from 'react';
import './Input.css';

const Input = ({ label, error, helperText, icon, className = '', ...props }) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          className={`premium-input ${error ? 'input-error' : ''} ${icon ? 'with-icon' : ''}`} 
          aria-invalid={!!error}
          {...props} 
        />
      </div>
      {error && <span className="error-text" role="alert">{error}</span>}
      {!error && helperText && <span className="helper-text">{helperText}</span>}
    </div>
  );
};

export default Input;