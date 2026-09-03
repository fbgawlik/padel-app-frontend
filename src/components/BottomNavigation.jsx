// src/components/BottomNavigation.jsx
// ───────────────────────────────────────────────────────────
// Refactor v2: indicador animado con transición CSS (sin
// dependencias extra), 5to tab "Torneos" agregado, touch
// targets ≥48px, usa tokens del theme en lugar de hex
// hardcodeados.
// ───────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { theme } from '../theme';

const stroke = (activo) => (activo ? theme.colors.primary : theme.colors.textSecondary);

const IconoInicio = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(activo)} strokeWidth={activo ? 2.4 : 2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
);

const IconoBuscar = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(activo)} strokeWidth={activo ? 2.4 : 2.2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.2" y2="16.2" />
  </svg>
);

const IconoTorneos = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(activo)} strokeWidth={activo ? 2.4 : 2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 0 0 12 0V4H6z" />
    <path d="M6 5H4v2a3 3 0 0 0 3 3M18 5h2v2a3 3 0 0 1-3 3" />
    <path d="M12 15v4M9 21h6M10 19h4" />
  </svg>
);

const IconoTurnos = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(activo)} strokeWidth={activo ? 2.4 : 2.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="17" rx="3" />
    <line x1="3" y1="9.5" x2="21" y2="9.5" />
    <line x1="8" y1="2.5" x2="8" y2="6.5" />
    <line x1="16" y1="2.5" x2="16" y2="6.5" />
    <circle cx="12" cy="15" r="2.6" />
  </svg>
);

const IconoPerfil = ({ activo }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(activo)} strokeWidth={activo ? 2.4 : 2.2} strokeLinecap="round" strokeLinejoin="round">
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
    { nombre: 'Torneos', ruta: '/torneos', Icono: IconoTorneos },
    { nombre: 'Mis Turnos', ruta: '/mis-reservas', Icono: IconoTurnos },
    { nombre: 'Perfil', ruta: '/perfil', Icono: IconoPerfil },
  ];

  const isActive = (ruta) => {
    if (ruta === '/torneos') return location.pathname.startsWith('/torneos');
    if (ruta === '/turnos') return location.pathname.startsWith('/turnos') || location.pathname.startsWith('/reservar');
    return location.pathname === ruta;
  };

  return (
    <nav style={styles.navContainer} aria-label="Navegación principal">
      <div style={styles.navBar}>
        {tabs.map((tab) => {
          const active = isActive(tab.ruta);
          const Icono = tab.Icono;
          return (
            <button
              key={tab.ruta}
              onClick={() => navigate(tab.ruta)}
              aria-label={tab.nombre}
              aria-current={active ? 'page' : undefined}
              style={styles.tabButton}
            >
              {active && (
                <span style={styles.activePill} />
              )}
              <span
                style={{
                  ...styles.icon,
                  filter: active ? `drop-shadow(0 0 6px ${theme.colors.primaryGlow})` : 'none',
                }}
              >
                <Icono activo={active} />
              </span>
              <span style={{ ...styles.label, color: active ? theme.colors.primary : theme.colors.textMuted }}>
                {tab.nombre}
              </span>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  navBar: {
    width: '100%',
    maxWidth: '440px',
    height: '100%',
    backgroundColor: theme.colors.cardBg,
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: '32px',
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px',
    boxShadow: theme.shadows.nav,
    pointerEvents: 'auto',
    boxSizing: 'border-box',
  },
  tabButton: {
    flex: 1,
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    height: '56px',
    minWidth: '48px',
    borderRadius: '26px',
    cursor: 'pointer',
    position: 'relative',
    WebkitTapHighlightColor: 'transparent',
    padding: '0 4px',
  },
  activePill: {
    position: 'absolute',
    inset: '4px',
    borderRadius: '24px',
    backgroundColor: theme.colors.primarySoft,
    boxShadow: `inset 0 0 0 1px ${theme.colors.primaryGlow}`,
    animation: 'fadeIn 0.25s ease',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    transition: 'transform 0.2s ease',
  },
  label: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
    whiteSpace: 'nowrap',
    position: 'relative',
    zIndex: 2,
    lineHeight: 1,
  },
};

export default BottomNavigation;
