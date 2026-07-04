import React, { useState, useId } from 'react';
import './Input.css';

const Input = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  iconLeft,
  iconRight,
  showPasswordToggle = false,
  fullWidth = false,
  maxLength,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Unique IDs for accessibility linkage
  const inputId = useId();
  const helperId = useId();

  // Handle Focus State for Floating Label
  const handleFocus = (e) => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Determine current input type (handles password toggle)
  const currentType = type === 'password' && isPasswordVisible ? 'text' : type;

  // Determine if label should float
  const hasValue = value !== undefined && value !== null && value !== '';
  const isFloating = isFocused || hasValue || type === 'date' || type === 'time';

  // Toggle Password Visibility
  const togglePassword = () => {
    if (!disabled && !readOnly) {
      setIsPasswordVisible(!isPasswordVisible);
    }
  };

  // Generate dynamic classes
  const wrapperClasses = [
    'sl-input-wrapper',
    fullWidth ? 'sl-input-wrapper--full-width' : '',
    error ? 'sl-input-wrapper--error' : '',
    success ? 'sl-input-wrapper--success' : '',
    disabled ? 'sl-input-wrapper--disabled' : '',
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'sl-input-container',
    isFloating ? 'sl-input-container--floating' : '',
    iconLeft ? 'sl-input-container--has-left-icon' : '',
    iconRight || (type === 'password' && showPasswordToggle) ? 'sl-input-container--has-right-icon' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        {/* Left Icon */}
        {iconLeft && <span className="sl-input__icon sl-input__icon--left">{iconLeft}</span>}

        {/* Input Field */}
        <input
          id={inputId}
          className="sl-input__field"
          type={currentType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          placeholder={isFloating ? placeholder : ''}
          aria-invalid={!!error}
          aria-describedby={helperText || error ? helperId : undefined}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <label htmlFor={inputId} className="sl-input__label">
            {label} {required && <span className="sl-input__required-asterisk">*</span>}
          </label>
        )}

        {/* Right Icon / Password Toggle */}
        {type === 'password' && showPasswordToggle ? (
          <button
            type="button"
            className="sl-input__icon sl-input__icon--right sl-input__password-toggle"
            onClick={togglePassword}
            disabled={disabled}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {/* Simple SVG for Eye / Eye-slash */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isPasswordVisible ? (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              )}
            </svg>
          </button>
        ) : (
          iconRight && <span className="sl-input__icon sl-input__icon--right">{iconRight}</span>
        )}
      </div>

      {/* Bottom Section: Helper Text & Character Counter */}
      {(helperText || error || maxLength) && (
        <div className="sl-input__bottom-row">
          <span id={helperId} className="sl-input__message">
            {error || helperText}
          </span>
          {maxLength && (
            <span className="sl-input__counter">
              {(value?.length || 0)} / {maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Input;