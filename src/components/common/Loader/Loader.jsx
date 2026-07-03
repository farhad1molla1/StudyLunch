import React from 'react';

const Loader = ({ variant = 'small' }) => {
  const spinnerStyle = {
    border: '3px solid var(--color-border)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  if (variant === 'page') {
    return (
      <div className="center" style={{ height: '100vh', width: '100%' }}>
        <div style={{ ...spinnerStyle, width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return <div style={{ ...spinnerStyle, width: '24px', height: '24px' }}></div>;
};

export default Loader;