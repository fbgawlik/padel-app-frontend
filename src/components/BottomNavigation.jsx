// src/components/BottomNavigation.jsx
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useContext(AuthContext);

  // Definimos las 4 pestañas principales de la experiencia móvil
  const tabs = [
    { nombre: 'Inicio', ruta: '/dashboard', icono: '🏠' },
    { nombre: 'Buscar', ruta: '/turnos', icono: '🎾' },
    { nombre: 'Mis Turnos', ruta: '/mis-reservas', icono: '📅' },
    { nombre: 'Perfil', ruta: '/perfil', icono: '👤' },
  ];

  return (
    <div style={styles.navContainer}>
      <div style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.ruta;
          return (
            <button
              key={tab.ruta}
              onClick={() => navigate(tab.ruta)}
              style={{
                ...styles.tabButton,
                color: isActive ? '#39FF14' : '#8E8E93', // Verde neón si está activo, gris si no
              }}
            >
              <span style={{ 
                ...styles.icon, 
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
                textShadow: isActive ? '0 0 10px rgba(57, 255, 20, 0.4)' : 'none'
              }}>
                {tab.icono}
              </span>
              <span style={{ 
                ...styles.label, 
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#ffffff' : '#8E8E93' 
              }}>
                {tab.nombre}
              </span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '84px',
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '0 16px',
    zIndex: 1000,
  },
  navBar: {
    width: '100%',
    maxWidth: '500px', // Limita el ancho en pantallas más grandes para mantener la estética móvil
    height: '64px',
    backgroundColor: 'rgba(26, 26, 26, 0.85)', // Fondo gris oscuro con opacidad
    backdropFilter: 'blur(20px)', // Efecto esmerilado de iOS/Figma
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '32px', // Bordes ultra redondeados como el video
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 8px',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    gap: '4px',
  },
  icon: {
    fontSize: '20px',
    transition: 'transform 0.2s ease',
  },
  label: {
    fontSize: '11px',
    transition: 'color 0.2s ease',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '4px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#39FF14', // Puntito verde neón indicador
    boxShadow: '0 0 8px #39FF14',
  }
};

export default BottomNavigation;