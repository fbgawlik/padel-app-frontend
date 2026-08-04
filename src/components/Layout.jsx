// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const Layout = () => {
  return (
    <div style={styles.appContainer}>
      {/* ─── DETALLES ESTÉTICOS DE BRILLO / AMBIENT GLOW ─── */}
      {/* Brillo Neón Superior Izquierdo */}
      <div style={styles.glowTopLeft} />
      {/* Brillo Sutil Central Derecho */}
      <div style={styles.glowBottomRight} />

      {/* Contenedor del contenido de las pantallas */}
      <main style={styles.mainContent}>
        <Outlet /> {/* Aquí se renderizan tus pantallas como Dashboard, Perfil, etc. */}
      </main>

      {/* Tu nueva barra de navegación minimalista */}
      <BottomNavigation />
    </div>
  );
};

const styles = {
  appContainer: {
    backgroundColor: '#0A0A0B', 
    height: '100dvh', // 1. Cambiado de minHeight: 100vh a height: 100dvh
    width: '100vw',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column', // 2. Agregado para organizar el flexbox
    justifyContent: 'center', 
    position: 'relative',
    overflow: 'hidden', 
  },
  /* ─── ESTILOS DE LUCES DE AMBIENTE (GLOWS) SE MANTIENEN IGUAL ─── */
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
  /* ─── CONTENEDOR PRINCIPAL CORREGIDO ─── */
  mainContent: {
    width: '100%',
    maxWidth: '500px', 
    margin: '0 auto', // Mantiene la caja centrada en pantallas grandes
    flex: 1, // 3. Reemplaza el minHeight: 100vh. Toma el espacio disponible.
    paddingBottom: '110px', 
    paddingTop: '20px', 
    boxSizing: 'border-box',
    overflowY: 'auto', // 4. El scroll sucede estrictamente aquí adentro
    position: 'relative',
    zIndex: 2, 
    backdropFilter: 'blur(10px)', 
  }
};

export default Layout;