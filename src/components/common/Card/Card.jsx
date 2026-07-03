import React from 'react';

const Card = ({ title, children, footer, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="mb-16 pb-8 border-b">
          <h3 className="h3">{title}</h3>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="mt-16 pt-16 border-t">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;