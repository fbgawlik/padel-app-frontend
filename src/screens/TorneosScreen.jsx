// src/screens/TorneosScreen.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './TorneosScreen.styles';

const TorneosScreen = () => {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarBuscador, setMostrarBuscador] = useState(false);
  const [filtroFormato, setFiltroFormato] = useState('TODOS'); // 'TODOS' | 'TRADICIONAL' | 'AMERICANO'

  // Validación de permisos para mostrar funcionalidades de administración
  const esOrganizador = usuario?.rol === 'admin_complejo' || usuario?.rol === 'organizador';

  // Fetch de torneos con revalidación forzada
  const { data: torneos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const res = await API.get('/torneos');
      return res.data;
    },
    staleTime: 0, 
    refetchOnWindowFocus: true
  });

  // Helper para detectar si un torneo es de formato Americano
  const esTorneoAmericano = (torneo) => {
    return (
      torneo.partidos?.some(p => p.tipoFase === 'AMERICANO') ||
      torneo.nombre?.toLowerCase().includes('americano') ||
      torneo.reglas?.toLowerCase().includes('americano')
    );
  };

  // Filtrado por búsqueda y tipo de torneo
  const torneosFiltrados = torneos.filter(t => {
    const coincideNombre = t.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const esAmericano = esTorneoAmericano(t);

    if (!coincideNombre) return false;

    if (filtroFormato === 'AMERICANO') return esAmericano;
    if (filtroFormato === 'TRADICIONAL') return !esAmericano;
    return true;
  });

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

      {/* ─── FILTROS DE FORMATO ─── */}
      <div style={styles.filterTabsContainer}>
        {['TODOS', 'TRADICIONAL', 'AMERICANO'].map((formato) => (
          <button
            key={formato}
            onClick={() => setFiltroFormato(formato)}
            style={{
              ...styles.filterTab,
              ...(filtroFormato === formato ? styles.filterTabActive : {})
            }}
          >
            {formato === 'TODOS' && 'Todos'}
            {formato === 'TRADICIONAL' && 'tradicional'}
            {formato === 'AMERICANO' && 'Americanos '}
          </button>
        ))}
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
            const hoy = new Date().toISOString().split('T')[0];
            let estado = { texto: 'Inscripciones Abiertas', color: '#39FF14' };
            if (torneo.fechaInicio <= hoy && torneo.fechaFin >= hoy) {
              estado = { texto: 'En Curso 🎾', color: '#00E5FF' };
            } else if (torneo.fechaFin < hoy) {
              estado = { texto: 'Finalizado', color: '#8E8E93' };
            }

            const esAmericano = esTorneoAmericano(torneo);
            const imagenCruda = torneo.imagenPortada || torneo.complejo?.imagenUrl;
            const bannerImagen = resolverUrlImagen(imagenCruda);

            return (
              <div key={torneo.id} style={styles.card}>
                
                {/* SECCIÓN DE PORTADA VISUAL */}
                <div style={styles.cardImageContainer}>
                  {bannerImagen ? (
                    <img 
                      src={bannerImagen} 
                      alt={torneo.nombre} 
                      style={styles.cardImage} 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%); display: flex; align-items: center; justify-content: center; color: #39FF14; font-weight: 700; font-size: 16px;">🏆 ${torneo.nombre}</div>`;
                      }}
                    />
                  ) : (
                    <div style={styles.cardImagePlaceholder}>
                      <span>🏆 {torneo.nombre}</span>
                    </div>
                  )}

                  {/* Badges Flotantes */}
                  <div style={styles.badgeGroupFlotante}>
                    {/* Badge de Estado */}
                    <div style={{...styles.badgeFlotante, backgroundColor: `${estado.color}22`, borderColor: estado.color}}>
                      <span style={{...styles.statusDot, backgroundColor: estado.color}} />
                      <span style={{...styles.statusText, color: estado.color}}>{estado.texto}</span>
                    </div>

                    {/* Badge de Formato Americano (Si Aplica) */}
                    {esAmericano && (
                      <div style={styles.badgeAmericano}>
                        <span>⚡ AMERICANO</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTENIDO INFORMATIVO DE LA TARJETA */}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{torneo.nombre}</h3>
                  
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

                  <div style={styles.cardFooter}>
                    
                    {/* LADO IZQUIERDO: Fecha y Botón de Gestión (Si es Admin) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={styles.dateContainer}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{torneo.fechaInicio} al {torneo.fechaFin}</span>
                      </div>
                      
                      {(
                        esOrganizador || (
                        usuario?.id && (
                          usuario.id === torneo.complejo?.administradorId ||
                          usuario.id === torneo.usuarioId ||
                          usuario.id === torneo.organizadorId
                        ))
                      ) && (
                        <button 
                          onClick={() => navigate(`/torneos/${torneo.id}/gestion`)} 
                          style={styles.btnGestionar}
                          title="Gestionar torneo"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                          Gestionar
                        </button>
                      )}
                    </div>

                    {/* LADO DERECHO: Ver Detalles */}
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

;

export default TorneosScreen;