// src/screens/MisReservasScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const MisReservasScreen = () => {
  const { usuario } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabActiva, setTabActiva] = useState('turnos');

  const [misTurnos, setMisTurnos] = useState([]);
  const [misPartidos, setMisPartidos] = useState([]);
  const [misTorneos, setMisTorneos] = useState([]);

  const cargarMiActividad = async () => {
    try {
      setLoading(true);
      setError('');
      
      const respuesta = await API.get('/turnos/mi-actividad');
      
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const fechaHoyStr = `${yyyy}-${mm}-${dd}`;
      const horaActualStr = String(hoy.getHours()).padStart(2, '0') + ':' + String(hoy.getMinutes()).padStart(2, '0');

      const filtrarFuturos = (items) => {
        if (!items) return [];
        return items.filter(item => {
          if (!item.fecha) return true;
          if (item.fecha > fechaHoyStr) return true;
          if (item.fecha === fechaHoyStr && item.horaInicio > horaActualStr) return true;
          return false;
        }).sort((a, b) => {
          const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
          const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
          return fechaA - fechaB;
        });
      };

      const filtrarTorneosActivos = (inscripciones) => {
        if (!inscripciones) return [];
        return inscripciones.filter(insc => {
          if (!insc.torneo || !insc.torneo.fechaFin) return true;
          return insc.torneo.fechaFin >= fechaHoyStr;
        });
      };

      setMisTurnos(filtrarFuturos(respuesta.data.turnos));
      setMisPartidos(filtrarFuturos(respuesta.data.partidos));
      setMisTorneos(filtrarTorneosActivos(respuesta.data.torneos));

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
        <p style={styles.textoSincronizando}>Sincronizando tus reservas con el club...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.contenedorMensaje}>
        <p style={styles.textoError}>{error}</p>
        <button onClick={cargarMiActividad} style={styles.botonReintentar}>Reintentar conexión</button>
      </div>
    );
  }

  return (
    <div style={styles.pantallaContainer}>
      
      <div style={styles.headerSeccion}>
        <h1 style={styles.tituloPrincipal}>Mi Actividad</h1>
        <p style={styles.subtituloPrincipal}>Consultá tus turnos reservados, partidos abiertos y torneos inscritos.</p>
      </div>

      <div style={styles.tabsContenedor}>
        <button 
          onClick={() => setTabActiva('turnos')}
          style={{...styles.tabBoton, ...(tabActiva === 'turnos' ? styles.tabBotonActivo : {})}}
        >
          🎾 Turnos ({misTurnos.length})
        </button>
        <button 
          onClick={() => setTabActiva('partidos')}
          style={{...styles.tabBoton, ...(tabActiva === 'partidos' ? styles.tabBotonActivo : {})}}
        >
          🤝 Partidos ({misPartidos.length})
        </button>
        <button 
          onClick={() => setTabActiva('torneos')}
          style={{...styles.tabBoton, ...(tabActiva === 'torneos' ? styles.tabBotonActivo : {})}}
        >
          🏆 Torneos ({misTorneos.length})
        </button>
      </div>

      <div style={styles.grillaTarjetas}>
        
        {tabActiva === 'turnos' && (
          misTurnos.length === 0 ? (
            <div style={styles.estadoVacio}>
              <p style={styles.textoVacio}>No tenés próximos turnos reservados. ¡Explorá los clubes disponibles!</p>
            </div>
          ) : (
            misTurnos.map((turno) => (
              <div key={turno.id} style={styles.tarjeta}>
                <span style={styles.badgeEstado}>CONFIRMADO</span>
                <div style={styles.cuerpoTarjeta}>
                  <h3 style={styles.tituloTarjeta}>{turno.cancha?.nombre || 'Cancha Estándar'}</h3>
                  <p style={styles.subtituloTarjeta}>🏢 {turno.cancha?.complejo?.nombre}</p>
                  <p style={styles.direccionTarjeta}>📍 {turno.cancha?.complejo?.direccion}</p>
                  
                  <div style={styles.divisor}></div>
                  
                  <div style={styles.filaInfo}>
                    <span style={styles.datoTexto}>📅 Fecha: <strong style={styles.resaltado}>{turno.fecha}</strong></span>
                    <span style={styles.datoTexto}>⏰ Hora: <strong style={styles.resaltado}>{turno.horaInicio} a {turno.horaFin} hs</strong></span>
                  </div>

                  {turno.consumosExtras && turno.consumosExtras.length > 0 && (
                    <div style={styles.cajaExtras}>
                      <p style={styles.tituloExtras}>🛍️ Extras añadidos:</p>
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

        {tabActiva === 'partidos' && (
          misPartidos.length === 0 ? (
            <div style={styles.estadoVacio}>
              <p style={styles.textoVacio}>No estás anotado en ningún próximo partido abierto.</p>
            </div>
          ) : (
            misPartidos.map((partido) => {
              const jugadoresActuales = 1 + (partido.inscripcionesPartido?.length || 0);
              const esOrganizador = partido.jugadorId === usuario.id;

              return (
                <div key={partido.id} style={styles.tarjeta}>
                  <span style={{
                    ...styles.badgeEstado, 
                    backgroundColor: esOrganizador ? 'rgba(0, 204, 255, 0.08)' : 'rgba(57, 255, 20, 0.08)',
                    color: esOrganizador ? '#00ccff' : '#39FF14',
                    borderColor: esOrganizador ? 'rgba(0, 204, 255, 0.15)' : 'rgba(57, 255, 20, 0.15)'
                  }}>
                    {esOrganizador ? 'ORGANIZADOR' : 'INSCRIPTO'}
                  </span>
                  <div style={styles.cuerpoTarjeta}>
                    <h3 style={styles.tituloTarjeta}>Partido Abierto: {partido.cancha?.nombre}</h3>
                    <p style={styles.subtituloTarjeta}>🏢 Club: {partido.cancha?.complejo?.nombre}</p>
                    <p style={{...styles.subtituloTarjeta, color: esOrganizador ? '#00ccff' : '#39FF14', fontWeight: '500'}}>
                      👤 Organiza: {esOrganizador ? 'Vos' : `${partido.jugador?.nombre} ${partido.jugador?.apellido}`}
                    </p>
                    
                    <div style={styles.divisor}></div>
                    
                    <div style={styles.filaInfo}>
                      <span style={styles.datoTexto}>📅 {partido.fecha}</span>
                      <span style={styles.datoTexto}>⏰ {partido.horaInicio} hs</span>
                    </div>

                    <div style={styles.contenedorProgreso}>
                      <div style={styles.filaProgresoTexto}>
                        <span>Cupos ocupados</span>
                        <strong style={styles.resaltadoProgreso}>{jugadoresActuales} / 4 Jugadores</strong>
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

        {tabActiva === 'torneos' && (
          misTorneos.length === 0 ? (
            <div style={styles.estadoVacio}>
              <p style={styles.textoVacio}>No te inscribiste a ningún torneo activo todavía.</p>
            </div>
          ) : (
            misTorneos.map((inscripcion) => (
              <div key={inscripcion.id} style={styles.tarjeta}>
                <span style={styles.badgeTorneo}>COMPETENCIA</span>
                <div style={styles.cuerpoTarjeta}>
                  <h3 style={styles.tituloTarjeta}>{inscripcion.torneo?.nombre}</h3>
                  <p style={styles.subtituloTarjeta}>🏢 Sede: {inscripcion.torneo?.complejo?.nombre}</p>
                  <p style={styles.categoriaTexto}>🏆 Categoría: {inscripcion.categoria}</p>
                  
                  <div style={styles.divisor}></div>
                  
                  <div style={styles.filaInfo}>
                    <span style={styles.datoTexto}>👥 Pareja: <strong style={styles.resaltado}>{inscripcion.jugador1} y {inscripcion.jugador2}</strong></span>
                  </div>
                  <div style={styles.cronogramaFila}>
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

const styles = {
  pantallaContainer: {
    padding: '16px 20px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  headerSeccion: {
    marginBottom: '28px'
  },
  tituloPrincipal: {
    fontSize: '34px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.8px'
  },
  subtituloPrincipal: {
    fontSize: '15px',
    color: '#8E8E93',
    margin: 0,
    letterSpacing: '-0.2px',
    lineHeight: '1.4'
  },
  tabsContenedor: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#121214',
    padding: '6px',
    borderRadius: '24px',
    marginBottom: '32px',
    overflowX: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  tabBoton: {
    background: 'none',
    border: 'none',
    color: '#8E8E93',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '18px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    flex: 1,
    textAlign: 'center'
  },
  tabBotonActivo: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#ffffff',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  grillaTarjetas: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  tarjeta: {
    backgroundColor: '#121214',
    borderRadius: '28px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
  },
  cuerpoTarjeta: {
    padding: '24px 22px'
  },
  badgeEstado: {
    position: 'absolute',
    top: '22px',
    right: '22px',
    backgroundColor: 'rgba(57, 255, 20, 0.08)',
    color: '#39FF14',
    border: '1px solid rgba(57, 255, 20, 0.15)',
    padding: '6px 12px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.4px'
  },
  badgeTorneo: {
    position: 'absolute',
    top: '22px',
    right: '22px',
    backgroundColor: 'rgba(255, 159, 10, 0.08)',
    color: '#FF9F0A',
    border: '1px solid rgba(255, 159, 10, 0.15)',
    padding: '6px 12px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.4px'
  },
  tituloTarjeta: {
    fontSize: '19px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 6px 0',
    paddingRight: '110px',
    letterSpacing: '-0.3px'
  },
  subtituloTarjeta: {
    fontSize: '14px',
    color: '#8E8E93',
    margin: '0 0 4px 0',
    letterSpacing: '-0.1px'
  },
  direccionTarjeta: {
    fontSize: '12px',
    color: '#8E8E93',
    margin: 0,
    letterSpacing: '-0.1px'
  },
  divisor: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: '18px 0'
  },
  filaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  datoTexto: {
    fontSize: '13px',
    color: '#8E8E93'
  },
  resaltado: {
    color: '#ffffff',
    fontWeight: '600'
  },
  cajaExtras: {
    marginTop: '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '14px 16px'
  },
  tituloExtras: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  itemExtra: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    marginBottom: '6px',
    color: '#ffffff'
  },
  nombreExtra: {
    flex: 1,
    color: '#8E8E93'
  },
  badgeTipoExtra: {
    fontSize: '10px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#8E8E93',
    padding: '3px 8px',
    borderRadius: '6px',
    marginRight: '12px',
    fontWeight: '600'
  },
  precioExtra: {
    fontWeight: '700',
    color: '#ffffff'
  },
  contenedorProgreso: {
    marginTop: '20px'
  },
  filaProgresoTexto: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#8E8E93',
    marginBottom: '8px'
  },
  resaltadoProgreso: {
    color: '#ffffff',
    fontWeight: '600'
  },
  barraProgresoFondo: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '99px',
    overflow: 'hidden'
  },
  barraProgresoRelleno: {
    height: '100%',
    backgroundColor: '#39FF14',
    borderRadius: '99px',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 12px rgba(57, 255, 20, 0.4)'
  },
  categoriaTexto: {
    fontSize: '14px', 
    color: '#FF9F0A', 
    fontWeight: '600',
    margin: '4px 0 0 0'
  },
  cronogramaFila: {
    marginTop: '10px', 
    fontSize: '12px', 
    color: '#8E8E93'
  },
  contenedorMensaje: {
    height: '75vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textoSincronizando: { 
    color: '#8E8E93', 
    marginTop: '16px',
    fontSize: '15px'
  },
  textoError: { 
    color: '#FF453A', 
    fontWeight: '600',
    fontSize: '15px'
  },
  botonReintentar: {
    marginTop: '20px',
    backgroundColor: '#121214',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '12px 24px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px'
  },
  estadoVacio: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#121214',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
    borderRadius: '24px'
  },
  textoVacio: {
    color: '#8E8E93',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.4'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(57, 255, 20, 0.1)',
    borderTop: '3px solid #39FF14',
    borderRadius: '50%'
  }
};

export default MisReservasScreen;