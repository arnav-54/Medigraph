import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './ui.css';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = '520px',
  className = ''
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="mv-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`mv-modal-window ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mv-modal-header">
          <div>
            {title && <h2 className="mv-modal-title">{title}</h2>}
            {description && <p className="mv-modal-description">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="mv-modal-close"
            aria-label="Close dialog"
            type="button"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="mv-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
