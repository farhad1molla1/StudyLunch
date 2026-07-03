import React from 'react';

const Badge = ({ children, type = 'primary' }) => {
  return (
    <span className={`badge badge-${type}`}>
      {children}
    </span>
  );
};

export default Badge;