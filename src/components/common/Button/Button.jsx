import React from 'react';
import './Button.css';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}) => {
  // CSS ক্লাসগুলো ডাইনামিকালি জেনারেট করা হচ্ছে
  const buttonClasses = [
    'sl-btn',
    `sl-btn--${variant}`,
    `sl-btn--${size}`,
    fullWidth ? 'sl-btn--full-width' : '',
    loading ? 'sl-btn--loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg
          className="sl-btn__spinner"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="sl-btn__spinner-track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="sl-btn__spinner-head"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {/* Left Icon (লুকানো থাকবে যদি লোডিং চলে) */}
      {!loading && leftIcon && <span className="sl-btn__icon sl-btn__icon--left">{leftIcon}</span>}

      {/* Button Text */}
      <span className="sl-btn__text">{children}</span>

      {/* Right Icon (লুকানো থাকবে যদি লোডিং চলে) */}
      {!loading && rightIcon && <span className="sl-btn__icon sl-btn__icon--right">{rightIcon}</span>}
    </button>
  );
};

export default Button;