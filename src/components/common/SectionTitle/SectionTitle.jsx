import React from 'react';

const SectionTitle = ({ title, subtitle }) => {
  return (
    <div style={{ marginBottom: 'var(--space-16)' }}>
      <h2 className="h3">{title}</h2>
      {subtitle && <p className="small">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;