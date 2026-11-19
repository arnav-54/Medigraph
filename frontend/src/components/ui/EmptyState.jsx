import React from 'react';
import './ui.css';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) {
  return (
    <div className={`mv-empty-state ${className}`}>
      {Icon && (
        <div className="mv-empty-icon-box">
          <Icon size={24} strokeWidth={1.75} className="mv-empty-icon" />
        </div>
      )}
      <h3 className="mv-empty-title">{title}</h3>
      {description && <p className="mv-empty-description">{description}</p>}
      {action && <div className="mv-empty-action">{action}</div>}
    </div>
  );
}
