import React, { forwardRef } from 'react';
import './ui.css';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    icon: Icon,
    iconRight: IconRight,
    id,
    disabled = false,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`mv-input-group ${error ? 'mv-input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mv-input-label">
          {label}
        </label>
      )}

      <div className="mv-input-wrapper">
        {Icon && (
          <span className="mv-input-icon-left">
            <Icon size={16} strokeWidth={2} />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`mv-input ${Icon ? 'mv-input--has-left' : ''} ${IconRight ? 'mv-input--has-right' : ''}`}
          {...props}
        />

        {IconRight && (
          <span className="mv-input-icon-right">
            <IconRight size={16} strokeWidth={2} />
          </span>
        )}
      </div>

      {error ? (
        <p className="mv-input-error" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="mv-input-helper">{helper}</p>
      ) : null}
    </div>
  );
});
