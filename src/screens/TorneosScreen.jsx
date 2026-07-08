// src/screens/TorneosScreen.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';

const TorneosScreen = () => {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBuscador, setMostrarBuscador] = useState(false);

  // Validación de permisos
  const esOrganizador = usuario?.rol === 'admin_complejo' || usuario?.rol === 'organizador';

  // Fetch de torneos
  const { data: torneos = [], isLoading, isError } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const res = await API.get('/torneos');
      return res.data;
    }
  });

  const torneosFiltrados = torneos.filter(t => 
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (isLoading) return (
    <div style={styles.centerContainer}>
      <div style={styles.spinner}></div>
    </div>
  );

  if (isError) return (
    <div style={styles.centerContainer}>
      <div style={styles.alerta}><span>⚠️ Error al cargar los torneos.</span></div>
    </div>
  );

  return (
    <div style={styles.screenContainer}>
      
      {/* ─── BARRA SUPERIOR (Inspirada en la referencia) ─── */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button onClick={() => navigate(-1)} style={styles.iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span style={styles.brandText}>
            <span style={{color: '#39FF14'}}>🎾</span> PADEL<span style={{fontWeight: '400'}}>APP</span>
          </span>
        </div>
        
        <div style={styles.topRight}>
          <button onClick={() => setMostrarBuscador(!mostrarBuscador)} style={styles.circleButton}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <div style={styles.avatar}>
            {usuario?.nombre ? usuario.nombre.substring(0, 2).toUpperCase() : 'JD'}
          </div>
        </div>
      </div>

      {/* ─── TÍTULOS Y BUSCADOR ─── */}
      <div style={styles.headerSection}>
        <p style={styles.subTitle}>TORNEOS</p>
        <h1 style={styles.mainTitle}>Lista de Torneos Existentes</h1>
        
        {mostrarBuscador && (
          <div style={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              style={styles.searchInput}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* ─── LISTA DE TORNEOS (Layout Vertical Unificado) ─── */}
      <div style={styles.listContainer}>
        
        {/* BOTÓN CREAR TORNEO (Solo Admin) */}
        {esOrganizador && (
          <button style={styles.botonCrear} onClick={() => navigate('/torneos/crear')}>
            <span>➕</span> CREAR NUEVO TORNEO
          </button>
        )}

        {torneosFiltrados.length > 0 ? torneosFiltrados.map((torneo, index) => {
          // Simulamos el estado (Próximo / En Curso) para que se vea como la referencia
          const esEnCurso = index % 3 === 0; 

          return (
            <div key={torneo.id} style={styles.card}>
              
              {/* Etiqueta de Estado */}
              <div style={styles.badgeContainer}>
                <div style={{
                  ...styles.statusDot, 
                  backgroundColor: esEnCurso ? '#39FF14' : '#FF9F0A'
                }} />
                <span style={{
                  ...styles.statusText,
                  color: esEnCurso ? '#39FF14' : '#FF9F0A'
                }}>
                  {esEnCurso ? 'EN CURSO' : 'PRÓXIMO'}
                </span>
              </div>

              {/* Título del Torneo */}
              <h2 style={styles.cardTitle}>{torneo.nombre}</h2>

              {/* Grilla de Detalles (3 columnas) */}
              <div style={styles.gridDetails}>
                <div style={styles.gridItem}>
                  <span style={styles.gridLabel}>Complejo</span>
                  <span style={styles.gridValue}>{torneo.complejo?.nombre?.substring(0,15) || 'Sede A Conf.'}</span>
                </div>
                <div style={styles.gridItem}>
                  <span style={styles.gridLabel}>Categoría</span>
                  <span style={styles.gridValue}>{torneo.categoria || 'General'}</span>
                </div>
                <div style={styles.gridItem}>
                  <span style={styles.gridLabel}>Inscripción</span>
                  <span style={styles.gridValue}>${torneo.precioInscripcion?.toLocaleString() || '0'}</span>
                </div>
              </div>

              {/* Fechas / Info extra */}
              <div style={styles.dateContainer}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0A0A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{torneo.fechaInicio ? `Inicia: ${torneo.fechaInicio}` : 'Fecha a confirmar'}</span>
              </div>

              {/* Botón de Acción Principal */}
              <button 
                style={styles.actionButton}
                onClick={() => navigate(`/torneos/${torneo.id}`)}
              >
                VER DETALLES
              </button>
            </div>
          )
        }) : (
          <p style={styles.textoVacio}>No se encontraron torneos disponibles.</p>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS INSPIRADOS EN LA IMAGEN DE REFERENCIA (Adaptados al Neón Verde) ---
const styles = {
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'transparent' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(57, 255, 20, 0.2)', borderTop: '3px solid #39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  alerta: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', fontWeight: '600' },

  screenContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    paddingBottom: '110px', // Mantiene el espacio vital para el BottomNavigation
  },

  // BARRA SUPERIOR
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 20px 10px 20px',
  },
  topLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  topRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconButton: { background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' },
  brandText: { color: '#FFF', fontSize: '18px', fontWeight: '800', letterSpacing: '1px' },
  
  circleButton: {
    width: '40px', height: '40px', borderRadius: '20px',
    backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
  },
  avatar: {
    width: '40px', height: '40px', borderRadius: '20px',
    backgroundColor: '#334155', color: '#FFF', fontSize: '14px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)'
  },

  // SECCIÓN TÍTULO
  headerSection: {
    padding: '10px 20px 20px 20px',
  },
  subTitle: { color: '#8E8E93', fontSize: '13px', fontWeight: '600', letterSpacing: '1px', margin: '0 0 4px 0' },
  mainTitle: { color: '#FFF', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' },
  
  searchContainer: { marginTop: '16px' },
  searchInput: {
    width: '100%', padding: '14px 16px', borderRadius: '12px',
    backgroundColor: '#1C1C1E', border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box'
  },

  // LISTA Y TARJETAS
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 20px 20px 20px',
  },
  
  botonCrear: {
    width: '100%', padding: '16px', borderRadius: '16px',
    backgroundColor: 'rgba(57, 255, 20, 0.05)', border: '1px dashed #39FF14',
    color: '#39FF14', fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px',
    cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
    transition: 'all 0.2s ease',
  },

  card: {
    backgroundColor: '#1C1C1E', // Fondo gris oscuro sólido, como en la referencia
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  badgeContainer: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px',
    borderRadius: '12px', marginBottom: '12px'
  },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%' },
  statusText: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' },
  
  cardTitle: {
    color: '#FFF', fontSize: '20px', fontWeight: '700',
    margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px',
    lineHeight: '1.2'
  },

  gridDetails: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px'
  },
  gridItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  gridLabel: { color: '#8E8E93', fontSize: '12px', fontWeight: '500' },
  gridValue: { color: '#FFF', fontSize: '14px', fontWeight: '600' },

  dateContainer: {
    display: 'flex', alignItems: 'center', color: '#A0A0A5', fontSize: '13px',
    fontWeight: '500', marginBottom: '20px', paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },

  actionButton: {
    width: '100%', padding: '14px', borderRadius: '12px',
    backgroundColor: 'rgba(84, 101, 126, 0.2)', // Tono similar al botón de la referencia (azulado/grisáceo)
    color: '#8EA1BB', border: 'none', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', letterSpacing: '0.5px'
  },

  textoVacio: { color: '#8E8E93', textAlign: 'center', marginTop: '20px', fontSize: '15px' },
};

export default TorneosScreen;