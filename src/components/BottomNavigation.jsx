// src/components/BottomNavigation.jsx
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useContext(AuthContext);

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
                backgroundColor: isActive ? 'rgba(57, 255, 20, 0.12)' : 'transparent',
                padding: isActive ? '10px 16px' : '10px 12px',
                flex: isActive ? 1.5 : 1,
              }}
            >
              <span style={{ 
                ...styles.icon, 
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                filter: isActive ? 'drop-shadow(0 0 6px rgba(57, 255, 20, 0.6))' : 'none'
              }}>
                {tab.icono}
              </span>
              
              {isActive && (
                <span style={styles.label}>
                  {tab.nombre}
                </span>
              )}
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
    bottom: '24px',
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 24px',
    zIndex: 1000,
  },
  navBar: {
    width: '100%',
    maxWidth: '420px',
    height: '100%',
    backgroundColor: 'rgba(18, 18, 20, 0.82)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: '32px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8px',
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.6)',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '46px',
    borderRadius: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    gap: '6px',
  },
  icon: {
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#39FF14',
    letterSpacing: '-0.2px',
  }
};

export default BottomNavigation;