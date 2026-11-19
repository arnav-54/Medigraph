import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext.jsx';
import { Modal, Badge } from './ui';

export function LanguageSelectorModal({ isOpen, onClose }) {
  const { lang, selectLanguage } = useLanguage();

  const handleSelect = (code) => {
    selectLanguage(code);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Regional Language"
      description="Available across all 11 official regional scripts and patient consultations."
      maxWidth="560px"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
        {SUPPORTED_LANGUAGES.map((item) => {
          const isSelected = item.code === lang;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelect(item.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--surface)',
                border: isSelected ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: isSelected ? 'var(--accent-ink)' : 'var(--ink)' }}>
                  {item.native}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', marginTop: '2px' }}>
                  {item.name} · {item.region}
                </div>
              </div>

              {isSelected && (
                <div style={{ width: '20px', height: '20px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} strokeWidth={2.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
