import React from 'react';
import './ui.css';

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span
      className={`mv-badge mv-badge--${variant} mv-badge--${size} ${className}`}
      {...props}
    >
      {dot && <span className="mv-badge-dot" aria-hidden="true" />}
      {Icon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2.2} style={{ marginRight: '2px' }} />}
      <span>{children}</span>
    </span>
  );
}
