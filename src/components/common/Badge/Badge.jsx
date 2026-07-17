import React from 'react';
import './Badge.css';

const Badge = ({ children, type = 'info', className = '' }) => {
  return (
    <span className={`premium-badge badge-${type} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;