import React from 'react';

const C = {
  bg:       '#181825',
  surface:  '#1e1e2e',
  surface2: '#24273a',
  border:   '#313244',
  text:     '#cdd6f4',
  muted:    '#6c7086',
  red:      '#f38ba8',
};

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: '12px',
          padding: '1.75rem',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 0.75rem', color: C.text, fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ margin: '0 0 1.5rem', color: C.muted, fontSize: '0.9rem', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: C.surface2,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: C.red,
              border: `1px solid ${C.red}`,
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
