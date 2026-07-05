// src/components/VisualizadorCuadros.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';

const VisualizadorCuadros = ({ torneoId, torneo, categoria, usuario, onUpdateResultado, onAbrirInscripcion }) => {
  const [partidos, setPartidos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Pestañas principales del video: fixture, cronograma, galeria
  const [pestanaActiva, setPestanaActiva] = useState('fixture'); 
  // Sub-filtros para el Cronograma (Días)
  const [diaSeleccionado, setDiaSeleccionado] = useState('Vie 7');
  // Sub-filtros para la Galería
  const [subFiltroGaleria, setSubFiltroGaleria] = useState('Todo');

  const puedeEditar = usuario?.rol === 'admin_complejo' || usuario?.rol === 'organizador';

  const cargarCuadros = async () => {
    try {
      setCargando(true);
      const res = await API.get('/torneos');
      const torneoActual = res.data.find(t => t.id === torneoId);
      
      if (torneoActual) {
        const partidosFiltrados = (torneoActual.partidos || []).filter(p => p.categoria === categoria);
        setPartidos(partidosFiltrados);
        
        const zonasFiltradas = (torneoActual.zonas || []).filter(z => z.categoria === categoria);
        setZonas(zonasFiltradas);
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

  if (cargando) {
    return <div style={styles.textoCargando}>Cargando interfaz premium...</div>;
  }

  const partidosCuartos = partidos.filter(p => p.tipoFase === 'CUARTOS');
  const partidosSemis = partidos.filter(p => p.tipoFase === 'SEMIFINAL');
  const partidosFinal = partidos.filter(p => p.tipoFase === 'FINAL');

  const obtenerNombresPareja = (parejaObj) => {
    if (!parejaObj) return "Por clasificar";
    return `${parejaObj.jugador1} / ${parejaObj.jugador2}`;
  };

  // Mock de días para el slider horizontal del Cronograma
  const diasCronograma = [
    { id: 'Vie 7', diaSemana: 'Vie', numero: '7', mes: 'ago' },
    { id: 'Sáb 8', diaSemana: 'Sáb', numero: '8', mes: 'ago' },
    { id: 'Dom 9', diaSemana: 'Dom', numero: '9', mes: 'ago' },
  ];

  // Mock de archivos multimedia para la Galería
  const fotosMock = [
    { id: 1, type: 'photo', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500' },
    { id: 2, type: 'photo', url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500' },
    { id: 3, type: 'photo', url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500' },
  ];

  return (
    <div style={styles.contenedorPrincipal}>
      
      {/* ─── BANNER SUPERIOR DEL TORNEO (Estilo ADN PÁDEL) ─── */}
      <div style={styles.bannerTorneo}>
        <div style={styles.overlayBanner}>
          <span style={styles.subtituloApp}>🏆 CIRCUITO DE PÁDEL</span>
          <h1 style={styles.tituloTorneo}>{torneo?.nombre || "TORNEO INDEFINIDO"}</h1>
          <p style={styles.datosBanner}>Categoría seleccionada: {categoria}</p>
        </div>
      </div>

      {/* ─── PESTAÑAS PRINCIPALES DEL VIDEO ─── */}
      <div style={styles.contenedorTabsPrincipales}>
        <button 
          onClick={() => setPestanaActiva('fixture')}
          style={{...styles.tabPrincipal, ...(pestanaActiva === 'fixture' ? styles.tabPrincipalActive : {})}}
        >
          Fixture
        </button>
        <button 
          onClick={() => setPestanaActiva('cronograma')}
          style={{...styles.tabPrincipal, ...(pestanaActiva === 'cronograma' ? styles.tabPrincipalActive : {})}}
        >
          Cronograma
        </button>
        <button 
          onClick={() => setPestanaActiva('galeria')}
          style={{...styles.tabPrincipal, ...(pestanaActiva === 'galeria' ? styles.tabPrincipalActive : {})}}
        >
          Galería
        </button>
      </div>

      {/* ─── CONTENIDO DE LAS VISTAS ─── */}
      <div style={styles.cuerpoContenido}>

        {/* 1. VISTA: FIXTURE (Fase de grupos y llaves juntas con scroll o acordeón) */}
        {pestanaActiva === 'fixture' && (
          <div>
            <h3 style={styles.seccionTituloInterno}>Zonas y Llaves Eliminatorias</h3>
            
            {/* Render de Fase de Grupos / Zonas */}
            <div style={styles.seccionZonas}>
              {zonas.map(zona => {
                const partidosDeZona = partidos.filter(p => p.zonaId === zona.id);
                return (
                  <div key={zona.id} style={styles.tarjetaZona}>
                    <div style={styles.headerZona}>{zona.nombre}</div>
                    <div style={styles.listaPartidosMini}>
                      {partidosDeZona.map(partido => (
                        <div key={partido.id} style={styles.filaPartidoMini}>
                          <span>{obtenerNombresPareja(partido.pareja1)} <b style={{color: '#39FF14'}}>vs</b> {obtenerNombresPareja(partido.pareja2)}</span>
                          <span style={styles.resultadoMini}>{partido.resultado || 'Pendiente'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bracket Horizontal */}
            <div style={styles.contenedorBracket}>
              <div style={styles.columnaRonda}>
                <div style={styles.tituloRonda}>Cuartos</div>
                {partidosCuartos.map(p => <TarjetaPartidoBracket key={p.id} partido={p} onNombres={obtenerNombresPareja} isAdmin={puedeEditar} onEdit={onUpdateResultado} />)}
              </div>
              <div style={styles.columnaRonda}>
                <div style={styles.tituloRonda}>Semifinal</div>
                {partidosSemis.map(p => <TarjetaPartidoBracket key={p.id} partido={p} onNombres={obtenerNombresPareja} isAdmin={puedeEditar} onEdit={onUpdateResultado} />)}
              </div>
              <div style={styles.columnaRonda}>
                <div style={styles.tituloRonda}>Final</div>
                {partidosFinal.map(p => <TarjetaPartidoBracket key={p.id} partido={p} onNombres={obtenerNombresPareja} isAdmin={puedeEditar} onEdit={onUpdateResultado} />)}
              </div>
            </div>
          </div>
        )}

        {/* 2. VISTA: CRONOGRAMA (Por horarios e indicador vertical) */}
        {pestanaActiva === 'cronograma' && (
          <div>
            {/* Slider Horizontal de Días del Video */}
            <div style={styles.sliderDiasContainer}>
              {diasCronograma.map(dia => {
                const isSelected = diaSeleccionado === dia.id;
                return (
                  <button 
                    key={dia.id}
                    onClick={() => setDiaSeleccionado(dia.id)}
                    style={{...styles.tarjetaDiaBtn, ...(isSelected ? styles.tarjetaDiaBtnActive : {})}}
                  >
                    <span style={styles.diaTextoArriba}>{dia.diaSemana}</span>
                    <span style={{...styles.diaNumero, color: isSelected ? '#39FF14' : '#fff'}}>{dia.numero}</span>
                    <span style={styles.diaTextoAbajo}>{dia.mes}</span>
                  </button>
                );
              })}
            </div>

            <div style={styles.infoPartidosCount}>Viernes 7 de Agosto — {partidos.length} partidos programados</div>

            {/* Lista de Partidos Estilo Timeline */}
            <div style={styles.timelineContenedor}>
              {partidos.length === 0 ? (
                <p style={styles.textoVacio}>No hay partidos cargados para este día.</p>
              ) : (
                partidos.map((partido, index) => (
                  <div key={partido.id || index} style={styles.filaTimelinePartido}>
                    
                    {/* Bloque Izquierdo: Hora */}
                    <div style={styles.timelineBloqueHora}>
                      <div style={styles.timelineHoraTexto}>{partido.hora || "16:45"}</div>
                      <div style={styles.timelineDiaSub}>VIE</div>
                    </div>

                    {/* Separador de línea vertical del video */}
                    <div style={styles.timelineLineaVertical}>
                      <div style={styles.timelineCirculoNodo} />
                    </div>

                    {/* Bloque Derecho: Detalles e información del partido */}
                    <div style={styles.timelineCardDetalle}>
                      <div style={styles.timelineHeaderBadges}>
                        <span style={styles.badgeEstadoVideo}>
                          {partido.estado === 'finalizado' ? '● FINALIZADO' : '● PROGRAMADO'}
                        </span>
                        <span style={styles.badgeCategoriaVideo}>{categoria}</span>
                        <span style={styles.badgeZonaVideo}>{partido.zonaId ? 'Fase de Grupos' : 'Eliminatorias'}</span>
                      </div>

                      <div style={styles.timelineVersusNombres}>
                        <div style={styles.timelineJugadorRenglon}>{obtenerNombresPareja(partido.pareja1)}</div>
                        <div style={styles.timelineVsSeparador}>vs</div>
                        <div style={styles.timelineJugadorRenglon}>{obtenerNombresPareja(partido.pareja2)}</div>
                      </div>

                      <div style={styles.timelineFooterSede}>
                        📍 {torneo?.complejo?.nombre || 'Complejo Principal'} — Cancha 1
                        {partido.resultado && <span style={styles.resultadoBadgeTimeline}>Resultado: {partido.resultado}</span>}
                      </div>

                      {puedeEditar && onUpdateResultado && (
                        <button onClick={() => onUpdateResultado(partido)} style={styles.btnCargarScoreTimeline}>
                          ✏️ Modificar Marcador
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. VISTA: GALERÍA (Grid de imágenes y multimedia) */}
        {pestanaActiva === 'galeria' && (
          <div>
            {/* Sub-tabs de la galería: Todo, Fotos, Videos */}
            <div style={styles.contenedorSubChips}>
              {['Todo', 'Fotos', 'Videos'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setSubFiltroGaleria(opt)}
                  style={{...styles.chipSubFiltro, ...(subFiltroGaleria === opt ? styles.chipSubFiltroActive : {})}}
                >
                  {opt}
                </button>
              ))}
              <span style={styles.contadorArchivos}>6 ARCHIVOS</span>
            </div>

            {/* Grid de Fotos Premium */}
            <div style={styles.gridGaleria}>
              {fotosMock.map(foto => (
                <div key={foto.id} style={styles.tarjetaImagenGaleria}>
                  <img src={foto.url} alt="Torneo" style={styles.imagenGaleriaSrc} />
                  <div style={styles.overlayImagenGradient} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Componente auxiliar estilizado para los brackets en la pestaña Fixture
const TarjetaPartidoBracket = ({ partido, onNombres, isAdmin, onEdit }) => {
  return (
    <div style={styles.tarjetaPartidoBracket}>
      <div style={styles.bloqueJugadorBracket}>
        <span style={styles.nombreJugadorBracket}>{onNombres(partido.pareja1)}</span>
      </div>
      <div style={styles.divisorBracket}>
        <span style={partido.resultado ? styles.textoResultadoBracket : styles.textoVsBracket}>
          {partido.resultado || 'VS'}
        </span>
        {isAdmin && onEdit && <button onClick={() => onEdit(partido)} style={styles.miniBtnEdit}>✏️</button>}
      </div>
      <div style={styles.bloqueJugadorBracket}>
        <span style={styles.nombreJugadorBracket}>{onNombres(partido.pareja2)}</span>
      </div>
    </div>
  );
};

// ─── ESTILOS PREMIUM TOTALMENTE BASADOS EN EL VIDEO DE REFERENCIA ───
const styles = {
  contenedorPrincipal: { backgroundColor: '#0F0F11', color: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  textoCargando: { color: '#8E8E93', textAlign: 'center', padding: '40px', fontSize: '15px' },
  textoVacio: { color: '#8E8E93', padding: '20px', fontStyle: 'italic' },

  // Banner Superior
  bannerTorneo: {
    position: 'relative',
    height: '160px',
    background: 'linear-gradient(135deg, #1A1A1E 0%, #25252A 100%)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1592656094267-764a4506f368?w=800")', // Fondo deportivo abstracto sutil
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
  },
  overlayBanner: {
    width: '100%',
    padding: '20px',
    background: 'linear-gradient(to top, #0F0F11 0%, rgba(15,15,17,0.4) 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  subtituloApp: { color: '#39FF14', fontSize: '11px', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' },
  tituloTorneo: { margin: 0, fontSize: '26px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' },
  datosBanner: { margin: '2px 0 0 0', color: '#A5A5A9', fontSize: '13px', fontWeight: '500' },

  // Pestañas Principales Integradas (Estilo Flat Horizontal Underlined)
  contenedorTabsPrincipales: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0F0F11',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  tabPrincipal: {
    flex: 1,
    padding: '16px 10px',
    background: 'none',
    border: 'none',
    color: '#8E8E93',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    borderBottom: '3px solid transparent',
  },
  tabPrincipalActive: {
    color: '#ffffff',
    borderBottom: '3px solid #39FF14', // Línea verde neón inferior activa
  },

  cuerpoContenido: { padding: '16px' },

  // Slider de Fechas (Cronograma)
  sliderDiasContainer: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '12px',
    marginBottom: '16px',
    scrollbarWidth: 'none',
  },
  tarjetaDiaBtn: {
    minWidth: '75px',
    padding: '10px 6px',
    backgroundColor: '#161619',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tarjetaDiaBtnActive: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    border: '1px solid rgba(57, 255, 20, 0.3)',
  },
  diaTextoArriba: { color: '#8E8E93', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  diaNumero: { fontSize: '20px', fontWeight: '800', margin: '4px 0' },
  diaTextoAbajo: { color: '#8E8E93', fontSize: '11px' },
  infoPartidosCount: { color: '#8E8E93', fontSize: '13px', fontWeight: '600', marginBottom: '20px', textTransform: 'capitalize' },

  // Lista Estilo Timeline (Cronograma)
  timelineContenedor: { display: 'flex', flexDirection: 'column', gap: '4px' },
  filaTimelinePartido: { display: 'flex', position: 'relative', alignItems: 'stretch' },
  
  timelineBloqueHora: {
    width: '55px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: '14px',
    alignItems: 'flex-end',
    paddingRight: '10px',
  },
  timelineHoraTexto: { color: '#ffffff', fontSize: '15px', fontWeight: '800' },
  timelineDiaSub: { color: '#8E8E93', fontSize: '10px', fontWeight: '700' },

  timelineLineaVertical: {
    position: 'relative',
    width: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  timelineCirculoNodo: {
    position: 'absolute',
    top: '18px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#39FF14',
    zIndex: 2,
    boxShadow: '0 0 8px #39FF14',
  },
  
  timelineCardDetalle: {
    flex: 1,
    backgroundColor: '#161619',
    borderRadius: '16px',
    padding: '14px 16px',
    marginBottom: '14px',
    border: '1px solid rgba(255,255,255,0.03)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  timelineHeaderBadges: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' },
  badgeEstadoVideo: { backgroundColor: 'rgba(0, 229, 255, 0.08)', color: '#00e5ff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', border: '1px solid rgba(0, 229, 255, 0.15)' },
  badgeCategoriaVideo: { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' },
  badgeZonaVideo: { color: '#8E8E93', fontSize: '11px', fontWeight: '600' },

  timelineVersusNombres: { display: 'flex', flexDirection: 'column', gap: '4px', margin: '12px 0' },
  timelineJugadorRenglon: { color: '#ffffff', fontSize: '14px', fontWeight: '700' },
  timelineVsSeparador: { color: '#555559', fontSize: '10px', fontWeight: '800', margin: '2px 0', textTransform: 'uppercase' },
  timelineFooterSede: { color: '#8E8E93', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' },
  resultadoBadgeTimeline: { color: '#39FF14', fontWeight: '700' },
  btnCargarScoreTimeline: { marginTop: '10px', width: '100%', padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },

  // Galería
  contenedorSubChips: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  chipSubFiltro: { padding: '8px 16px', borderRadius: '20px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8E8E93', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  chipSubFiltroActive: { backgroundColor: '#ffffff', color: '#000', border: '1px solid #fff', fontWeight: '700' },
  contadorArchivos: { marginLeft: 'auto', color: '#8E8E93', fontSize: '12px', fontWeight: '700' },
  gridGaleria: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' },
  tarjetaImagenGaleria: { position: 'relative', height: '180px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#161619' },
  imagenGaleriaSrc: { width: '100%', height: '100%', objectFit: 'cover' },
  overlayImagenGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' },

  // Fixture / Brackets Auxiliares
  seccionTituloInterno: { color: '#fff', fontSize: '16px', marginBottom: '14px', fontWeight: '700' },
  seccionZonas: { display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '24px' },
  tarjetaZona: { backgroundColor: '#161619', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.03)', overflow: 'hidden' },
  headerZona: { backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 14px', fontWeight: '700', fontSize: '13px', color: '#39FF14' },
  listaPartidosMini: { padding: '10px' },
  filaPartidoMini: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 4px', borderBottom: '1px solid rgba(255,255,255,0.02)' },
  resultadoMini: { fontWeight: '700', color: '#00e5ff' },

  contenedorBracket: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '14px', marginTop: '20px' },
  columnaRonda: { display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px', flex: 1 },
  tituloRonda: { color: '#8E8E93', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', marginBottom: '4px' },
  tarjetaPartidoBracket: { backgroundColor: '#161619', borderRadius: '12px', padding: '10px', border: '1px solid rgba(255,255,255,0.04)' },
  bloqueJugadorBracket: { padding: '6px 8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' },
  nombreJugadorBracket: { color: '#fff', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' },
  divisorBracket: { display: 'flex', justifyContent: 'space-between', padding: '4px 6px', alignItems: 'center' },
  textoResultadoBracket: { color: '#39FF14', fontSize: '12px', fontWeight: '800' },
  textoVsBracket: { color: '#8E8E93', fontSize: '10px' },
  miniBtnEdit: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }
};

// Insertar la línea de tiempo vertical inyectando estilos globales para el pseudo-elemento (CSS Line)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    div[style*="timelineContenedor"] > div::before {
      content: "";
      position: absolute;
      left: 64px;
      top: 18px;
      bottom: -14px;
      width: 2px;
      background-color: rgba(255, 255, 255, 0.05);
      z-index: 1;
    }
    div[style*="timelineContenedor"] > div:last-child::before {
      display: none;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default VisualizadorCuadros;