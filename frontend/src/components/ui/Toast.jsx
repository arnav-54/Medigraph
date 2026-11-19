import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import './ui.css';

const variantIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertCircle
};

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  action
}) {
  const Icon = variantIcons[variant] || Info;

  return (
    <div className={`mv-alert mv-alert--${variant} ${className}`} role="alert">
      <div className="mv-alert-icon-col">
        <Icon size={16} strokeWidth={2} />
      </div>

      <div className="mv-alert-body">
        {title && <h4 className="mv-alert-title">{title}</h4>}
        <div className="mv-alert-content">{children}</div>
        {action && <div className="mv-alert-action">{action}</div>}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="mv-alert-close"
          aria-label="Dismiss alert"
          type="button"
        >
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
