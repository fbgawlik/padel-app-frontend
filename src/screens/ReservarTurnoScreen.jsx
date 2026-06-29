// src/screens/ReservarTurnoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const BACKEND_URL = 'https://padel-api-backend-production.up.railway.app';

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

  // Generador dinámico de los próximos 7 días para el carrusel horizontal
  const generarProximosDias = () => {
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const hoy = new Date();
      hoy.setDate(hoy.getDate() + i);
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      
      const fechaStr = `${yyyy}-${mm}-${dd}`;
      const nombreDia = hoy.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
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

  const generarSlotsHorarios = () => {
    const slots = [];
    for (let h = 8; h <= 23; h++) {
      const hInicio = String(h).padStart(2, '0') + ':00';
      const hFin = String(h + 1).padStart(2, '0') + ':00';
      slots.push({ inicio: hInicio, fin: hFin });
    }
    return slots;
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
      alert(esPartidoAbierto ? "¡Partido abierto creado con éxito!" : "¡Turno reservado con éxito!");
      
      setHoraInicio("");
      setHoraFin("");
      const res = await API.get('/turnos', { params: { canchaId: canchaSeleccionada.id, fecha: fechaSeleccionada } });
      setTurnos(res.data);
      setEsPartidoAbierto(false); 
    } catch (err) {
      alert("No se pudo completar la reserva.");
    }
  };

  const gestionarCompraProducto = async (producto) => {
    if (producto.stock <= 0) {
      alert("Producto agotado.");
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
      
      alert(`¡${accion.charAt(0).toUpperCase() + accion.slice(1)} exitosa! Retiralo por la cantina el día de tu partido.`);
    } catch (error) {
      console.error("Error al procesar la transacción:", error);
      alert("Error al procesar la operación.");
    }
  };

  if (loading) return (
    <div style={styles.estadoVacio}>
      <div style={styles.spinner}></div>
      <p style={{color: '#8E8E93', fontSize: '15px'}}>Buscando canchas libres...</p>
    </div>
  );
  
  if (error || !complejo) return (
    <div style={styles.estadoVacio}>
      <p>{error || "Club no encontrado"}</p>
    </div>
  );

  const listaProductos = complejo.productos || [];

  return (
    <div style={styles.contenedor}>
      
      {/* BOTÓN VOLVER PREMIUM */}
      <button onClick={() => navigate(-1)} style={styles.botonVolver}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      {/* HEADER DEL CLUB */}
      <div style={styles.headerClub}>
        <h1 style={styles.tituloClub}>{complejo.nombre}</h1>
        <p style={styles.infoClub}>📍 {complejo.direccion}</p>
      </div>

      {/* PASO 1: SELECCIÓN DE CANCHA (Horizontal Scroll) */}
      <div style={styles.seccionContenedor}>
        <h3 style={styles.subtituloSeccion}>1. Selecciona la Cancha</h3>
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
                  backgroundColor: seleccionada ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255,255,255,0.04)',
                  borderColor: seleccionada ? '#39FF14' : 'rgba(255,255,255,0.06)',
                  color: seleccionada ? '#39FF14' : '#fff'
                }}
              >
                <span style={{ fontSize: '16px' }}>🎾</span>
                <span style={{ fontWeight: '600' }}>{cancha.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 2: SELECTOR DE FECHAS PREMIUM (Horizontal Scroll) */}
      <div style={styles.seccionContenedor}>
        <h3 style={styles.subtituloSeccion}>2. Selecciona el Día</h3>
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
                  backgroundColor: esSeleccionado ? '#39FF14' : '#161618',
                  border: esSeleccionado ? '1px solid #39FF14' : '1px solid rgba(255,255,255,0.04)'
                }}
              >
                <span style={{ 
                  ...styles.nombreDiaTexto, 
                  color: esSeleccionado ? '#0F0F10' : '#8E8E93' 
                }}>
                  {dia.nombreDia.toUpperCase()}
                </span>
                <span style={{ 
                  ...styles.numeroDiaTexto, 
                  color: esSeleccionado ? '#0F0F10' : '#fff' 
                }}>
                  {dia.numeroDia}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 3: GRID DE HORARIOS DISPONIBLES */}
      <div style={styles.seccionContenedor}>
        <h3 style={styles.subtituloSeccion}>3. Elige tu Horario</h3>
        <p style={styles.ayudaTexto}>Toca una hora de inicio y otra de fin para reservar bloques más largos.</p>
        
        <div style={styles.grillaHorarios}>
          {generarSlotsHorarios().map(slot => {
            const ocupado = comprobarSlotOcupado(slot.inicio, slot.fin);
            const seleccionado = horaInicio && horaFin && (slot.inicio >= horaInicio && slot.fin <= horaFin);

            return (
              <button
                key={slot.inicio}
                disabled={ocupado}
                onClick={() => seleccionarSlotHorario(slot)}
                style={{
                  ...styles.botonSlot,
                  ...(ocupado 
                    ? styles.slotOcupado 
                    : seleccionado 
                      ? styles.slotSeleccionado 
                      : styles.slotDisponible)
                }}
              >
                <span style={styles.slotHoraTexto}>{slot.inicio}</span>
                {ocupado && <span style={styles.textoOcupadoLabel}>Ocupado</span>}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* SWITCH DE PARTIDO ABIERTO */}
      <div style={styles.tarjetaPartidoAbierto}>
        <div style={styles.textoPartidoAbierto}>
          <span style={styles.tituloPartidoAbierto}>¿Crear Partido Abierto?</span>
          <span style={styles.descPartidoAbierto}>Cualquier jugador podrá unirse a los lugares libres.</span>
        </div>
        <input
          type="checkbox"
          id="partidoAbierto"
          checked={esPartidoAbierto}
          onChange={(e) => setEsPartidoAbierto(e.target.checked)}
          style={styles.checkboxPremium}
        />
      </div>

      {/* BOTÓN DE RESERVA FIJO / PRINCIPAL */}
      <div style={{ margin: '24px 0 40px 0' }}>
        <button 
          onClick={gestionarConfirmacionReserva} 
          disabled={!horaInicio || !horaFin} 
          style={{
            ...styles.botonReservar,
            backgroundColor: (horaInicio && horaFin) ? '#39FF14' : 'rgba(255,255,255,0.05)',
            color: (horaInicio && horaFin) ? '#0F0F10' : '#555',
            cursor: (horaInicio && horaFin) ? 'pointer' : 'not-allowed'
          }}
        >
          {(horaInicio && horaFin) 
            ? `Confirmar Reserva (${horaInicio} a ${horaFin} hs)` 
            : "Selecciona un Horario"
          }
        </button>
      </div>

      {/* SECCIÓN TIENDA / CANTINA */}
      <div style={styles.seccionTiendaWrapper}>
        <h3 style={styles.subtituloSeccion}>🛒 Extras para tu partido</h3>
        <p style={{ color: '#8E8E93', fontSize: '13px', margin: '0 0 16px 0' }}>Agrega palas o bebidas para retirar al llegar.</p>

        {listaProductos.length === 0 ? (
          <p style={styles.textoVacio}>No hay extras disponibles para este club.</p>
        ) : (
          <div style={styles.grillaTienda}>
            {listaProductos.map(p => {
              const agotado = p.stock <= 0;
              return (
                <div key={p.id} style={{ ...styles.tarjetaProducto, opacity: agotado ? 0.5 : 1 }}>
                  <div style={styles.infoProductoHorizontal}>
                    <div style={styles.iconoTienda}>{p.esAlquiler ? '🎾' : '🥤'}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={styles.nombreProducto}>{p.nombre}</h4>
                      <span style={{ 
                        ...styles.badgeTipo, 
                        color: p.esAlquiler ? '#00ccff' : '#8E8E93' 
                      }}>
                        {p.esAlquiler ? '🔄 Alquiler' : '🛒 Compra'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={styles.precioProducto}>${p.precio}</div>
                      <button 
                        disabled={agotado}
                        onClick={() => gestionarCompraProducto(p)}
                        style={{ 
                          ...styles.botonAccionTienda,
                          backgroundColor: agotado ? 'transparent' : 'rgba(57, 255, 20, 0.1)',
                          color: agotado ? '#555' : '#39FF14'
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

const styles = {
  contenedor: { 
    padding: '16px', 
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  botonVolver: { 
    backgroundColor: '#161618', 
    color: '#fff', 
    border: '1px solid rgba(255,255,255,0.05)', 
    cursor: 'pointer', 
    marginBottom: '16px', 
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerClub: { marginBottom: '24px' },
  tituloClub: { fontSize: '28px', margin: '0 0 6px 0', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  infoClub: { color: '#8E8E93', fontSize: '14px', margin: 0 },
  
  seccionContenedor: { marginBottom: '24px' },
  subtituloSeccion: { fontSize: '16px', color: '#fff', margin: '0 0 12px 0', fontWeight: '700' },
  ayudaTexto: { color: '#8E8E93', fontSize: '12px', margin: '-8px 0 12px 0' },

  scrollHorizontal: {
    display: 'flex',
    overflowX: 'auto',
    gap: '10px',
    paddingBottom: '8px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },

  // Píldoras de Cancha
  pildoraCancha: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    borderRadius: '16px',
    border: '1px solid',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Selector de Fechas
  tarjetaFecha: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '56px',
    height: '74px',
    borderRadius: '18px',
    cursor: 'pointer',
    gap: '6px'
  },
  nombreDiaTexto: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' },
  numeroDiaTexto: { fontSize: '18px', fontWeight: '800' },

  // Grilla de Horarios
  grillaHorarios: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
    gap: '8px',
  },
  botonSlot: {
    padding: '16px 8px',
    borderRadius: '14px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    transition: 'all 0.15s ease',
  },
  slotDisponible: {
    backgroundColor: '#161618',
    borderColor: 'rgba(255,255,255,0.03)',
    color: '#fff',
  },
  slotSeleccionado: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderColor: '#39FF14',
    color: '#39FF14',
  },
  slotOcupado: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderColor: 'transparent',
    color: '#3A3A3C',
    cursor: 'not-allowed',
  },
  slotHoraTexto: { fontSize: '14px', fontWeight: '700' },
  textoOcupadoLabel: { fontSize: '9px', fontWeight: '600', color: '#ff4d4d' },

  // Switch Partido Abierto
  tarjetaPartidoAbierto: { 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161618', 
    borderRadius: '20px', 
    padding: '16px 20px', 
    border: '1px solid rgba(255,255,255,0.03)',
    marginBottom: '16px'
  },
  textoPartidoAbierto: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  tituloPartidoAbierto: { color: '#fff', fontSize: '15px', fontWeight: '700' },
  descPartidoAbierto: { color: '#8E8E93', fontSize: '12px', lineHeight: '1.3' },
  checkboxPremium: { width: '20px', height: '20px', accentColor: '#39FF14', cursor: 'pointer' },

  botonReservar: { 
    width: '100%', 
    padding: '16px', 
    border: 'none', 
    borderRadius: '16px', 
    fontWeight: '800', 
    fontSize: '15px', 
    transition: 'all 0.2s ease' 
  },

  // Tienda Estilo Premium Horizontal
  seccionTiendaWrapper: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' },
  grillaTienda: { display: 'flex', flexDirection: 'column', gap: '10px' },
  tarjetaProducto: { backgroundColor: '#161618', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.02)', padding: '12px' },
  infoProductoHorizontal: { display: 'flex', alignItems: 'center', gap: '14px' },
  iconoTienda: { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyValue: 'center', fontSize: '20px', display: 'flex', justifyContent: 'center' },
  nombreProducto: { color: '#fff', fontSize: '14px', fontWeight: '700', margin: '0 0 2px 0' },
  badgeTipo: { fontSize: '11px', fontWeight: '500' },
  precioProducto: { color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '4px' },
  botonAccionTienda: { border: 'none', padding: '6px 12px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' },
  
  textoVacio: { color: '#8E8E93', fontSize: '13px' },
  estadoVacio: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' },
  spinner: { width: '28px', height: '28px', border: '3px solid rgba(57, 255, 20, 0.2)', borderTop: '3px solid #39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }
};

export default ReservarTurnoScreen;