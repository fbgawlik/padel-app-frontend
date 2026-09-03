// src/screens/ReservarTurnoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { styles } from './ReservarTurnoScreen.styles';

const ReservarTurnoScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complejo, setComplejo] = useState(null); 
  const [turnos, setTurnos] = useState([]); 

  const obtenerFechaHoy = () => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  };

  const generarProximosDias = () => {
    const diasSemana = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const dias = [];
    
    for (let i = 0; i < 7; i++) {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + i);
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      
      const fechaStr = `${yyyy}-${mm}-${dd}`;
      const nombreDia = diasSemana[hoy.getDay()];
      const numeroDia = hoy.getDate();
      
      dias.push({ fechaStr, nombreDia, numeroDia });
    }
    return dias;
  };

  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaHoy());
  
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [esPartidoAbierto, setEsPartidoAbierto] = useState(false);
  const { mostrarNotificacion } = useNotification();

  const generarSlotsHorarios = () => {
    const slots = [];
    for (let h = 8; h <= 23; h++) {
      const hInicio = String(h).padStart(2, '0') + ':00';
      const hFin = String(h + 1).padStart(2, '0') + ':00';
      slots.push({ inicio: hInicio, fin: hFin });
    }
    return slots;
  };

  const horarioMinimoDisponibleHoy = () => {
    const hoy = new Date();
    const fechaActual = obtenerFechaHoy();
    if (fechaSeleccionada !== fechaActual) return null;

    const proxHora = new Date(hoy);
    proxHora.setMinutes(0, 0, 0);
    proxHora.setHours(proxHora.getHours() + 1);

    return `${String(proxHora.getHours()).padStart(2, '0')}:00`;
  };

  const esSlotPasado = (slot) => {
    const horaMinima = horarioMinimoDisponibleHoy();
    if (!horaMinima) return false;
    return slot.inicio < horaMinima;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get(`/complejos/${id}`);
        setComplejo(res.data);
        if (res.data.canchas?.length > 0) setCanchaSeleccionada(res.data.canchas[0]);
      } catch (err) {
        console.error("Error al cargar la info de reserva:", err);
        setError("Error al cargar los datos del complejo.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  useEffect(() => {
    const cargarTurnos = async () => {
      if (!complejo || !canchaSeleccionada) return;
      try {
        const res = await API.get('/turnos', {
          params: { canchaId: canchaSeleccionada.id, fecha: fechaSeleccionada }
        });
        setTurnos(res.data);
      } catch (err) {
        console.error("Error al cargar turnos:", err);
      }
    };
    cargarTurnos();
  }, [canchaSeleccionada, fechaSeleccionada, complejo]);

  const comprobarSlotOcupado = (inicio, fin) => {
    const [hI, mI] = inicio.split(':').map(Number);
    const [hF, mF] = fin.split(':').map(Number);
    const minInicio = hI * 60 + mI;
    const minFin = hF * 60 + mF;

    return turnos.some(t => {
      if (t.estado === 'disponible') return false; 
      const [exHIn, exMIn] = t.horaInicio.split(':').map(Number);
      const [exHFi, exMFi] = t.horaFin.split(':').map(Number);
      const exInicio = exHIn * 60 + exMIn;
      const exFin = exHFi * 60 + exMFi;
      
      return (minInicio < exFin) && (minFin > exInicio);
    });
  };

  const seleccionarSlotHorario = (slot) => {
    if (esSlotPasado(slot) || comprobarSlotOcupado(slot.inicio, slot.fin)) return;

    if (!horaInicio) {
      setHoraInicio(slot.inicio);
      setHoraFin(slot.fin);
    } else {
      const [hClickIn] = slot.inicio.split(':').map(Number);
      const [hSelIn] = horaInicio.split(':').map(Number);

      if (hClickIn >= hSelIn) {
        const hayBloqueadoEnMedio = comprobarSlotOcupado(horaInicio, slot.fin);
        if (hayBloqueadoEnMedio) {
          setHoraInicio(slot.inicio);
          setHoraFin(slot.fin);
        } else {
          setHoraFin(slot.fin);
        }
      } else {
        setHoraInicio(slot.inicio);
        setHoraFin(slot.fin);
      }
    }
  };

  const gestionarConfirmacionReserva = async () => {
    if (!horaInicio || !horaFin) return;
    try {
      await API.post('/turnos', {
        canchaId: canchaSeleccionada.id, 
        fecha: fechaSeleccionada, 
        horaInicio, 
        horaFin,
        tipoTurno: esPartidoAbierto ? 'partido_abierto' : 'normal'
      });
      mostrarNotificacion(esPartidoAbierto ? "¡Partido abierto creado con éxito!" : "¡Turno reservado con éxito!", 'success');
      
      setHoraInicio("");
      setHoraFin("");
      const res = await API.get('/turnos', { params: { canchaId: canchaSeleccionada.id, fecha: fechaSeleccionada } });
      setTurnos(res.data);
      setEsPartidoAbierto(false); 
    } catch (err) {
      mostrarNotificacion("No se pudo completar la reserva.", 'error');
    }
  };

  const gestionarCompraProducto = async (producto) => {
    if (producto.stock <= 0) {
      mostrarNotificacion("Producto agotado.", 'error');
      return;
    }
    const accion = producto.esAlquiler ? 'alquilar' : 'comprar';
    if (!window.confirm(`¿Confirmar ${accion} de "${producto.nombre}"?`)) return;

    try {
      await API.post(`/productos/${producto.id}/ventas`, { 
        cantidad: 1, 
        turnoId: "turno_temporal_pendiente_de_reserva" 
      });
      
      setComplejo(prev => ({
        ...prev,
        productos: prev.productos.map(p => 
          p.id === producto.id ? { ...p, stock: p.stock - 1 } : p
        )
      }));
      
      mostrarNotificacion(`¡${accion.charAt(0).toUpperCase() + accion.slice(1)} exitosa! Retiralo por la cantina el día de tu partido.`, 'success');
    } catch (error) {
      console.error("Error al procesar la transacción:", error);
      mostrarNotificacion("Error al procesar la operación.", 'error');
    }
  };

  if (loading) return (
    <div style={styles.estadoVacioSpinner}>
      <div style={styles.spinner}></div>
      <p style={styles.textoCargando}>Buscando canchas libres...</p>
    </div>
  );
  
  if (error || !complejo) return (
    <div style={styles.estadoVacio}>
      <p style={styles.textoError}>{error || "Club no encontrado"}</p>
    </div>
  );

  const listaProductos = complejo.productos || [];

  return (
    <div style={styles.contenedor}>
      
      <div style={styles.headerNavegacion}>
        <button onClick={() => navigate(-1)} style={styles.botonVolver}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      </div>

      <div style={styles.headerClub}>
        <h1 style={styles.tituloClub}>{complejo.nombre}</h1>
        <p style={styles.infoClub}>📍 {complejo.direccion}</p>
      </div>

      <div style={styles.seccionContenedor}>
        <div style={styles.encabezadoPaso}>
          <span style={styles.numeroBadge}>1</span>
          <h3 style={styles.subtituloSeccion}>Selecciona la Cancha</h3>
        </div>
        <div style={styles.scrollHorizontal}>
          {complejo.canchas?.map((cancha) => {
            const seleccionada = canchaSeleccionada?.id === cancha.id;
            return (
              <button 
                key={cancha.id} 
                onClick={() => {
                  setCanchaSeleccionada(cancha);
                  setHoraInicio(""); 
                  setHoraFin("");
                }}
                style={{
                  ...styles.pildoraCancha,
                  backgroundColor: seleccionada ? 'rgba(190, 242, 100, 0.08)' : '#121214',
                  borderColor: seleccionada ? '#BEF264' : 'rgba(255, 255, 255, 0.05)',
                  color: seleccionada ? '#BEF264' : '#ffffff'
                }}
              >
                <span style={styles.iconoPildora}>🎾</span>
                <span style={styles.textoPildora}>{cancha.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.seccionContenedor}>
        <div style={styles.encabezadoPaso}>
          <span style={styles.numeroBadge}>2</span>
          <h3 style={styles.subtituloSeccion}>Selecciona el Día</h3>
        </div>
        <div style={styles.scrollHorizontal}>
          {generarProximosDias().map((dia) => {
            const esSeleccionado = fechaSeleccionada === dia.fechaStr;
            return (
              <button
                key={dia.fechaStr}
                onClick={() => {
                  setFechaSeleccionada(dia.fechaStr);
                  setHoraInicio(""); 
                  setHoraFin("");
                }}
                style={{
                  ...styles.tarjetaFecha,
                  backgroundColor: esSeleccionado ? '#BEF264' : '#121214',
                  border: esSeleccionado ? '1px solid #BEF264' : '1px solid rgba(255, 255, 255, 0.04)',
                  boxShadow: esSeleccionado ? '0 8px 20px rgba(190, 242, 100, 0.2)' : 'none'
                }}
              >
                <span style={{ 
                  ...styles.nombreDiaTexto, 
                  color: esSeleccionado ? '#000000' : '#8E8E93' 
                }}>
                  {dia.nombreDia.toUpperCase()}
                </span>
                <span style={{ 
                  ...styles.numeroDiaTexto, 
                  color: esSeleccionado ? '#000000' : '#ffffff' 
                }}>
                  {dia.numeroDia}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.seccionContenedor}>
        <div style={styles.encabezadoPaso}>
          <span style={styles.numeroBadge}>3</span>
          <h3 style={styles.subtituloSeccion}>Elige tu Horario</h3>
        </div>
        <p style={styles.ayudaTexto}>Toca una hora de inicio y otra de fin para reservar bloques correlativos.</p>
        
        <div style={styles.grillaHorarios}>
          {generarSlotsHorarios().map(slot => {
            const ocupado = comprobarSlotOcupado(slot.inicio, slot.fin);
            const pasado = esSlotPasado(slot);
            const seleccionado = horaInicio && horaFin && (slot.inicio >= horaInicio && slot.fin <= horaFin);
            const inhabilitado = ocupado || pasado;

            return (
              <button
                key={slot.inicio}
                disabled={inhabilitado}
                onClick={() => seleccionarSlotHorario(slot)}
                style={{
                  ...styles.botonSlot,
                  ...(ocupado 
                    ? styles.slotOcupado 
                    : pasado
                      ? styles.slotPasado
                      : seleccionado 
                        ? styles.slotSeleccionado 
                        : styles.slotDisponible)
                }}
              >
                <span style={styles.slotHoraTexto}>{slot.inicio}</span>
                {ocupado && <span style={styles.textoOcupadoLabel}>Ocupado</span>}
                {!ocupado && pasado && <span style={styles.textoOcupadoLabel}>Pasado</span>}
              </button>
            );
          })}
        </div>
      </div>
      
      <div style={styles.tarjetaPartidoAbierto}>
        <div style={styles.textoPartidoAbierto}>
          <span style={styles.tituloPartidoAbierto}>¿Crear Partido Abierto?</span>
          <span style={styles.descPartidoAbierto}>Otros jugadores de la comunidad podrán sumarse a los slots libres.</span>
        </div>
        <div style={styles.switchContenedor}>
          <input
            type="checkbox"
            id="partidoAbierto"
            checked={esPartidoAbierto}
            onChange={(e) => setEsPartidoAbierto(e.target.checked)}
            style={styles.checkboxPremium}
          />
        </div>
      </div>

      <div style={styles.bloqueBotonPrincipal}>
        <button 
          onClick={gestionarConfirmacionReserva} 
          disabled={!horaInicio || !horaFin} 
          style={{
            ...styles.botonReservar,
            backgroundColor: (horaInicio && horaFin) ? '#BEF264' : 'rgba(255, 255, 255, 0.04)',
            color: (horaInicio && horaFin) ? '#000000' : 'rgba(255, 255, 255, 0.2)',
            cursor: (horaInicio && horaFin) ? 'pointer' : 'not-allowed',
            boxShadow: (horaInicio && horaFin) ? '0 8px 24px rgba(190, 242, 100, 0.25)' : 'none'
          }}
        >
          {(horaInicio && horaFin) 
            ? `Confirmar Reserva (${horaInicio} a ${horaFin} hs)` 
            : "Selecciona un Horario"
          }
        </button>
      </div>

      <div style={styles.seccionTiendaWrapper}>
        <div style={styles.encabezadoPaso}>
          <span style={styles.iconoTiendaSeccion}>🛒</span>
          <h3 style={styles.subtituloSeccion}>Extras para tu partido</h3>
        </div>
        <p style={styles.ayudaTextoTienda}>Agrega palas o bebidas para retirar directamente al llegar al complejo.</p>

        {listaProductos.length === 0 ? (
          <p style={styles.textoVacio}>No hay extras disponibles en este club.</p>
        ) : (
          <div style={styles.grillaTienda}>
            {listaProductos.map(p => {
              const agotado = p.stock <= 0;
              return (
                <div key={p.id} style={{ ...styles.tarjetaProducto, opacity: agotado ? 0.4 : 1 }}>
                  <div style={styles.infoProductoHorizontal}>
                    <div style={styles.iconoTienda}>{p.esAlquiler ? '🎾' : '🥤'}</div>
                    <div style={styles.cuerpoProducto}>
                      <h4 style={styles.nombreProducto}>{p.nombre}</h4>
                      <span style={{ 
                        ...styles.badgeTipo, 
                        color: p.esAlquiler ? '#00ccff' : '#8E8E93',
                        backgroundColor: p.esAlquiler ? 'rgba(0, 204, 255, 0.08)' : 'rgba(255,255,255,0.04)'
                      }}>
                        {p.esAlquiler ? 'Alquiler' : 'Compra'}
                      </span>
                    </div>
                    <div style={styles.accionesProducto}>
                      <div style={styles.precioProducto}>${p.precio}</div>
                      <button 
                        disabled={agotado}
                        onClick={() => gestionarCompraProducto(p)}
                        style={{ 
                          ...styles.botonAccionTienda,
                          backgroundColor: agotado ? 'transparent' : 'rgba(190, 242, 100, 0.08)',
                          color: agotado ? '#444446' : '#BEF264',
                          border: agotado ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(190, 242, 100, 0.15)'
                        }}
                      >
                        {agotado ? 'Agotado' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservarTurnoScreen;