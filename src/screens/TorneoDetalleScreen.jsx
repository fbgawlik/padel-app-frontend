// src/screens/TorneoDetalleScreen.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';

const TorneoDetalleScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados de navegación interna de la pantalla
  const [pestanaActiva, setPestanaActiva] = useState('cronograma');
  const [diaSeleccionado, setDiaSeleccionado] = useState('vie_7');
  const [filtroGaleria, setFiltroGaleria] = useState('Todo');

  // Traemos el torneo específico usando React Query para consistencia con TorneosScreen
  const { data: torneo, isLoading, isError } = useQuery({
    queryKey: ['torneo', id],
    queryFn: async () => {
      const res = await API.get('/torneos');
      // Buscamos el torneo por ID (coartando a string/número según corresponda)
      return res.data.find(t => t.id === parseInt(id) || t.id === id);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de caché viene bien para detalles
  });

  // Mock de fechas (En el futuro mapearemos esto desde las fechas reales de los partidos)
  const fechas = [
    { id: 'vie_7', diaText: 'Vie', numText: '7 ago', title: 'Viernes 7 Agosto 2026' },
    { id: 'sab_8', diaText: 'Sáb', numText: '8 ago', title: 'Sábado 8 Agosto 2026' },
    { id: 'dom_9', diaText: 'Dom', numText: '9 ago', title: 'Domingo 9 Agosto 2026' },
  ];

  const fechaActivaData = fechas.find(f => f.id === diaSeleccionado);

  if (isLoading) return (
    <div style={styles.centerContainer}>
      <div style={styles.spinner}></div>
    </div>
  );

  if (isError || !torneo) return (
    <div style={styles.centerContainer}>
      <div style={styles.alerta}>
        <p style={{ color: '#ff4d4d', fontWeight: 'bold', margin: 0 }}>Torneo no encontrado o error de carga.</p>
        <button onClick={() => navigate(-1)} style={styles.btnVolver}>Volver atrás</button>
      </div>
    </div>
  );

  const partidosAMostrar = torneo.partidos && torneo.partidos.length > 0 ? torneo.partidos : [];
  const bannerImagen = torneo.imagenPortada || torneo.complejo?.imagenUrl || "https://images.unsplash.com/photo-1592656094267-764a4506f368?w=800";

  return (
    <div style={styles.screenContainer}>
      
      {/* HEADER HERO (Sincronizado con el Layout Oscuro) */}
      <div style={{ ...styles.headerHero, backgroundImage: `url("${bannerImagen}")` }}>
        <div style={styles.headerOverlay}>
          
          {/* Barra Superior */}
          <div style={styles.topBar}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div style={styles.logoContainer}>
              <img src="/logo-adn-padel.png" alt="ADN Padel" style={styles.logoIcon} />
              <span style={styles.logoText}>ADN PADEL</span>
            </div>
          </div>

          {/* Títulos Flotantes */}
          <div style={styles.heroTitles}>
            <span style={styles.etiquetaTorneo}>COMPETICIÓN ACTIVA</span>
            <h1 style={styles.tituloTorneo}>{torneo.nombre}</h1>
          </div>

          {/* TABS MENU PREMIUM */}
          <div style={styles.tabsMenu}>
            {['fixture', 'cronograma', 'galeria'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setPestanaActiva(tab)}
                style={{
                  ...styles.tabItem,
                  ...(pestanaActiva === tab ? styles.tabItemActivo : {})
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div style={styles.mainContent}>

        {/* ─── CRONOGRAMA ─── */}
        {pestanaActiva === 'cronograma' && (
          <div style={styles.tabSection}>
            
            {/* Selector de Fechas (Pills oscuras con borde neón al activar) */}
            <div style={styles.dateSelectorRow}>
              {fechas.map(f => (
                <button 
                  key={f.id}
                  onClick={() => setDiaSeleccionado(f.id)}
                  style={{
                    ...styles.datePill,
                    ...(diaSeleccionado === f.id ? styles.datePillActivo : {})
                  }}
                >
                  <span style={{ ...styles.datePillDia, ...(diaSeleccionado === f.id ? styles.textNeon : {}) }}>{f.diaText}</span>
                  <span style={{ ...styles.datePillNum, ...(diaSeleccionado === f.id ? styles.textNeon : {}) }}>{f.numText}</span>
                </button>
              ))}
            </div>

            {/* Meta-información de la fecha */}
            <div style={styles.dateSubtitleRow}>
              <span style={styles.dateSubtitleText}>{fechaActivaData?.title}</span>
              <span style={styles.matchesCount}>{partidosAMostrar.length} partidos programados</span>
            </div>

            {/* LISTA DE PARTIDOS */}
            <div style={styles.matchesList}>
              {partidosAMostrar.length > 0 ? (
                partidosAMostrar.map((partido, index) => (
                  <div key={index} style={styles.matchCard}>
                    
                    {/* Bloque Izquierdo: Horario */}
                    <div style={styles.timeColumn}>
                      <span style={styles.timeText}>{partido.hora || "13:00"}</span>
                      <span style={styles.dayText}>{fechaActivaData?.diaText.toUpperCase()}</span>
                    </div>
                    
                    {/* Bloque Derecho: Info del Partido */}
                    <div style={styles.detailsColumn}>
                      <div style={styles.badgesRow}>
                        <span style={styles.badgeProgramado}>• EN AGENDA</span>
                        <span style={styles.badgeCategoria}>{partido.categoria || torneo.categoria || 'Categoría General'}</span>
                        <span style={styles.badgeZona}>ZONA {partido.zonaId || 'A'}</span>
                      </div>

                      {/* Enfrentamiento */}
                      <div style={styles.playersBlock}>
                        <div style={styles.playerLine}>
                          🎾 {partido.pareja1?.jugador1 || "Jugador 1"} / {partido.pareja1?.jugador2 || "Jugador 2"}
                        </div>
                        <div style={styles.vsText}>VS</div>
                        <div style={styles.playerLine}>
                          🎾 {partido.pareja2?.jugador1 || "Jugador 3"} / {partido.pareja2?.jugador2 || "Jugador 4"}
                        </div>
                      </div>

                      {/* Ubicación */}
                      <div style={styles.locationRow}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span style={styles.locationText}>
                          {torneo.complejo?.nombre ? `Cancha asignada - ${torneo.complejo.nombre}` : 'Complejo ADN'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noMatches}>
                  <p>No hay partidos cargados para este día todavía.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── FIXTURE (Estructura base para armar el árbol/tablas luego) ─── */}
        {pestanaActiva === 'fixture' && (
          <div style={styles.tabSection}>
            <div style={styles.noMatches}>
              <span style={{ fontSize: '32px' }}>📊</span>
              <p style={{ marginTop: '10px' }}>Estructura de zonas y llaves en desarrollo.</p>
            </div>
          </div>
        )}

        {/* ─── GALERÍA MULTIMEDIA ─── */}
        {pestanaActiva === 'galeria' && (
          <div style={styles.tabSection}>
            <div style={styles.galeriaHeader}>
              <div style={styles.galeriaFiltros}>
                {['Todo', 'Fotos', 'Videos'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFiltroGaleria(f)}
                    style={{
                      ...styles.galeriaPill,
                      ...(filtroGaleria === f ? styles.galeriaPillActivo : {})
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.galeriaGrid}>
              <div style={styles.imageCard}>
                <img src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500" alt="Padel Action" style={styles.img} />
              </div>
              <div style={styles.imageCard}>
                <img src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500" alt="Padel Court" style={styles.img} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// --- ARQUITECTURA DE ESTILOS PREMIUM (MODO OSCURO) ---
const styles = {
  screenContainer: {
    backgroundColor: 'transparent', // Para heredar el fondo del Layout
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    color: '#FFFFFF'
  },
  
  // HERO HEADER
  headerHero: {
    position: 'relative',
    height: '240px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to bottom, rgba(10, 10, 11, 0.6) 0%, rgba(10, 10, 11, 1) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    gap: '12px',
  },
  backButton: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
    cursor: 'pointer', padding: '8px', display: 'flex', borderRadius: '12px'
  },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { width: '22px', height: '22px', borderRadius: '4px' }, 
  logoText: { color: '#FFF', fontWeight: '800', fontSize: '13px', letterSpacing: '1px' },
  
  heroTitles: { padding: '0 20px', display: 'flex', flexDirection: 'column' },
  etiquetaTorneo: { color: '#39FF14', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '4px' },
  tituloTorneo: { color: '#FFFFFF', fontSize: '26px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' },

  // TABS UNDERLINE
  tabsMenu: { display: 'flex', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tabItem: {
    flex: 1, background: 'transparent', border: 'none', borderBottom: '3px solid transparent',
    color: '#8E8E93', padding: '14px 0', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
    letterSpacing: '0.5px', transition: 'all 0.2s'
  },
  tabItemActivo: { color: '#39FF14', borderBottom: '3px solid #39FF14' },

  // CONTAINER PRINCIPAL
  mainContent: { padding: '24px 20px 120px 20px' },
  tabSection: { display: 'flex', flexDirection: 'column' },

  // DATE PILLS
  dateSelectorRow: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '14px' },
  datePill: {
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '10px 16px',
    backgroundColor: 'rgba(22, 22, 24, 0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: '75px', cursor: 'pointer', transition: 'all 0.2s'
  },
  datePillActivo: { borderColor: '#39FF14', backgroundColor: 'rgba(57, 255, 20, 0.05)' },
  datePillDia: { fontSize: '12px', fontWeight: '600', color: '#8E8E93' },
  datePillNum: { fontSize: '14px', fontWeight: '700', color: '#FFF', marginTop: '2px' },
  textNeon: { color: '#39FF14' },
  
  dateSubtitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0' },
  dateSubtitleText: { fontSize: '14px', fontWeight: '700', color: '#FFF' },
  matchesCount: { fontSize: '12px', color: '#8E8E93', fontWeight: '500' },

  // MATCH CARDS PREMIUM
  matchesList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  matchCard: {
    display: 'flex', backgroundColor: 'rgba(22, 22, 24, 0.7)', backdropFilter: 'blur(10px)',
    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden'
  },
  timeColumn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '16px', minWidth: '65px', backgroundColor: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.04)'
  },
  timeText: { fontSize: '18px', fontWeight: '800', color: '#39FF14' },
  dayText: { fontSize: '11px', fontWeight: '600', color: '#8E8E93', marginTop: '2px' },
  
  detailsColumn: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  badgesRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  badgeProgramado: { backgroundColor: 'rgba(0,122,255,0.1)', color: '#007AFF', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '800' },
  badgeCategoria: { backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFF', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '700' },
  badgeZona: { backgroundColor: 'rgba(57, 255, 20, 0.1)', color: '#39FF14', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '700' },
  
  playersBlock: { display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' },
  playerLine: { fontSize: '13px', fontWeight: '600', color: '#FFF' },
  vsText: { fontSize: '10px', fontWeight: '800', color: '#8E8E93', paddingLeft: '14px' },

  locationRow: { display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' },
  locationText: { fontSize: '11px', color: '#8E8E93', fontWeight: '500' },

  // GALERÍA
  galeriaHeader: { marginBottom: '16px' },
  galeriaFiltros: { display: 'flex', gap: '8px' },
  galeriaPill: { padding: '8px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', fontSize: '13px', fontWeight: '600', color: '#8E8E93', cursor: 'pointer' },
  galeriaPillActivo: { backgroundColor: 'rgba(57, 255, 20, 0.1)', borderColor: '#39FF14', color: '#39FF14' },
  galeriaGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  imageCard: { width: '100%', height: '200px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },

  // AUXILIARES
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(57, 255, 20, 0.1)', borderTopColor: '#39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  alerta: { padding: '20px', backgroundColor: 'rgba(255, 77, 77, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 77, 77, 0.2)', textAlign: 'center' },
  btnVolver: { marginTop: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' },
  noMatches: { textAlign: 'center', padding: '40px 20px', color: '#8E8E93', fontSize: '13px' }
};

export default TorneoDetalleScreen;