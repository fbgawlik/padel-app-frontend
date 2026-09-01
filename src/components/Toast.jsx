// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

const Toast = ({ mensaje, tipo, onClose }) => {
  const [visible, setVisible] = useState(false);

  // Animación de entrada y salida
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Espera a que termine la animación para desmontar
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Definir colores según el tipo de notificación
  const colores = {
    success: '#39FF14', // Verde neón
    error: '#FF3333',   // Rojo para errores
    info: '#00E5FF'     // Cian para información
  };

  const colorActivo = colores[tipo] || colores.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        ...styles.toastContainer,
        // Combinamos SIEMPRE el centrado horizontal con la animación vertical
        transform: `translateX(-50%) translateY(${visible ? '0' : '-24px'})`,
        opacity: visible ? 1 : 0,
        borderLeft: `4px solid ${colorActivo}`,
        boxShadow: `0px 4px 15px ${colorActivo}20`, // Brillo sutil del color
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
    backgroundColor: 'rgba(18, 18, 20, 0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
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
    color: '#FFFFFF',
    letterSpacing: '-0.2px',
  },
};

export default Toast;