import React from 'react';
import './Card.css';

const Card = ({ children, variant = 'default', interactive = false, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`premium-card card-${variant} ${interactive ? 'interactive' : ''} ${className}`} 
      onClick={onClick}
      role={interactive ? 'button' : 'region'}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;