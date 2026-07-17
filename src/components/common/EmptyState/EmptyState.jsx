import React from 'react';
import Button from '../Button/Button';
import './EmptyState.css';

const EmptyState = ({ title, message, icon = '📂', actionText, onAction, mascot = false }) => {
  return (
    <div className="premium-empty-state animate-fade-in">
      <div className="empty-visual animate-float">
        {mascot ? (
          <span className="mascot-face" aria-label="Cat Mascot">( ≽^•⩊•^≼ )</span>
        ) : (
          <span className="empty-icon">{icon}</span>
        )}
      </div>
      <h3 className="heading-md">{title}</h3>
      <p className="body text-muted">{message}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} className="empty-action-btn">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;