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
                  backgroundColor: seleccionada ? 'rgba(57, 255, 20, 0.08)' : '#121214',
                  borderColor: seleccionada ? '#39FF14' : 'rgba(255, 255, 255, 0.05)',
                  color: seleccionada ? '#39FF14' : '#ffffff'
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
                  backgroundColor: esSeleccionado ? '#39FF14' : '#121214',
                  border: esSeleccionado ? '1px solid #39FF14' : '1px solid rgba(255, 255, 255, 0.04)',
                  boxShadow: esSeleccionado ? '0 8px 20px rgba(57, 255, 20, 0.2)' : 'none'
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
            backgroundColor: (horaInicio && horaFin) ? '#39FF14' : 'rgba(255, 255, 255, 0.04)',
            color: (horaInicio && horaFin) ? '#000000' : 'rgba(255, 255, 255, 0.2)',
            cursor: (horaInicio && horaFin) ? 'pointer' : 'not-allowed',
            boxShadow: (horaInicio && horaFin) ? '0 8px 24px rgba(57, 255, 20, 0.25)' : 'none'
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
                          backgroundColor: agotado ? 'transparent' : 'rgba(57, 255, 20, 0.08)',
                          color: agotado ? '#444446' : '#39FF14',
                          border: agotado ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(57, 255, 20, 0.15)'
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
    padding: '16px 20px', 
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  headerNavegacion: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center'
  },
  botonVolver: { 
    backgroundColor: '#121214', 
    color: '#ffffff', 
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    cursor: 'pointer', 
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  headerClub: { 
    marginBottom: '32px' 
  },
  tituloClub: { 
    fontSize: '30px', 
    margin: '0 0 6px 0', 
    fontWeight: '800', 
    color: '#ffffff', 
    letterSpacing: '-0.8px' 
  },
  infoClub: { 
    color: '#8E8E93', 
    fontSize: '14px', 
    margin: 0,
    letterSpacing: '-0.2px'
  },
  seccionContenedor: { 
    marginBottom: '28px' 
  },
  encabezadoPaso: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px'
  },
  numeroBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#8E8E93',
    fontSize: '11px',
    fontWeight: '700',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtituloSeccion: { 
    fontSize: '16px', 
    color: '#ffffff', 
    margin: 0, 
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  ayudaTexto: { 
    color: '#8E8E93', 
    fontSize: '13px', 
    margin: '-4px 0 16px 0',
    lineHeight: '1.4'
  },
  scrollHorizontal: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    paddingBottom: '8px',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  pildoraCancha: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 20px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  iconoPildora: {
    fontSize: '15px'
  },
  textoPildora: {
    fontWeight: '600',
    letterSpacing: '-0.2px'
  },
  tarjetaFecha: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    height: '80px',
    borderRadius: '22px',
    cursor: 'pointer',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  nombreDiaTexto: { 
    fontSize: '10px', 
    fontWeight: '700', 
    letterSpacing: '0.6px' 
  },
  numeroDiaTexto: { 
    fontSize: '20px', 
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  grillaHorarios: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: '10px'
  },
  botonSlot: {
    padding: '18px 8px',
    borderRadius: '18px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.15s ease'
  },
  slotDisponible: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255,255,255,0.03)',
    color: '#ffffff'
  },
  slotSeleccionado: {
    backgroundColor: 'rgba(57, 255, 20, 0.08)',
    borderColor: '#39FF14',
    color: '#39FF14'
  },
  slotOcupado: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderColor: 'transparent',
    color: '#3A3A3C',
    cursor: 'not-allowed'
  },
  slotHoraTexto: { 
    fontSize: '15px', 
    fontWeight: '700',
    letterSpacing: '-0.2px'
  },
  textoOcupadoLabel: { 
    fontSize: '9px', 
    fontWeight: '700', 
    color: '#FF453A',
    textTransform: 'uppercase',
    letterSpacing: '0.2px'
  },
  tarjetaPartidoAbierto: { 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121214', 
    borderRadius: '24px', 
    padding: '18px 22px', 
    border: '1px solid rgba(255,255,255,0.04)',
    marginBottom: '24px',
    gap: '16px'
  },
  textoPartidoAbierto: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '4px', 
    flex: 1 
  },
  tituloPartidoAbierto: { 
    color: '#ffffff', 
    fontSize: '15px', 
    fontWeight: '700',
    letterSpacing: '-0.2px'
  },
  descPartidoAbierto: { 
    color: '#8E8E93', 
    fontSize: '12px', 
    lineHeight: '1.4' 
  },
  switchContenedor: {
    display: 'flex',
    alignItems: 'center'
  },
  checkboxPremium: { 
    width: '22px', 
    height: '22px', 
    accentColor: '#39FF14', 
    cursor: 'pointer' 
  },
  bloqueBotonPrincipal: { 
    margin: '24px 0 40px 0' 
  },
  botonReservar: { 
    width: '100%', 
    padding: '18px', 
    border: 'none', 
    borderRadius: '24px', 
    fontWeight: '850', 
    fontSize: '15px', 
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px'
  },
  seccionTiendaWrapper: { 
    borderTop: '1px solid rgba(255,255,255,0.06)', 
    paddingTop: '28px',
    paddingBottom: '20px'
  },
  iconoTiendaSeccion: {
    fontSize: '16px'
  },
  ayudaTextoTienda: {
    color: '#8E8E93', 
    fontSize: '13px', 
    margin: '-4px 0 20px 0'
  },
  grillaTienda: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  tarjetaProducto: { 
    backgroundColor: '#121214', 
    borderRadius: '22px', 
    border: '1px solid rgba(255,255,255,0.04)', 
    padding: '14px 16px' 
  },
  infoProductoHorizontal: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px' 
  },
  iconoTienda: { 
    width: '46px', 
    height: '46px', 
    borderRadius: '14px', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '22px' 
  },
  cuerpoProducto: { 
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-start'
  },
  nombreProducto: { 
    color: '#ffffff', 
    fontSize: '15px', 
    fontWeight: '700', 
    margin: 0,
    letterSpacing: '-0.2px'
  },
  badgeTipo: { 
    fontSize: '10px', 
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  accionesProducto: { 
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px'
  },
  precioProducto: { 
    color: '#ffffff', 
    fontSize: '16px', 
    fontWeight: '800', 
    margin: 0,
    letterSpacing: '-0.3px'
  },
  botonAccionTienda: { 
    border: 'none', 
    padding: '8px 14px', 
    borderRadius: '12px', 
    fontWeight: '700', 
    fontSize: '12px', 
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  textoVacio: { 
    color: '#8E8E93', 
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px 0'
  },
  textoCargando: {
    color: '#8E8E93', 
    fontSize: '15px',
    marginTop: '12px'
  },
  textoError: {
    color: '#FF453A',
    fontSize: '15px',
    fontWeight: '600'
  },
  estadoVacioSpinner: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '120px 24px' 
  },
  estadoVacio: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '120px 24px' 
  },
  spinner: { 
    width: '32px', 
    height: '32px', 
    border: '3px solid rgba(57, 255, 20, 0.1)', 
    borderTop: '3px solid #39FF14', 
    borderRadius: '50%'
  }
};

export default ReservarTurnoScreen;