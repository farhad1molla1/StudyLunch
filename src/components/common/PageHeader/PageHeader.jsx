import React from 'react';

const PageHeader = ({ title, description, action }) => {
  return (
    <div className="flex space-between" style={{ alignItems: 'center', marginBottom: 'var(--space-24)' }}>
      <div>
        <h1 className="h2">{title}</h1>
        {description && <p className="small mt-16" style={{ marginTop: 'var(--space-4)' }}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;