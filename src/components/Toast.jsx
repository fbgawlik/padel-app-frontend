// src/components/Toast.jsx
// ───────────────────────────────────────────────────────────
// Refactor v2: usa tokens del theme. Mantiene la misma API
// (mensaje, tipo, onClose) para no romper los usos existentes.
// ───────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { theme } from '../theme';

const Toast = ({ mensaje, tipo, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colores = {
    success: theme.colors.primary,
    error: theme.colors.danger,
    info: theme.colors.secondaryGlow,
  };

  const colorActivo = colores[tipo] || colores.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        ...styles.toastContainer,
        transform: `translateX(-50%) translateY(${visible ? '0' : '-24px'})`,
        opacity: visible ? 1 : 0,
        borderLeft: `4px solid ${colorActivo}`,
        boxShadow: `0px 4px 15px ${colorActivo}20`,
      }}
    >
      <div style={{ ...styles.iconContainer, color: colorActivo }}>
        {tipo === 'success' && '✓'}
        {tipo === 'error' && '✕'}
        {tipo === 'info' && 'i'}
      </div>
      <span style={styles.mensaje}>{mensaje}</span>
    </div>
  );
};

const styles = {
  toastContainer: {
    position: 'fixed',
    top: '18px',
    left: '50%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: theme.colors.cardBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    zIndex: 9999,
    minWidth: '0',
    maxWidth: 'min(90vw, 420px)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: '14px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  mensaje: {
    fontSize: '14px',
    fontWeight: '500',
    color: theme.colors.text,
    letterSpacing: '-0.2px',
  },
};

export default Toast;
