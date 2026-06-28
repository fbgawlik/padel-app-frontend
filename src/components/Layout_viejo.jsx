// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = isMobile ? '0px' : (isCollapsed ? '88px' : '280px'); // Ligeramente más ancho para respirar

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0A', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* BARRA SUPERIOR (SOLO PARA CELULARES) */}
      {isMobile && (
        <div style={styles.mobileTopbar}>
          <button onClick={toggleSidebar} style={styles.hamburgerBtn}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h2 style={styles.mobileBrand}>ADN PÁDEL</h2>
        </div>
      )}

      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      {/* FONDO OSCURO EN MÓVIL AL ABRIR EL MENÚ CON BLUR */}
      {isMobile && !isCollapsed && (
        <div onClick={toggleSidebar} style={styles.overlay} />
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{ 
        flexGrow: 1, 
        marginLeft: sidebarWidth, 
        padding: isMobile ? '1.5rem 1rem' : '3rem 4rem', // Más espacio de respiración en PC
        boxSizing: 'border-box',
        width: `calc(100% - ${sidebarWidth})`,
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', // Transición ultra suave
        marginTop: isMobile ? '64px' : '0px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}> {/* Contenedor centralizado para pantallas grandes */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const styles = {
  mobileTopbar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: '64px', // Un poco más alto
    backgroundColor: 'rgba(15, 15, 15, 0.8)', // Transparente tipo cristal
    backdropFilter: 'blur(12px)', // Efecto cristalino moderno
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', // Borde súper sutil
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    zIndex: 90
  },
  hamburgerBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff', // Menos agresivo que el verde en el header
    cursor: 'pointer',
    marginRight: '20px',
    padding: 0,
    display: 'flex',
    alignItems: 'center'
  },
  mobileBrand: {
    color: '#00ff66',
    margin: 0,
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.5px', // Tracking más ajustado se ve más premium
  },
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)', // Desenfoque de fondo al abrir menú
    zIndex: 95,
    transition: 'all 0.3s ease'
  }
};

export default Layout;