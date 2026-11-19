import React from 'react';
import './ui.css';

export function Tabs({
  items = [],
  activeId,
  onChange,
  variant = 'pill', // 'pill' or 'line'
  className = ''
}) {
  return (
    <div className={`mv-tabs mv-tabs--${variant} ${className}`} role="tablist">
      {items.map((item) => {
        const isActive = item.id === activeId;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            className={`mv-tab-item ${isActive ? 'mv-tab-item--active' : ''}`}
            onClick={() => onChange(item.id)}
            type="button"
          >
            {Icon && <Icon size={14} strokeWidth={2} className="mv-tab-icon" />}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span className={`mv-tab-badge ${isActive ? 'mv-tab-badge--active' : ''}`}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
