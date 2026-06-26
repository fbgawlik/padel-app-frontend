// src/components/VisualizadorCuadros.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';

const VisualizadorCuadros = ({ torneoId, torneo, categoria, usuario, onUpdateResultado, onAbrirInscripcion }) => {
  const [partidos, setPartidos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('info'); // Por defecto abre en "info"

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
    return <div style={styles.textoCargando}>Cargando fixture interactivo...</div>;
  }

  const partidosCuartos = partidos.filter(p => p.tipoFase === 'CUARTOS');
  const partidosSemis = partidos.filter(p => p.tipoFase === 'SEMIFINAL');
  const partidosFinal = partidos.filter(p => p.tipoFase === 'FINAL');

  const obtenerNombresPareja = (parejaObj) => {
    if (!parejaObj) return "Por clasificar";
    return `${parejaObj.jugador1} / ${parejaObj.jugador2}`;
  };

  return (
    <div style={styles.contenedor}>
      {/* Selector de Pestañas Premium (Tabs) */}
      <div style={styles.contenedorTabs}>
        <button 
          onClick={() => setPestanaActiva('info')}
          style={{...styles.tabButton, ...(pestanaActiva === 'info' ? styles.tabActive : {})}}
        >
          ℹ️ Información
        </button>
        <button 
          onClick={() => setPestanaActiva('zonas')}
          style={{...styles.tabButton, ...(pestanaActiva === 'zonas' ? styles.tabActive : {})}}
        >
          🎾 Fase de Grupos ({zonas.length})
        </button>
        <button 
          onClick={() => setPestanaActiva('llaves')}
          style={{...styles.tabButton, ...(pestanaActiva === 'llaves' ? styles.tabActive : {})}}
        >
          🏆 Llaves Eliminatorias
        </button>
      </div>

      {/* CONTENIDO 0: INFORMACIÓN */}
      {pestanaActiva === 'info' && torneo && (
        <div style={styles.seccionInfo}>
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Fechas</span>
              <span style={styles.infoDato}>{torneo.fechaInicio} al {torneo.fechaFin}</span>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Complejo</span>
              <span style={styles.infoDato}>{torneo.complejo?.nombre || 'Por definir'}</span>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoLabel}>Cupo Máximo</span>
              <span style={styles.infoDato}>{torneo.cupoParejas || 16} parejas por categoría</span>
            </div>
          </div>
          
          <div style={styles.inscripcionBanner}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>¡Asegurá tu lugar!</h4>
              <p style={{ margin: 0, color: '#8A8A8A', fontSize: '13px' }}>Inscripciones abiertas para la categoría {categoria}.</p>
            </div>
            <button style={styles.btnInscribirse} onClick={onAbrirInscripcion}>
              ✍️ Inscribirse Ahora
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO 1: FASE DE GRUPOS */}
      {pestanaActiva === 'zonas' && (
        <div style={styles.seccionZonas}>
          {zonas.length === 0 ? (
            <p style={styles.textoVacio}>Aún no se generaron las zonas para esta categoría.</p>
          ) : (
            zonas.map(zona => {
              const partidosDeZona = partidos.filter(p => p.zonaId === zona.id);
              return (
                <div key={zona.id} style={styles.tarjetaZona}>
                  <div style={styles.headerZona}>{zona.nombre}</div>
                  <div style={styles.listaPartidos}>
                    {partidosDeZona.length === 0 ? (
                      <div style={{ color: '#555', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
                        Esperando emparejamientos...
                      </div>
                    ) : (
                      partidosDeZona.map(partido => (
                        <div key={partido.id} style={styles.filaPartido}>
                          <div style={styles.infoParejas}>
                            <div style={partido.estado === 'finalizado' ? { ...styles.parejaTexto, color: '#8A8A8A' } : styles.parejaTexto}>
                              {obtenerNombresPareja(partido.pareja1)}
                            </div>
                            <div style={styles.vs}>vs</div>
                            <div style={partido.estado === 'finalizado' ? { ...styles.parejaTexto, color: '#8A8A8A' } : styles.parejaTexto}>
                              {obtenerNombresPareja(partido.pareja2)}
                            </div>
                          </div>
                          
                          <div style={styles.resultadoContenedor}>
                            {partido.estado === 'finalizado' ? (
                              <span style={styles.badgeResultado}>{partido.resultado}</span>
                            ) : (
                              <span style={styles.badgeProgramado}>Pendiente</span>
                            )}
                            
                            {puedeEditar && onUpdateResultado && (
                              <button 
                                onClick={() => onUpdateResultado(partido)} 
                                style={styles.btnEditarScore}
                                title="Cargar marcador"
                              >
                                ✏️
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CONTENIDO 2: LLAVES ELIMINATORIAS (Bracket Horizontal) */}
      {pestanaActiva === 'llaves' && (
        <div style={styles.contenedorBracket}>
          
          <div style={styles.columnaRonda}>
            <div style={styles.tituloRonda}>Cuartos de Final</div>
            <div style={styles.bloquePartidosRonda}>
              {partidosCuartos.length === 0 ? (
                <div style={styles.itemVacioRonda}>Fase no iniciada</div>
              ) : (
                partidosCuartos.map(partido => (
                  <TarjetaPartidoBracket 
                    key={partido.id} 
                    partido={partido} 
                    onNombres={obtenerNombresPareja}
                    isAdmin={puedeEditar} 
                    onEdit={onUpdateResultado}
                  />
                ))
              )}
            </div>
          </div>

          <div style={styles.columnaRonda}>
            <div style={styles.tituloRonda}>Semifinales</div>
            <div style={styles.bloquePartidosRonda}>
              {partidosSemis.length === 0 ? (
                <div style={styles.itemVacioRonda}>Fase no iniciada</div>
              ) : (
                partidosSemis.map(partido => (
                  <TarjetaPartidoBracket 
                    key={partido.id} 
                    partido={partido} 
                    onNombres={obtenerNombresPareja}
                    isAdmin={puedeEditar} 
                    onEdit={onUpdateResultado}
                  />
                ))
              )}
            </div>
          </div>

          <div style={styles.columnaRonda}>
            <div style={styles.tituloRonda}>Gran Final</div>
            <div style={styles.bloquePartidosRonda}>
              {partidosFinal.length === 0 ? (
                <div style={styles.itemVacioRonda}>Fase no iniciada</div>
              ) : (
                partidosFinal.map(partido => (
                  <div key={partido.id} style={styles.contenedorFinalYCampeon}>
                    <TarjetaPartidoBracket 
                      partido={partido} 
                      onNombres={obtenerNombresPareja}
                      isAdmin={puedeEditar} 
                      onEdit={onUpdateResultado}
                    />
                    {partido.estado === 'finalizado' && partido.resultado && (
                      <div style={styles.tarjetaCampeon}>
                        <div style={{ fontSize: '24px' }}>🏆</div>
                        <div style={styles.tituloCampeon}>¡CAMPEONES!</div>
                        <div style={styles.nombreCampeon}>
                          Torneo Finalizado
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// Subcomponente estilizado para cada partido del Bracket
const TarjetaPartidoBracket = ({ partido, onNombres, isAdmin, onEdit }) => {
  const jugador1Empty = !partido.pareja1;
  const jugador2Empty = !partido.pareja2;

  return (
    <div style={styles.tarjetaPartidoBracket}>
      <div style={{ ...styles.bloqueJugadorBracket, opacity: jugador1Empty ? 0.5 : 1 }}>
        <span style={styles.nombreJugadorBracket}>
          {onNombres(partido.pareja1)}
        </span>
      </div>
      
      <div style={styles.divisorBracket}>
        <span style={partido.resultado ? styles.textoResultadoBracket : styles.textoVsBracket}>
          {partido.resultado || 'VS'}
        </span>
        {isAdmin && onEdit && (
          <button onClick={() => onEdit(partido)} style={styles.miniBtnEdit}>✏️</button>
        )}
      </div>

      <div style={{ ...styles.bloqueJugadorBracket, opacity: jugador2Empty ? 0.5 : 1 }}>
        <span style={styles.nombreJugadorBracket}>
          {onNombres(partido.pareja2)}
        </span>
      </div>
    </div>
  );
};

// Estilos premium integrados a la paleta Dark/Neon de ADN Pádel
const styles = {
  contenedor: { marginTop: '15px' },
  textoCargando: { color: '#8A8A8A', textAlign: 'center', padding: '20px', fontSize: '14px' },
  textoVacio: { color: '#8A8A8A', textAlign: 'center', padding: '30px', fontSize: '14px', fontStyle: 'italic' },
  contenedorTabs: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' },
  tabButton: { flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: 'transparent', border: 'none', color: '#8A8A8A', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' },
  tabActive: { backgroundColor: 'rgba(0, 255, 102, 0.08)', color: '#00ff66', border: '1px solid rgba(0, 255, 102, 0.15)' },
  seccionZonas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  tarjetaZona: { backgroundColor: '#141414', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' },
  headerZona: { backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px 16px', color: '#EAEAEA', fontWeight: '700', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  listaPartidos: { padding: '12px' },
  filaPartido: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.02)', gap: '8px' },
  infoParejas: { flex: 1 },
  parejaTexto: { color: '#EAEAEA', fontSize: '13px', fontWeight: '500' },
  vs: { color: '#555', fontSize: '10px', margin: '2px 0', fontWeight: '700', textTransform: 'uppercase' },
  resultadoContenedor: { display: 'flex', alignItems: 'center', gap: '6px' },
  badgeResultado: { backgroundColor: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(0, 229, 255, 0.15)' },
  badgeProgramado: { backgroundColor: 'rgba(255,255,255,0.04)', color: '#666', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  btnEditarScore: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px', filter: 'grayscale(100%) brightness(200%)' },
  
  // Bracket Styles
  contenedorBracket: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', overflowX: 'auto', paddingBottom: '15px' },
  columnaRonda: { display: 'flex', flexDirection: 'column', minWidth: '220px' },
  tituloRonda: { color: '#8A8A8A', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px', textAlign: 'center', letterSpacing: '1px' },
  bloquePartidosRonda: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: '20px' },
  itemVacioRonda: { color: '#444', textAlign: 'center', padding: '20px', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' },
  tarjetaPartidoBracket: { backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  bloqueJugadorBracket: { padding: '6px 8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.01)' },
  nombreJugadorBracket: { color: '#EAEAEA', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' },
  divisorBracket: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' },
  textoResultadoBracket: { color: '#00ff66', fontSize: '12px', fontWeight: '800' },
  textoVsBracket: { color: '#555', fontSize: '10px', fontWeight: '700' },
  miniBtnEdit: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' },
  contenedorFinalYCampeon: { display: 'flex', flexDirection: 'column', gap: '15px' },
  tarjetaCampeon: { backgroundColor: 'rgba(0, 255, 102, 0.04)', border: '1px dashed #00ff66', borderRadius: '12px', padding: '15px', textAlign: 'center', marginTop: '10px' },
  tituloCampeon: { color: '#00ff66', fontSize: '14px', fontWeight: '800', marginTop: '5px' },
  nombreCampeon: { color: '#EAEAEA', fontSize: '12px', marginTop: '4px', fontWeight: '600' },

  // Estilos Info y Botón Inscripción
  seccionInfo: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '5px' },
  infoLabel: { color: '#8A8A8A', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' },
  infoDato: { color: '#EAEAEA', fontSize: '15px', fontWeight: '500' },
  inscripcionBanner: { backgroundColor: 'rgba(0, 255, 102, 0.05)', border: '1px dashed rgba(0, 255, 102, 0.3)', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginTop: '10px' },
  btnInscribirse: { backgroundColor: '#00ff66', color: '#000', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 255, 102, 0.2)' }
};

export default VisualizadorCuadros;