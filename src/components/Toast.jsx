import React, { useEffect, useState } from 'react';

const Toast = ({ mensaje, tipo, onClose }) => {
  const [visible, setVisible] = useState(false);

  // Animación de entrada y salida
  useEffect(() => {
    // Pequeño delay para que la transición de CSS se aplique al montar
    requestAnimationFrame(() => setVisible(true));
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Espera a que termine la animación para desmontar
    }, 3000); // La notificación dura 3 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  // Definir colores según el tipo de notificación
  const colores = {
    success: '#39FF14', // Tu verde neón
    error: '#FF3333',   // Rojo para errores
    info: '#00E5FF'     // Tu cian/azul para información
  };

  const colorActivo = colores[tipo] || colores.info;

  return (
    <div style={{
      ...styles.toastContainer,
      transform: visible ? 'translateY(0)' : 'translateY(-20px)',
      opacity: visible ? 1 : 0,
      borderLeft: `4px solid ${colorActivo}`,
      boxShadow: `0px 4px 15px ${colorActivo}20` // Brillo sutil del color
    }}>
      <div style={styles.iconContainer}>
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
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)', // Centrado horizontal
    marginLeft: '-50%', // Ajuste para centrar correctamente en pantallas anchas
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: 'rgba(18, 18, 20, 0.85)', // Mismo fondo que tu navbar
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    zIndex: 9999,
    minWidth: '280px',
    maxWidth: '90%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Transición suave
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
  },
  mensaje: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: '-0.2px',
  }
};

export default Toast;