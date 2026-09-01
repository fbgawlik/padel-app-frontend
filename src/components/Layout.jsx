// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const Layout = () => {
  return (
    <div style={styles.appContainer}>
      {/* ─── DETALLES ESTÉTICOS DE BRILLO / AMBIENT GLOW ─── */}
      <div style={styles.glowTopLeft} />
      <div style={styles.glowBottomRight} />

      {/* Contenedor del contenido de las pantallas */}
      <main style={styles.mainContent}>
        <Outlet />
      </main>

      {/* Barra de navegación inferior */}
      <BottomNavigation />
    </div>
  );
};

const styles = {
  appContainer: {
    backgroundColor: '#0A0A0B',
    minHeight: '100dvh', // min (no height fija): el contenido nunca se corta
    width: '100%',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start', // el contenido fluye desde arriba (antes 'center' podía comprimir)
    position: 'relative',
    overflowX: 'hidden', // solo horizontal: el scroll vertical vive en el documento
  },
  /* ─── LUCES DE AMBIENTE (GLOWS) ─── */
  glowTopLeft: {
    position: 'absolute',
    top: '-150px',
    left: 'calc(50% - 300px)',
    width: '300px',
    height: '300px',
    backgroundColor: '#CCFF00',
    borderRadius: '50%',
    opacity: '0.06',
    filter: 'blur(90px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '100px',
    right: 'calc(50% - 250px)',
    width: '250px',
    height: '250px',
    backgroundColor: '#00E5FF',
    borderRadius: '50%',
    opacity: '0.04',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  /* ─── CONTENIDO PRINCIPAL ─── */
  mainContent: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    flex: 1,
    // Espacio inferior reservado para la barra de navegación fija (64px + 24px de margen)
    paddingBottom: '112px',
    paddingTop: '8px',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 2,
  },
};

export default Layout;