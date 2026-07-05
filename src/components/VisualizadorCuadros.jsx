// src/components/VisualizadorCuadros.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';

const VisualizadorCuadros = ({ torneoId, torneo, categoria, usuario, onUpdateResultado }) => {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Navegación principal
  const [pestanaActiva, setPestanaActiva] = useState('cronograma'); 
  
  // Filtros Cronograma
  const [diaSeleccionado, setDiaSeleccionado] = useState('Vie 7');
  
  // Filtros Galería
  const [subFiltroGaleria, setSubFiltroGaleria] = useState('Todo');

  const cargarCuadros = async () => {
    try {
      setCargando(true);
      const res = await API.get('/torneos');
      const torneoActual = res.data.find(t => t.id === torneoId);
      
      if (torneoActual) {
        const partidosFiltrados = (torneoActual.partidos || []).filter(p => p.categoria === categoria);
        setPartidos(partidosFiltrados);
      }
    } catch (error) {
      console.error("Error al cargar cuadros:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (torneoId && categoria) {
      cargarCuadros();
    }
  }, [torneoId, categoria]);

  const obtenerNombresPareja = (parejaObj) => {
    if (!parejaObj) return "Por clasificar";
    return `${parejaObj.jugador1} / ${parejaObj.jugador2}`;
  };

  // Mock de días para el slider horizontal
  const diasCronograma = [
    { id: 'Vie 7', diaSemana: 'Vie', numero: '7', mes: 'ago' },
    { id: 'Sáb 8', diaSemana: 'Sáb', numero: '8', mes: 'ago' },
    { id: 'Dom 9', diaSemana: 'Dom', numero: '9', mes: 'ago' },
  ];

  // Mock de archivos multimedia
  const fotosMock = [
    { id: 1, type: 'photo', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500' },
    { id: 2, type: 'photo', url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500' },
    { id: 3, type: 'photo', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500' },
  ];

  if (cargando) {
    return <div style={styles.textoCargando}>Cargando torneo...</div>;
  }

  return (
    <div style={styles.contenedorApp}>
      
      {/* 1. HEADER DEL TORNEO (Banner Principal) */}
      <div style={styles.bannerContainer}>
        <div style={styles.overlayBanner}>
          <div style={styles.bannerInfo}>
            <span style={styles.etiquetaTorneo}>TORNEO</span>
            <h1 style={styles.tituloTorneo}>{torneo?.nombre || "TORNEO ORIGEN"}</h1>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGACIÓN DE SECCIONES */}
      <div style={styles.tabsContainer}>
        {['fixture', 'cronograma', 'galeria'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setPestanaActiva(tab)}
            style={{
              ...styles.tabBoton,
              ...(pestanaActiva === tab ? styles.tabBotonActivo : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div style={styles.contenidoContainer}>

        {/* --- PESTAÑA: FIXTURE --- */}
        {pestanaActiva === 'fixture' && (
          <div style={styles.emptyState}>
            <p>Llaves y fases de grupos próximamente...</p>
          </div>
        )}

        {/* 3. PESTAÑA: CRONOGRAMA */}
        {pestanaActiva === 'cronograma' && (
          <div>
            {/* Selector de Fecha Horizontal */}
            <div style={styles.sliderFechas}>
              {diasCronograma.map(dia => {
                const isSelected = diaSeleccionado === dia.id;
                return (
                  <button 
                    key={dia.id}
                    onClick={() => setDiaSeleccionado(dia.id)}
                    style={{
                      ...styles.tarjetaDia, 
                      ...(isSelected ? styles.tarjetaDiaActiva : {})
                    }}
                  >
                    <span style={styles.diaSemana}>{dia.diaSemana}</span>
                    <span style={styles.diaNumero}>{dia.numero} {dia.mes}</span>
                  </button>
                );
              })}
            </div>

            {/* Contador de Partidos */}
            <h3 style={styles.contadorPartidos}>
              Viernes 7 Agosto 2026 | {partidos.length > 0 ? partidos.length : '28'} partidos
            </h3>

            {/* Lista de Partidos (Match Cards) */}
            <div style={styles.listaPartidos}>
              {/* Fallback de UI si no hay partidos reales cargados para mostrar el diseño */}
              {(partidos.length > 0 ? partidos : [1, 2, 3]).map((partido, index) => (
                <div key={partido.id || index} style={styles.matchCard}>
                  
                  {/* Fila Superior (Badges) */}
                  <div style={styles.matchCardHeader}>
                    <span style={styles.badgeEstado}>• PROGRAMADO</span>
                    <div style={styles.badgesRight}>
                      <span style={styles.badgeCategoria}>{categoria || '7ma Damas'}</span>
                      <span style={styles.badgeZona}>{partido.zonaId ? 'Fase de Grupos' : 'Zona A'}</span>
                    </div>
                  </div>

                  {/* Fila Central (Horario y Jugadores) */}
                  <div style={styles.matchCardBody}>
                    <div style={styles.bloqueHora}>
                      <span style={styles.horaTexto}>{partido.hora || "13:00"}</span>
                      <span style={styles.diaTexto}>VIE</span>
                    </div>
                    
                    <div style={styles.bloqueJugadores}>
                      <div style={styles.nombresRenglon}>
                        {partido.pareja1 ? obtenerNombresPareja(partido.pareja1) : "Pérez / Gómez"}
                      </div>
                      <div style={styles.vsTexto}>vs</div>
                      <div style={styles.nombresRenglon}>
                        {partido.pareja2 ? obtenerNombresPareja(partido.pareja2) : "Martínez / López"}
                      </div>
                    </div>
                  </div>

                  {/* Fila Inferior (Ubicación) */}
                  <div style={styles.matchCardFooter}>
                    📍 {torneo?.complejo?.nombre ? `Cancha 2 - ${torneo.complejo.nombre}` : 'Cancha 2 - Las Lajas'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PESTAÑA: GALERÍA */}
        {pestanaActiva === 'galeria' && (
          <div>
            {/* Sub-filtros de Medios y Contador */}
            <div style={styles.galeriaHeader}>
              <div style={styles.filtrosPills}>
                {['Todo', 'Fotos', 'Videos'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSubFiltroGaleria(opt)}
                    style={{
                      ...styles.pillBtn,
                      ...(subFiltroGaleria === opt ? styles.pillBtnActivo : {})
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <span style={styles.contadorArchivos}>6 ARCHIVOS</span>
            </div>

            {/* Grid de Imágenes */}
            <div style={styles.gridGaleria}>
              {fotosMock.map(foto => (
                <div key={foto.id} style={styles.tarjetaImagen}>
                  <img src={foto.url} alt="Momento del torneo" style={styles.imagenSrc} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// 5. ESTILOS GENERALES Y UI (Mobile-First, contraste elegante)
const styles = {
  contenedorApp: {
    backgroundColor: '#F4F5F7', // Fondo gris muy claro para contrastar elegantemente
    minHeight: '100vh',
    width: '100%',
    maxWidth: '500px', // Mobile-first format
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  textoCargando: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontFamily: 'sans-serif'
  },

  // 1. Header (Banner)
  bannerContainer: {
    position: 'relative',
    height: '240px',
    width: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1592656094267-764a4506f368?w=800")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  overlayBanner: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to top, rgba(15,15,17,0.95) 0%, rgba(15,15,17,0.2) 100%)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '24px 20px',
  },
  bannerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  etiquetaTorneo: {
    backgroundColor: '#FFD700', // Acento Dorado
    color: '#000',
    fontSize: '10px',
    fontWeight: '800',
    padding: '4px 8px',
    borderRadius: '4px',
    alignSelf: 'flex-start',
    letterSpacing: '1px',
  },
  tituloTorneo: {
    color: '#FFFFFF',
    fontSize: '28px',
    fontWeight: '900',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '-0.5px',
    lineHeight: '1.1',
  },

  // 2. Tabs
  tabsContainer: {
    display: 'flex',
    backgroundColor: '#0F0F11', // Mantenemos el header conectado al banner
    padding: '0 10px',
    borderBottom: '1px solid #E0E0E0',
  },
  tabBoton: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#8E8E93',
    padding: '16px 0',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  tabBotonActivo: {
    color: '#FFFFFF',
    borderBottom: '3px solid #FFD700', // Indicador Dorado
  },

  // Contenedor de contenido
  contenidoContainer: {
    padding: '20px',
    flex: 1,
  },
  emptyState: {
    color: '#8E8E93',
    textAlign: 'center',
    padding: '40px 20px',
    fontStyle: 'italic',
  },

  // 3. Cronograma
  sliderFechas: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '10px',
    scrollbarWidth: 'none', // Oculta scrollbar en Firefox
  },
  tarjetaDia: {
    minWidth: '80px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EAEAEA',
    borderRadius: '16px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    transition: 'all 0.2s ease',
  },
  tarjetaDiaActiva: {
    backgroundColor: '#FFD700', // Dorado/Amarillo
    border: '1px solid #E6C200',
    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
  },
  diaSemana: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1A1A1E',
    textTransform: 'uppercase',
  },
  diaNumero: {
    fontSize: '13px',
    color: '#555',
    marginTop: '4px',
    fontWeight: '500',
  },
  contadorPartidos: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '600',
    margin: '20px 0 16px 0',
  },

  // Match Cards (Fondo Claro/Blanco)
  listaPartidos: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  matchCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeEstado: {
    color: '#00B8D9', // Celeste/Verde para "Programado"
    backgroundColor: 'rgba(0, 184, 217, 0.1)',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
  badgesRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  badgeCategoria: {
    backgroundColor: '#1A1A1E',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
  },
  badgeZona: {
    color: '#8E8E93',
    fontSize: '12px',
    fontWeight: '600',
  },
  
  matchCardBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  bloqueHora: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    borderRight: '1px solid #EAEAEA',
    paddingRight: '16px',
  },
  horaTexto: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#1A1A1E',
  },
  diaTexto: {
    fontSize: '11px',
    color: '#8E8E93',
    fontWeight: '700',
  },
  bloqueJugadores: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  nombresRenglon: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1A1A1E',
  },
  vsTexto: {
    fontSize: '12px',
    color: '#A5A5A9',
    fontWeight: '800',
    fontStyle: 'italic',
  },

  matchCardFooter: {
    borderTop: '1px solid #F0F0F0',
    paddingTop: '12px',
    color: '#555559',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
  },

  // 4. Galería
  galeriaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  filtrosPills: {
    display: 'flex',
    gap: '8px',
  },
  pillBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EAEAEA',
    color: '#555',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pillBtnActivo: {
    backgroundColor: '#FFD700',
    border: '1px solid #E6C200',
    color: '#000000',
    fontWeight: '700',
  },
  contadorArchivos: {
    fontSize: '12px',
    color: '#8E8E93',
    fontWeight: '700',
  },
  gridGaleria: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  tarjetaImagen: {
    width: '100%',
    height: '200px',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#EAEAEA',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  imagenSrc: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }
};

export default VisualizadorCuadros;