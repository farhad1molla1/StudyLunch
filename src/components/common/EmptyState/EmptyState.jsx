import React from 'react';
import Button from '../Button/Button';

const EmptyState = ({ icon, title, description, actionText, onAction }) => {
  return (
    <div className="center flex-column text-center" style={{ padding: 'var(--space-48) var(--space-24)', flexDirection: 'column', gap: 'var(--space-16)' }}>
      {icon && <div style={{ fontSize: '3rem', color: 'var(--color-text-secondary)' }}>{icon}</div>}
      <h3 className="h3">{title}</h3>
      <p className="body" style={{ color: 'var(--color-text-secondary)', maxWidth: '400px' }}>{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};

export default EmptyState;