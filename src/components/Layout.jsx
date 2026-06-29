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
    backgroundColor: '#0A0A0B', // Un tono ligeramente más profundo para aumentar el contraste del brillo
    minHeight: '100vh',
    width: '100vw',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'center', // Centra la app si se abre en una PC
    position: 'relative',
    overflow: 'hidden', // Evita que los destellos generen scroll innecesario
  },
  /* ─── ESTILOS DE LUCES DE AMBIENTE (GLOWS) ─── */
  glowTopLeft: {
    position: 'absolute',
    top: '-150px',
    left: 'calc(50% - 300px)', // Centrado dinámico respecto al contenedor de 500px
    width: '300px',
    height: '300px',
    backgroundColor: '#CCFF00', // Tu Verde Neón de marca
    borderRadius: '50%',
    opacity: '0.06', // Extremadamente tenue para que sea elegante y no moleste
    filter: 'blur(90px)', // Difumina los bordes por completo creando el efecto "gas" o "brillo"
    pointerEvents: 'none', // Permite hacer click a través del elemento
    zIndex: 1,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '100px',
    right: 'calc(50% - 250px)',
    width: '250px',
    height: '250px',
    backgroundColor: '#00E5FF', // Un azul/cian complementario para dar armonía y dinamismo cromático
    borderRadius: '50%',
    opacity: '0.04',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  /* ─── CONTENEDOR PRINCIPAL ─── */
  mainContent: {
    width: '100%',
    maxWidth: '500px', // Mantiene la proporción de app móvil limpia incluso en monitores
    minHeight: '100vh',
    paddingBottom: '110px', // Un poco más de espacio para la nueva cápsula flotante
    paddingTop: '20px', // Margen superior estético general
    boxSizing: 'border-box',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 2, // Se posiciona por encima de las luces de fondo
    backdropFilter: 'blur(10px)', // Añade una cohesión visual increíble al hacer scroll sobre los brillos
  }
};

export default Layout;