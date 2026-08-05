// src/screens/MisReservasScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { styles } from './MisReservasScreen.styles';

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

;

export default MisReservasScreen;