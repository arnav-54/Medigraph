import React from 'react';
import './ui.css';

export function Skeleton({
  width,
  height,
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`mv-skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius,
        ...style
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonCard({ rows = 3, className = '' }) {
  return (
    <div className={`mv-card mv-skeleton-card ${className}`}>
      <Skeleton width="40%" height="18px" />
      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width={i === rows - 1 ? '70%' : '100%'} height="14px" />
        ))}
      </div>
    </div>
  );
}
