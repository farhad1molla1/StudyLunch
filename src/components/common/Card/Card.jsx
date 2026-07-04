import React from 'react';
import './Card.css';

const Card = ({
  title,
  subtitle,
  children,
  footer,
  icon,
  badge,
  variant = 'default',
  hoverable = false,
  clickable = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  // ডাইনামিক ক্লাস জেনারেট করা হচ্ছে
  const cardClasses = [
    'sl-card',
    `sl-card--${variant}`,
    hoverable || clickable ? 'sl-card--hoverable' : '',
    clickable || onClick ? 'sl-card--clickable' : '',
    loading ? 'sl-card--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // কীবোর্ড অ্যাক্সেসিবিলিটির জন্য (Enter বা Space চাপলে ক্লিক কাজ করবে)
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !loading) {
      e.preventDefault();
      onClick(e);
    }
  };

  // লোডিং স্টেট (Skeleton UI)
  if (loading) {
    return (
      <div className={cardClasses} aria-busy="true" aria-live="polite" {...props}>
        <div className="sl-card__header">
          {icon && <div className="sl-card__skeleton sl-card__skeleton--icon"></div>}
          <div className="sl-card__header-text">
            <div className="sl-card__skeleton sl-card__skeleton--title"></div>
            {subtitle && <div className="sl-card__skeleton sl-card__skeleton--subtitle"></div>}
          </div>
        </div>
        <div className="sl-card__body">
          <div className="sl-card__skeleton sl-card__skeleton--line"></div>
          <div className="sl-card__skeleton sl-card__skeleton--line" style={{ width: '80%' }}></div>
          <div className="sl-card__skeleton sl-card__skeleton--line" style={{ width: '60%' }}></div>
        </div>
        {footer && (
          <div className="sl-card__footer">
            <div className="sl-card__skeleton sl-card__skeleton--button"></div>
          </div>
        )}
      </div>
    );
  }

  // নরমাল স্টেট রেন্ডারিং
  return (
    <div
      className={cardClasses}
      onClick={!loading ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={clickable || onClick ? 'button' : 'article'}
      tabIndex={clickable || onClick ? 0 : undefined}
      {...props}
    >
      {/* Card Header (Icon, Title, Subtitle, Badge) */}
      {(title || icon || badge) && (
        <div className="sl-card__header">
          {icon && <div className="sl-card__icon">{icon}</div>}
          
          <div className="sl-card__header-content">
            {title && <h3 className="sl-card__title">{title}</h3>}
            {subtitle && <p className="sl-card__subtitle">{subtitle}</p>}
          </div>

          {badge && <div className="sl-card__badge">{badge}</div>}
        </div>
      )}

      {/* Card Body */}
      {children && <div className="sl-card__body">{children}</div>}

      {/* Card Footer */}
      {footer && <div className="sl-card__footer">{footer}</div>}
    </div>
  );
};

export default Card;