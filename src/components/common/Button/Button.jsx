import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`premium-btn btn-${variant} btn-${size} ${isLoading ? 'loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <span className="btn-spinner"></span> : children}
    </button>
  );
};

export default Button;