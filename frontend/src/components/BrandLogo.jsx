import React from 'react';

export function BrandLogo({ size = 'md', light = false, showTagline = true, iconOnly = false }) {
  const iconSizes = {
    sm: 30,
    md: 38,
    lg: 46
  };
  const currentSize = iconSizes[size] || iconSizes.md;

  return (
    <div
      role="banner"
      aria-label="MediVault Clinical Records"
      style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'sm' ? '10px' : '12px', userSelect: 'none' }}
    >
      {/* Authentic Clinical Emblem — Pure Minimalist Geometry */}
      <div
        style={{
          width: `${currentSize}px`,
          height: `${currentSize}px`,
          borderRadius: `${currentSize * 0.32}px`,
          background: light
            ? 'linear-gradient(135deg, #065F46 0%, #047857 100%)'
            : 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(6, 78, 59, 0.25)',
          flexShrink: 0
        }}
      >
        <svg
          width={currentSize * 0.6}
          height={currentSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Medical Clinical Cross + Vital Flow */}
          <path
            d="M9 3H15V9H21V15H15V21H9V15H3V9H9V3Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
            rx="1.5"
          />
          {/* Subtle inner pulse aperture */}
          <circle cx="12" cy="12" r="2.5" fill={light ? '#047857' : '#064E3B'} />
        </svg>
      </div>

      {!iconOnly && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
                letterSpacing: '-0.035em',
                color: light ? '#FFFFFF' : '#0F172A',
                lineHeight: 1.15
              }}
            >
              Medi
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: size === 'sm' ? '16px' : size === 'lg' ? '22px' : '18px',
                letterSpacing: '-0.035em',
                color: light ? '#34D399' : '#065F46',
                lineHeight: 1.15
              }}
            >
              Vault
            </span>
          </div>

          {showTagline && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: size === 'sm' ? '10px' : '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: light ? 'rgba(255,255,255,0.65)' : '#065F46',
                marginTop: '1px',
                opacity: light ? 0.8 : 0.85
              }}
            >
              Clinical Records
            </span>
          )}
        </div>
      )}
    </div>
  );
}
