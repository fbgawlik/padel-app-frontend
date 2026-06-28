// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const Layout = () => {
  return (
    <div style={styles.appContainer}>
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
    backgroundColor: '#0F0F10', // Fondo negro/gris oscuro profundo minimalista
    minHeight: '100vh',
    width: '100vw',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'center', // Centra la app si se abre en una PC
    position: 'relative',
  },
  mainContent: {
    width: '100%',
    maxWidth: '500px', // Mantiene la proporción de app móvil limpia incluso en monitores
    minHeight: '100vh',
    paddingBottom: '100px', // Margen de seguridad para que el contenido no tape la barra de navegación inferior
    boxSizing: 'border-box',
    overflowY: 'auto',
    position: 'relative',
  }
};

export default Layout;