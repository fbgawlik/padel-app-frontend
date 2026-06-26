// src/screens/MisReservasScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const MisReservasScreen = () => {
  const { usuario } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabActiva, setTabActiva] = useState('turnos'); // 'turnos', 'partidos', 'torneos'

  // Estados reales conectados al backend
  const [misTurnos, setMisTurnos] = useState([]);
  const [misPartidos, setMisPartidos] = useState([]);
  const [misTorneos, setMisTorneos] = useState([]);

  // Llamada al endpoint del backend para traer toda la actividad del jugador
  const cargarMiActividad = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Llamamos a la ruta que configuramos en tu backend
      const respuesta = await API.get('/turnos/mi-actividad');
      
      // Guardamos la información en sus respectivos estados
      setMisTurnos(respuesta.data.turnos || []);
      setMisPartidos(respuesta.data.partidos || []);
      setMisTorneos(respuesta.data.torneos || []);
    } catch (err) {
      console.error("Error al cargar la actividad:", err);
      setError('No se pudo sincronizar tu historial de reservas. Volvé a intentarlo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarMiActividad();
    }
  }, [usuario]);

  if (loading) {
    return (
      <div style={styles.contenedorMensaje}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#8A8A8A', marginTop: '16px' }}>Sincronizando tus reservas con el club...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.contenedorMensaje}>
        <p style={{ color: '#ff4444', fontWeight: '600' }}>{error}</p>
        <button onClick={cargarMiActividad} style={styles.botonReintentar}>Reintentar conexión</button>
      </div>
    );
  }

  return (
    <div style={styles.pantallaContainer}>
      {/* ENCABEZADO */}
      <div style={styles.headerSeccion}>
        <h1 style={styles.tituloPrincipal}>Mi Actividad</h1>
        <p style={styles.subtituloPrincipal}>Consultá tus turnos reservados, partidos abiertos y torneos inscritos.</p>
      </div>

      {/* SELECTOR DE TABS (ESTILO ADN PÁDEL) */}
      <div style={styles.tabsContenedor}>
        <button 
          onClick={() => setTabActiva('turnos')}
          style={{...styles.tabBoton, ...(tabActiva === 'turnos' ? styles.tabBotonActivo : {})}}
        >
          🎾 Mis Turnos ({misTurnos.length})
        </button>
        <button 
          onClick={() => setTabActiva('partidos')}
          style={{...styles.tabBoton, ...(tabActiva === 'partidos' ? styles.tabBotonActivo : {})}}
        >
          🤝 Partidos Abiertos ({misPartidos.length})
        </button>
        <button 
          onClick={() => setTabActiva('torneos')}
          style={{...styles.tabBoton, ...(tabActiva === 'torneos' ? styles.tabBotonActivo : {})}}
        >
          🏆 Mis Torneos ({misTorneos.length})
        </button>
      </div>

      {/* CONTENIDO DENTRO DE CADA TAB */}
      <div style={styles.grillaTarjetas}>
        
        {/* === TAB 1: MIS TURNOS PRIVADOS === */}
        {tabActiva === 'turnos' && (
          misTurnos.length === 0 ? (
            <div style={styles.estadoVacio}>No tenés turnos reservados actualmente. ¡Andá a la pestaña Buscar Club!</div>
          ) : (
            misTurnos.map((turno) => (
              <div key={turno.id} style={styles.tarjeta}>
                <span style={styles.badgeEstado}>CONFIRMADO</span>
                <div style={styles.cuerpoTarjeta}>
                  <h3 style={styles.tituloTarjeta}>{turno.cancha?.nombre || 'Cancha Estándar'}</h3>
                  <p style={styles.subtituloTarjeta}>🏢 {turno.cancha?.complejo?.nombre}</p>
                  <p style={{...styles.subtituloTarjeta, fontSize: '12px'}}>📍 {turno.cancha?.complejo?.direccion}</p>
                  
                  <div style={styles.divisor}></div>
                  
                  <div style={styles.filaInfo}>
                    <span>📅 Fecha: <strong>{turno.fecha}</strong></span>
                    <span>⏰ Hora: <strong>{turno.horaInicio} a {turno.horaFin} hs</strong></span>
                  </div>

                  {/* SECCIÓN DINÁMICA DE EXTRAS / CONSUMOS COMPRADOS O ALQUILADOS */}
                  {turno.consumosExtras && turno.consumosExtras.length > 0 && (
                    <div style={styles.cajaExtras}>
                      <p style={styles.tituloExtras}>🛍️ Extras añadidos a este turno:</p>
                      {turno.consumosExtras.map((item) => (
                        <div key={item.id} style={styles.itemExtra}>
                          <span style={styles.nombreExtra}>• {item.producto?.nombre} x{item.cantidad}</span>
                          <span style={styles.badgeTipoExtra}>{item.producto?.esAlquiler ? 'Alquiler' : 'Compra'}</span>
                          <span style={styles.precioExtra}>${item.precioUnitario * item.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        )}

        {/* === TAB 2: PARTIDOS ABIERTOS (Play & Share) === */}
        {tabActiva === 'partidos' && (
          misPartidos.length === 0 ? (
            <div style={styles.estadoVacio}>No estás participando en ningún partido abierto por el momento.</div>
          ) : (
            misPartidos.map((partido) => {
              // En pádel juegan 4. Creador (1) + las inscripciones en la tabla puente.
              const jugadoresActuales = 1 + (partido.inscripcionesPartido?.length || 0);
              const esOrganizador = partido.jugadorId === usuario.id;

              return (
                <div key={partido.id} style={styles.tarjeta}>
                  <span style={{
                    ...styles.badgeEstado, 
                    backgroundColor: esOrganizador ? 'rgba(0, 153, 255, 0.1)' : 'rgba(0, 255, 102, 0.1)',
                    color: esOrganizador ? '#0099ff' : '#00ff66',
                    borderColor: esOrganizador ? 'rgba(0, 153, 255, 0.2)' : 'rgba(0, 255, 102, 0.2)'
                  }}>
                    {esOrganizador ? 'ORGANIZADOR' : 'INSCRIPTO'}
                  </span>
                  <div style={styles.cuerpoTarjeta}>
                    <h3 style={styles.tituloTarjeta}>Partido Abierto: {partido.cancha?.nombre}</h3>
                    <p style={styles.subtituloTarjeta}>🏢 Club: {partido.cancha?.complejo?.nombre}</p>
                    <p style={{...styles.subtituloTarjeta, fontSize: '13px', color: '#00ff66'}}>
                      👤 Organiza: {esOrganizador ? 'Vos' : `${partido.jugador?.nombre} ${partido.jugador?.apellido}`}
                    </p>
                    
                    <div style={styles.divisor}></div>
                    
                    <div style={styles.filaInfo}>
                      <span>📅 {partido.fecha}</span>
                      <span>⏰ {partido.horaInicio} hs</span>
                    </div>

                    <div style={styles.contenedorProgreso}>
                      <div style={styles.filaProgresoTexto}>
                        <span>Cupos ocupados</span>
                        <strong>{jugadoresActuales} / 4 Jugadores</strong>
                      </div>
                      <div style={styles.barraProgresoFondo}>
                        <div style={{...styles.barraProgresoRelleno, width: `${(jugadoresActuales / 4) * 100}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}

        {/* === TAB 3: MIS TORNEOS === */}
        {tabActiva === 'torneos' && (
          misTorneos.length === 0 ? (
            <div style={styles.estadoVacio}>No te inscribiste a ningún torneo de pádel todavía.</div>
          ) : (
            misTorneos.map((inscripcion) => (
              <div key={inscripcion.id} style={styles.tarjeta}>
                <span style={{...styles.badgeEstado, backgroundColor: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', borderColor: 'rgba(255, 170, 0, 0.2)'}}>
                  COMPETENCIA
                </span>
                <div style={styles.cuerpoTarjeta}>
                  <h3 style={styles.tituloTarjeta}>{inscripcion.torneo?.nombre}</h3>
                  <p style={styles.subtituloTarjeta}>🏢 Sede: {inscripcion.torneo?.complejo?.nombre}</p>
                  <p style={{...styles.subtituloTarjeta, color: '#ffaa00', fontWeight: 'bold'}}>🏆 Categoría anotada: {inscripcion.categoria}</p>
                  
                  <div style={styles.divisor}></div>
                  
                  <div style={styles.filaInfo}>
                    <span>👥 Pareja: <strong>{inscripcion.jugador1} y {inscripcion.jugador2}</strong></span>
                  </div>
                  <div style={{...styles.filaInfo, marginTop: '8px', fontSize: '13px', color: '#8A8A8A'}}>
                    <span>📅 Cronograma: {inscripcion.torneo?.fechaInicio} al {inscripcion.torneo?.fechaFin}</span>
                  </div>
                </div>
              </div>
            ))
          )
        )}

      </div>
    </div>
  );
};

// === ESTILOS VISUALES PREMIUM (ADN PÁDEL DARK MODE) ===
const styles = {
  pantallaContainer: {
    padding: '40px 24px',
    minHeight: '100vh',
    backgroundColor: '#0A0A0A',
  },
  headerSeccion: {
    marginBottom: '32px',
  },
  tituloPrincipal: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtituloPrincipal: {
    fontSize: '15px',
    color: '#8A8A8A',
    margin: 0,
  },
  tabsContenedor: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '16px',
    marginBottom: '32px',
    overflowX: 'auto', // Scroll horizontal en celulares si no entran
  },
  tabBoton: {
    background: 'none',
    border: 'none',
    color: '#8A8A8A',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tabBotonActivo: {
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    color: '#00ff66',
    fontWeight: '700',
  },
  grillaTarjetas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
  },
  tarjeta: {
    backgroundColor: '#121212',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  cuerpoTarjeta: {
    padding: '24px',
  },
  badgeEstado: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    color: '#00ff66',
    border: '1px solid rgba(0, 255, 102, 0.2)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  tituloTarjeta: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#fff',
    margin: '0 0 6px 0',
    paddingRight: '90px',
  },
  subtituloTarjeta: {
    fontSize: '14px',
    color: '#8A8A8A',
    margin: '0 0 4px 0',
  },
  divisor: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: '16px 0',
  },
  filaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#EAEAEA',
  },
  estadoVacio: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#121212',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    color: '#8A8A8A',
    fontSize: '14px',
  },
  cajaExtras: {
    marginTop: '20px',
    backgroundColor: 'rgba(0, 255, 102, 0.02)',
    border: '1px dashed rgba(0, 255, 102, 0.15)',
    borderRadius: '10px',
    padding: '14px',
  },
  tituloExtras: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: '700',
    color: '#00ff66',
  },
  itemExtra: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    marginBottom: '8px',
    color: '#EAEAEA',
  },
  nombreExtra: {
    flex: 1,
  },
  badgeTipoExtra: {
    fontSize: '10px',
    backgroundColor: '#222',
    color: '#aaa',
    padding: '2px 6px',
    borderRadius: '4px',
    marginRight: '12px',
  },
  precioExtra: {
    fontWeight: '700',
    color: '#fff',
  },
  contenedorProgreso: {
    marginTop: '20px',
  },
  filaProgresoTexto: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#8A8A8A',
    marginBottom: '6px',
  },
  barraProgresoFondo: {
    height: '6px',
    backgroundColor: '#222',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  barraProgresoRelleno: {
    height: '100%',
    backgroundColor: '#00ff66',
    borderRadius: '10px',
    transition: 'width 0.3s ease',
  },
  contenedorMensaje: {
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(0, 255, 102, 0.1)',
    borderTop: '3px solid #00ff66',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  botonReintentar: {
    marginTop: '20px',
    backgroundColor: '#161616',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  }
};

export default MisReservasScreen;