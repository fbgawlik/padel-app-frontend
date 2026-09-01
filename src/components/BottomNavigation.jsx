// src/components/BottomNavigation.jsx
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const IconoInicio = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activo ? '#39FF14' : '#A0A0A5'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
);

const IconoBuscar = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activo ? '#39FF14' : '#A0A0A5'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.2" y2="16.2" />
  </svg>
);

const IconoTurnos = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activo ? '#39FF14' : '#A0A0A5'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="17" rx="3" />
    <line x1="3" y1="9.5" x2="21" y2="9.5" />
    <line x1="8" y1="2.5" x2="8" y2="6.5" />
    <line x1="16" y1="2.5" x2="16" y2="6.5" />
    {/* Pelotita de pádel dentro del calendario */}
    <circle cx="12" cy="15" r="2.6" />
  </svg>
);

const IconoPerfil = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={activo ? '#39FF14' : '#A0A0A5'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" />
  </svg>
);

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { nombre: 'Inicio', ruta: '/dashboard', Icono: IconoInicio },
    { nombre: 'Buscar', ruta: '/turnos', Icono: IconoBuscar },
    { nombre: 'Mis Turnos', ruta: '/mis-reservas', Icono: IconoTurnos },
    { nombre: 'Perfil', ruta: '/perfil', Icono: IconoPerfil },
  ];

  return (
    <nav style={styles.navContainer} aria-label="Navegación principal">
      <div style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.ruta;
          const Icono = tab.Icono;
          return (
            <button
              key={tab.ruta}
              onClick={() => navigate(tab.ruta)}
              aria-label={tab.nombre}
              aria-current={isActive ? 'page' : undefined}
              style={{
                ...styles.tabButton,
                backgroundColor: isActive ? 'rgba(57, 255, 20, 0.10)' : 'transparent',
                flex: isActive ? 1.6 : 1,
              }}
            >
              <span
                style={{
                  ...styles.icon,
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(57, 255, 20, 0.55))' : 'none',
                }}
              >
                <Icono activo={isActive} />
              </span>

              {isActive && <span style={styles.label}>{tab.nombre}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: '20px',
    left: 0,
    right: 0,
    height: '68px',
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 1000,
    pointerEvents: 'none', // el contenedor no bloquea clicks, solo la barra
  },
  navBar: {
    width: '100%',
    maxWidth: '420px',
    height: '100%',
    backgroundColor: 'rgba(18, 18, 20, 0.88)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: '32px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 10px',
    boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.6)',
    pointerEvents: 'auto', // la barra sí captura los clicks
    boxSizing: 'border-box',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '48px',
    borderRadius: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    gap: '7px',
    padding: '0 8px',
    WebkitTapHighlightColor: 'transparent',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#39FF14',
    letterSpacing: '-0.2px',
    whiteSpace: 'nowrap',
  },
};

export default BottomNavigation;