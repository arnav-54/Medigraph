import React from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext.jsx';

export function LanguageSelectorModal({ isOpen, onClose }) {
  const { lang, selectLanguage } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (code) => {
    selectLanguage(code);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 150,
      padding: '1.25rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8FAFC'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Select Language / भाषा चुनें
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>
              Choose your preferred language for reports, guides, and chat.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#94A3B8',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Grid of Languages */}
        <div style={{
          padding: '1.5rem 1.75rem',
          maxHeight: '440px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.75rem'
        }}>
          {SUPPORTED_LANGUAGES.map((item) => {
            const isSelected = item.code === lang;
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                  border: isSelected ? '2px solid #0D9488' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(13, 148, 136, 0.15)' : 'none'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: isSelected ? '#0F766E' : '#0F172A'
                  }}>
                    {item.native}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    {item.name} · {item.region}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ color: '#0D9488', fontSize: '1.1rem', fontWeight: 800 }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, padding: '0.5rem 1.25rem' }}
          >
            Close / बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}

