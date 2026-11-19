import React from 'react';
import './ui.css';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseClass = `mv-btn mv-btn--${variant} mv-btn--${size} ${loading ? 'mv-btn--loading' : ''} ${className}`;

  return (
    <button
      className={baseClass}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="mv-btn-spinner" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="mv-btn-icon" size={size === 'sm' ? 14 : 16} strokeWidth={2} />
      ) : null}
      
      {children && <span className="mv-btn-label">{children}</span>}

      {!loading && IconRight && (
        <IconRight className="mv-btn-icon-right" size={size === 'sm' ? 14 : 16} strokeWidth={2} />
      )}
    </button>
  );
}
