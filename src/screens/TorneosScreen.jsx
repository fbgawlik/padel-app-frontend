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

  // Validación de permisos para mostrar el botón flotante "+"
  const esOrganizador = usuario?.rol === 'admin_complejo' || usuario?.rol === 'organizador';

  // Fetch de torneos con revalidación forzada (staleTime: 0) para ver cambios instantáneos
 const { data: torneos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const res = await API.get('/torneos');
      // 🔥 ESTA LINEA TE DIRÁ LA VERDAD EN LA CONSOLA:
      console.log("👉 Lo que realmente llega del backend:", res.data);
      return res.data;
    },
    staleTime: 0, 
    refetchOnWindowFocus: true
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
      <div style={styles.alerta}>
        <p style={{ color: '#ff4d4d', fontWeight: 'bold', margin: 0 }}>Error al cargar los torneos.</p>
        <button onClick={() => refetch()} style={styles.btnReintentar}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <div style={styles.screenContainer}>
      
      {/* ─── ENCABEZADO PREMIUM ─── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.mainTitle}>Torneos</h1>
          <p style={styles.subtitle}>Competidores & Copas activos</p>
        </div>
        <button 
          onClick={() => setMostrarBuscador(!mostrarBuscador)} 
          style={styles.searchIconButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {/* ─── BUSCADOR EXPANDIBLE ─── */}
      {mostrarBuscador && (
        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Buscar por nombre del torneo..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      )}

      {/* ─── LISTADO DE TORNEOS (Tarjetas con Portada) ─── */}
      <div style={styles.listContainer}>
        {torneosFiltrados.length > 0 ? (
          torneosFiltrados.map((torneo) => {
            // Evaluamos el estado según las fechas (Simulado)
            const hoy = new Date().toISOString().split('T')[0];
            let estado = { texto: 'Inscripciones Abiertas', color: '#39FF14' };
            if (torneo.fechaInicio <= hoy && torneo.fechaFin >= hoy) {
              estado = { texto: 'En Curso 🎾', color: '#00E5FF' };
            } else if (torneo.fechaFin < hoy) {
              estado = { texto: 'Finalizado', color: '#8E8E93' };
            }

            // Imagen de portada elegida, fallback al complejo, fallback a diseño abstracto
            const bannerImagen = torneo.imagenPortada || torneo.complejo?.imagenUrl;

            return (
              <div key={torneo.id} style={styles.card}>
                
                {/* 🔥 SECCIÓN DE PORTADA VISUAL */}
                <div style={styles.cardImageContainer}>
                  {bannerImagen ? (
                    <img 
                      src={bannerImagen} 
                      alt={torneo.nombre} 
                      style={styles.cardImage} 
                    />
                  ) : (
                    <div style={styles.cardImagePlaceholder}>
                      <span>🏆 {torneo.nombre}</span>
                    </div>
                  )}
                  {/* Badge de Estado del Torneo flotando sobre la foto */}
                  <div style={{...styles.badgeFlotante, backgroundColor: `${estado.color}22`, borderColor: estado.color}}>
                    <span style={{...styles.statusDot, backgroundColor: estado.color}} />
                    <span style={{...styles.statusText, color: estado.color}}>{estado.texto}</span>
                  </div>
                </div>

                {/* CONTENIDO INFORMATIVO DE LA TARJETA */}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{torneo.nombre}</h3>
                  
                  {/* Grid de detalles estilo Airbnb */}
                  <div style={styles.gridDetails}>
                    <div style={styles.gridItem}>
                      <span style={styles.gridLabel}>Categorías</span>
                      <span style={styles.gridValue} className="truncate">{torneo.categoria || 'Varias'}</span>
                    </div>
                    <div style={styles.gridItem}>
                      <span style={styles.gridLabel}>Cupo Máx.</span>
                      <span style={styles.gridValue}>{torneo.cupoParejas || 12} Par.</span>
                    </div>
                    <div style={styles.gridItem}>
                      <span style={styles.gridLabel}>Inscripción</span>
                      <span style={{...styles.gridValue, color: '#39FF14'}}>
                        ${torneo.precioInscripcion || torneo.precio || '0'}
                      </span>
                    </div>
                  </div>

                  {/* Footer de la tarjeta con Fechas e Icono */}
                  <div style={styles.cardFooter}>
                    <div style={styles.dateContainer}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{torneo.fechaInicio} al {torneo.fechaFin}</span>
                    </div>

                    {/* Botón de navegación hacia el Detalle del Torneo */}
                    <button 
                      onClick={() => navigate(`/torneos/${torneo.id}`)} 
                      style={styles.btnVerDetalles}
                    >
                      Ver detalles
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.noResults}>
            <span style={{fontSize: '40px'}}>🎾</span>
            <p style={{color: '#8E8E93', marginTop: '12px'}}>No se encontraron torneos disponibles.</p>
          </div>
        )}
      </div>

      {/* ─── BOTÓN FLOTANTE SÓLO PARA ORGANIZADORES ─── */}
      {esOrganizador && (
        <button 
          onClick={() => navigate('/torneos/crear')} 
          style={styles.fabButton}
          title="Crear Nuevo Torneo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

const styles = {
  screenContainer: {
    padding: '24px 20px 100px 20px',
    backgroundColor: 'transparent',
    width: '100%',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
  },
  mainTitle: {
    fontSize: '28px', fontWeight: '800', color: '#FFF', margin: 0, letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px', color: '#8E8E93', margin: '4px 0 0 0', fontWeight: '500'
  },
  searchIconButton: {
    width: '44px', height: '44px', borderRadius: '14px',
    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
  },
  searchContainer: {
    marginBottom: '20px', animation: 'fadeIn 0.2s ease'
  },
  searchInput: {
    width: '100%', padding: '14px 16px', borderRadius: '14px',
    backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  },
  listContainer: {
    display: 'flex', flexDirection: 'column', gap: '24px'
  },
  
  // CARD PREMIUM ESTILO MODERNO
  card: {
    backgroundColor: 'rgba(22, 22, 24, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.24)'
  },
  cardImageContainer: {
    position: 'relative', width: '100%', height: '150px', overflow: 'hidden'
  },
  cardImage: {
    width: '100%', height: '100%', objectFit: 'cover'
  },
  cardImagePlaceholder: {
    width: '100%', height: '100%', 
    background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#39FF14', fontWeight: '700', fontSize: '16px', padding: '20px', textAlign: 'center'
  },
  badgeFlotante: {
    position: 'absolute', top: '12px', left: '12px',
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '12px', border: '1px solid'
  },
  statusDot: {
    width: '6px', height: '6px', borderRadius: '50%'
  },
  statusText: {
    fontSize: '11px', fontWeight: '700', letterSpacing: '0.3px'
  },
  cardBody: {
    padding: '20px'
  },
  cardTitle: {
    color: '#FFF', fontSize: '20px', fontWeight: '700', margin: '0 0 16px 0',
    textTransform: 'uppercase', letterSpacing: '0.3px'
  },
  gridDetails: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px'
  },
  gridItem: {
    display: 'flex', flexDirection: 'column', gap: '4px'
  },
  gridLabel: {
    color: '#8E8E93', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
  },
  gridValue: {
    color: '#FFF', fontSize: '13px', fontWeight: '700'
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px'
  },
  dateContainer: {
    display: 'flex', alignItems: 'center', color: '#A0A0A5', fontSize: '12px', fontWeight: '500'
  },
  btnVerDetalles: {
    padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
  },

  // ESTADOS AUXILIARES
  centerContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column'
  },
  spinner: {
    width: '36px', height: '36px', border: '3px solid rgba(57, 255, 20, 0.1)',
    borderTopColor: '#39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite'
  },
  alerta: {
    padding: '20px', backgroundColor: 'rgba(255, 77, 77, 0.05)', borderRadius: '16px',
    border: '1px solid rgba(255, 77, 77, 0.2)', textAlign: 'center'
  },
  btnReintentar: {
    marginTop: '12px', padding: '8px 16px', backgroundColor: '#ff4d4d', color: '#FFF',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
  },
  noResults: {
    textAlign: 'center', padding: '40px 20px'
  },

  // BOTÓN ACCIÓN FLOTANTE (FAB)
  fabButton: {
    position: 'fixed', bottom: '104px', right: '24px',
    width: '56px', height: '56px', borderRadius: '28px',
    backgroundColor: '#39FF14', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', boxShadow: '0 4px 16px rgba(57, 255, 20, 0.4)', cursor: 'pointer', zIndex: 99
  }
};

export default TorneosScreen;