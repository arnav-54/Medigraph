import React from 'react';
import './ui.css';

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  return (
    <span
      className={`mv-badge mv-badge--${variant} mv-badge--${size} ${className}`}
      {...props}
    >
      {dot && <span className="mv-badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
