import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api'; // Ajusta la ruta a tu config de Axios

const TorneoDetalleScreen = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  
  const [torneo, setTorneo] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados de navegación
  const [pestanaActiva, setPestanaActiva] = useState('cronograma');
  const [diaSeleccionado, setDiaSeleccionado] = useState('vie_7');
  const [filtroGaleria, setFiltroGaleria] = useState('Todo');

  // Usamos el endpoint que ya tienes configurado en el backend
  useEffect(() => {
    const cargarTorneo = async () => {
      try {
        // Aprovechamos tu endpoint existente que trae los torneos con sus partidos
        const res = await API.get('/torneos');
        const torneoEncontrado = res.data.find(t => t.id === parseInt(id) || t.id === id);
        setTorneo(torneoEncontrado);
      } catch (error) {
        console.error("Error al cargar el torneo:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarTorneo();
  }, [id]);

  // Mock de fechas (Idealmente esto se extrae de las fechas reales de los partidos)
  const fechas = [
    { id: 'vie_7', diaText: 'Vie', numText: '7 ago', title: 'Viernes 7 Agosto 2026' },
    { id: 'sab_8', diaText: 'Sáb', numText: '8 ago', title: 'Sábado 8 Agosto 2026' },
    { id: 'dom_9', diaText: 'Dom', numText: '9 ago', title: 'Domingo 9 Agosto 2026' },
  ];

  const fechaActivaData = fechas.find(f => f.id === diaSeleccionado);

  if (cargando) return <div style={styles.loading}>Cargando torneo...</div>;
  if (!torneo) return <div style={styles.loading}>Torneo no encontrado</div>;

  // Extraemos los partidos o usamos un array de fallback para ver el diseño
  const partidosAMostrar = torneo.partidos && torneo.partidos.length > 0 ? torneo.partidos : [1, 2, 3, 4];

  return (
    <div style={styles.screenContainer}>
      
      {/* HEADER IDÉNTICO A LA CAPTURA */}
      <div style={styles.headerHero}>
        <div style={styles.headerOverlay}>
          {/* Barra Superior con botón Volver */}
          <div style={styles.topBar}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div style={styles.logoContainer}>
              <img src="/logo-adn-padel.png" alt="ADN Padel" style={styles.logoIcon} />
              <span style={styles.logoText}>ADN PADEL</span>
            </div>
          </div>

          <div style={styles.heroTitles}>
            <span style={styles.etiquetaTorneo}>TORNEO</span>
            <h1 style={styles.tituloTorneo}>{torneo.nombre || "TORNEO ORIGEN"}</h1>
          </div>

          {/* TABS (Fixture, Cronograma, Galería) */}
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
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL (Fondo Blanco) */}
      <div style={styles.mainContent}>

        {/* --- PESTAÑA: CRONOGRAMA --- */}
        {pestanaActiva === 'cronograma' && (
          <div style={styles.cronogramaContainer}>
            
            {/* Selector de Fechas (Pills con borde amarillo) */}
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
                  <span style={{
                    ...styles.datePillDia,
                    ...(diaSeleccionado === f.id ? styles.textYellow : {})
                  }}>{f.diaText}</span>
                  <span style={{
                    ...styles.datePillNum,
                    ...(diaSeleccionado === f.id ? styles.textYellow : {})
                  }}>{f.numText}</span>
                </button>
              ))}
            </div>

            {/* Subtítulo de Fecha y Contador */}
            <div style={styles.dateSubtitleRow}>
              <span style={styles.dateSubtitleText}>{fechaActivaData?.title}</span>
              <span style={styles.matchesCount}>{partidosAMostrar.length} partidos</span>
            </div>

            {/* LISTA DE PARTIDOS */}
            <div style={styles.matchesList}>
              {partidosAMostrar.map((partido, index) => (
                <div key={index} style={styles.matchCard}>
                  
                  {/* Izquierda: Hora y Día */}
                  <div style={styles.timeColumn}>
                    <span style={styles.timeText}>{partido.hora || "13:00"}</span>
                    <span style={styles.dayText}>{fechaActivaData?.diaText.toUpperCase()}</span>
                  </div>
                  
                  {/* Derecha: Detalles del partido */}
                  <div style={styles.detailsColumn}>
                    {/* Badges Superiores */}
                    <div style={styles.badgesRow}>
                      <span style={styles.badgeProgramado}>• PROGRAMADO</span>
                      <span style={styles.badgeCategoria}>{partido.categoria || '7ma Damas'}</span>
                    </div>
                    <div style={styles.zonaRow}>
                      <span style={styles.badgeZona}>{partido.zonaId ? 'ZONA A' : 'ZONA A'}</span>
                    </div>

                    {/* Jugadores */}
                    <div style={styles.playersBlock}>
                      <div style={styles.playerLine}>
                        {partido.pareja1?.jugador1 || "Silva Claudia"} / {partido.pareja1?.jugador2 || "Noelia Monzón"}
                      </div>
                      <div style={styles.vsText}>VS</div>
                      <div style={styles.playerLine}>
                        {partido.pareja2?.jugador1 || "Molinari Camila"} / {partido.pareja2?.jugador2 || "Carabia Carolina"}
                      </div>
                    </div>

                    {/* Footer / Ubicación */}
                    <div style={styles.locationRow}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span style={styles.locationText}>
                        {torneo.complejo?.nombre ? `Cancha 2 - ${torneo.complejo.nombre}` : 'Cancha 2 - Las Lajas'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PESTAÑA: GALERÍA --- */}
        {pestanaActiva === 'galeria' && (
          <div style={styles.galeriaContainer}>
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
              <span style={styles.archivosCount}>6 ARCHIVOS</span>
            </div>

            {/* Grid de Imágenes (Mock según tus capturas) */}
            <div style={styles.galeriaGrid}>
              <div style={styles.imageCard}>
                <img src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500" alt="Padel" style={styles.img} />
              </div>
              <div style={styles.imageCard}>
                <img src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500" alt="Padel" style={styles.img} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// --- ESTILOS IDÉNTICOS A LAS CAPTURAS ---
const styles = {
  loading: { display: 'flex', justifyContent: 'center', padding: '50px', fontFamily: 'sans-serif' },
  screenContainer: {
    backgroundColor: '#F8F9FA', // Fondo general claro
    minHeight: '100vh',
    width: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  
  // HEADER
  headerHero: {
    position: 'relative',
    height: '260px',
    backgroundImage: 'url("https://images.unsplash.com/photo-1592656094267-764a4506f368?w=800")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(20, 20, 22, 0.85)', // Overlay oscuro
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 16px',
    gap: '12px',
  },
  backButton: {
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
  },
  logoContainer: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  logoIcon: { width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#FFF' }, // Placeholder logo
  logoText: { color: '#FFF', fontWeight: '800', fontSize: '14px', letterSpacing: '1px' },
  
  heroTitles: { padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  etiquetaTorneo: { color: '#A0A0A5', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '4px' },
  tituloTorneo: { color: '#FFFFFF', fontSize: '28px', fontWeight: '900', margin: 0, textTransform: 'uppercase' },

  tabsMenu: { display: 'flex', padding: '0 16px' },
  tabItem: {
    flex: 1, background: 'transparent', border: 'none', borderBottom: '3px solid transparent',
    color: '#A0A0A5', padding: '16px 0', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  tabItemActivo: { color: '#FFFFFF', borderBottom: '3px solid #FFD700' }, // Línea amarilla

  // CONTENIDO
  mainContent: { padding: '20px 16px', backgroundColor: '#FFFFFF', minHeight: 'calc(100vh - 260px)' },

  // CRONOGRAMA
  cronogramaContainer: { display: 'flex', flexDirection: 'column' },
  dateSelectorRow: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' },
  datePill: {
    border: '1px solid #E0E0E0', borderRadius: '16px', padding: '10px 20px',
    backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: '80px', cursor: 'pointer'
  },
  datePillActivo: { borderColor: '#FFD700', borderWidth: '1.5px' }, // Borde amarillo
  datePillDia: { fontSize: '13px', fontWeight: '600', color: '#1A1A1E' },
  datePillNum: { fontSize: '14px', fontWeight: '700', color: '#1A1A1E', marginTop: '2px' },
  textYellow: { color: '#D4AF37' }, // Texto amarillo oscuro
  
  dateSubtitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  dateSubtitleText: { fontSize: '14px', fontWeight: '700', color: '#1A1A1E' },
  matchesCount: { fontSize: '13px', color: '#8E8E93', fontWeight: '500' },

  matchesList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  matchCard: {
    display: 'flex',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #EAEAEA',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    overflow: 'hidden'
  },
  timeColumn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
    padding: '16px', minWidth: '70px', backgroundColor: '#FBFBFB', borderRight: '1px solid #EAEAEA'
  },
  timeText: { fontSize: '18px', fontWeight: '800', color: '#1A1A1E' },
  dayText: { fontSize: '12px', fontWeight: '600', color: '#8E8E93', marginTop: '4px' },
  
  detailsColumn: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  badgesRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  badgeProgramado: { backgroundColor: '#E8F4FD', color: '#007AFF', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
  badgeCategoria: { backgroundColor: '#F0F0F5', color: '#555', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' },
  zonaRow: { marginBottom: '4px' },
  badgeZona: { border: '1px solid #E0E0E0', color: '#8E8E93', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' },
  
  playersBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
  playerLine: { fontSize: '14px', fontWeight: '600', color: '#1A1A1E' },
  vsText: { fontSize: '11px', fontWeight: '700', color: '#A0A0A5' },

  locationRow: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', borderTop: '1px solid #F0F0F0', paddingTop: '10px' },
  locationText: { fontSize: '12px', color: '#8E8E93', fontWeight: '500' },

  // GALERÍA
  galeriaContainer: { display: 'flex', flexDirection: 'column' },
  galeriaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  galeriaFiltros: { display: 'flex', gap: '8px' },
  galeriaPill: { padding: '6px 14px', borderRadius: '20px', border: '1px solid #EAEAEA', backgroundColor: '#FFF', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' },
  galeriaPillActivo: { backgroundColor: '#FFF9D6', borderColor: '#FFD700', color: '#B38B00' }, // Amarillo suave como en la foto
  archivosCount: { fontSize: '12px', fontWeight: '600', color: '#8E8E93' },
  
  galeriaGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  imageCard: { width: '100%', height: '240px', borderRadius: '16px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' }
};

export default TorneoDetalleScreen;