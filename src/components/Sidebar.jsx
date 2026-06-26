// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobile }) => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Quitamos 'Mi Perfil' de aquí y sumamos 'Mis Reservas'
  const menuOpciones = [
    { nombre: 'Inicio', ruta: '/dashboard', icono: '🏠' },
    { nombre: 'Mis Reservas', ruta: '/mis-reservas', icono: '📅' }, 
    { nombre: 'Mi Complejo', ruta: '/gestion-complejo', icono: '🏢' }, 
    { nombre: 'Buscar Club', ruta: '/turnos', icono: '🎾' },
    { nombre: 'Clases', ruta: '/clases', icono: '🎓' },
    { nombre: 'Torneos', ruta: '/torneos', icono: '🏆' },
    { nombre: 'Ranking', ruta: '/ranking', icono: '🏅' }, 
  ];

  const opcionesVisibles = menuOpciones.filter((opcion) => {
    if (opcion.nombre === 'Mi Complejo') return usuario?.rol === 'admin_complejo';
    return true; 
  });

  const mostrarTextos = isMobile ? true : !isCollapsed;

  // Evaluamos si la ruta actual es la de perfil para iluminar el botón del footer
  const perfilActivo = location.pathname === '/perfil';

  const sidebarStyle = {
    ...styles.sidebar,
    width: isMobile ? '280px' : (isCollapsed ? '88px' : '280px'),
    transform: isMobile ? (isCollapsed ? 'translateX(-100%)' : 'translateX(0)') : 'none',
    position: isMobile ? 'fixed' : 'relative',
    zIndex: 1000,
  };

  return (
    <div style={sidebarStyle}>
      <div>
        {/* Header / Logo */}
        <div style={styles.header}>
          {mostrarTextos && (
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <h2 style={styles.logoText}>ADN Padel</h2>
              <span style={{fontSize: '24px'}}>🎾</span>
            </div>
          )}
          {!isMobile && (
            <button onClick={toggleSidebar} style={styles.btnToggle}>
              {isCollapsed ? '➡️' : '⬅️'}
            </button>
          )}
        </div>

        {/* Menú de Opciones */}
        <div style={styles.menuContainer}>
          {opcionesVisibles.map((opcion) => {
            const activo = location.pathname === opcion.ruta;
            return (
              <div
                key={opcion.nombre}
                onClick={() => {
                  navigate(opcion.ruta);
                  if (isMobile) toggleSidebar();
                }}
                style={{
                  ...styles.btnMenu,
                  ...(activo ? styles.btnActivo : {}),
                }}
              >
                <span style={{...styles.icono, color: activo ? '#00ff66' : '#8A8A8A'}}>{opcion.icono}</span>
                {mostrarTextos && <span>{opcion.nombre}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer de Usuario, Perfil y Logout */}
      <div style={styles.footer}>
        
        {/* 2. NUEVO SECTOR: Mi Perfil trasladado al Footer */}
        <div
          onClick={() => {
            navigate('/perfil');
            if (isMobile) toggleSidebar();
          }}
          style={{
            ...styles.btnMenuFooter,
            ...(perfilActivo ? styles.btnActivoFooter : {}),
          }}
        >
          <span style={{...styles.icono, color: perfilActivo ? '#00ff66' : '#8A8A8A'}}>👤</span>
          {mostrarTextos && <span>Mi Perfil</span>}
        </div>

        <div style={styles.usuarioCard}>
          {usuario?.imagenPerfil ? (
            <img 
              src={`http://localhost:5000${usuario.imagenPerfil}`} 
              alt="Perfil" 
              style={styles.avatarImg} 
            />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {mostrarTextos && (
            <div style={styles.usuarioInfo}>
              <span style={styles.nombreUsuario}>
                {usuario?.nombre} {usuario?.apellido}
              </span>
              <span style={styles.rolUsuario}>
                {usuario?.rol === 'admin_complejo' ? 'Administrador' : 'Jugador'}
              </span>
            </div>
          )}
        </div>

        {/* Botón Cerrar Sesión (Estilo Rojo) */}
        <div style={styles.btnLogout} onClick={logout}>
          <span style={{ fontSize: '18px' }}>🚪</span>
          {mostrarTextos && <span>Cerrar Sesión</span>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    backgroundColor: '#121212',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 0px 24px 0px',
    borderRight: '1px solid rgba(255, 255, 255, 0.04)',
    boxSizing: 'border-box',
    transition: 'width 0.2s ease, transform 0.2s ease',
    top: 0,
    left: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    padding: '0 24px',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '600',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  btnToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#8A8A8A',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingRight: '16px',
  },
  btnMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: '#8A8A8A',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    borderLeft: '4px solid transparent',
    borderRadius: '0 12px 12px 0',
  },
  btnActivo: {
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    color: '#00ff66',
    fontWeight: '600',
    borderLeft: '4px solid #00ff66',
  },
  // Nuevos estilos específicos para que el botón de Perfil se vea bien adaptado abajo
  btnMenuFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    color: '#8A8A8A',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    borderRadius: '8px',
    borderLeft: '4px solid transparent',
  },
  btnActivoFooter: {
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    color: '#00ff66',
    fontWeight: '600',
    borderLeft: '4px solid #00ff66',
  },
  icono: { 
    fontSize: '20px', 
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px', // Ajustado ligeramente para acomodar el nuevo botón
    padding: '20px 24px 0 24px',
  },
  usuarioCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarImg: {
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2A2A2A',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  usuarioInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  nombreUsuario: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rolUsuario: {
    color: '#8A8A8A',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  btnLogout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#D32F2F',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap',
  }
};

export default Sidebar;