// src/screens/ReservarTurnoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

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

  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaHoy());
  
  // Guardarán el rango del bloque completo
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  
  const [esPartidoAbierto, setEsPartidoAbierto] = useState(false);

  // Generamos bloques de 1 hora fija para la grilla visual de botones
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

  // 🛠️ COMPROBACIÓN DINÁMICA: Revisa solapamientos con reservas existentes en la BD
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

  // 🔥 MANEJADOR DE SELECCIÓN MULTI-SLOT INTELIGENTE
  const seleccionarSlotHorario = (slot) => {
    if (!horaInicio) {
      // Caso 1: No hay nada seleccionado, marcamos el bloque de 1 hora inicial
      setHoraInicio(slot.inicio);
      setHoraFin(slot.fin);
    } else {
      // Caso 2: Ya había un bloque seleccionado previamente
      const [hClickIn] = slot.inicio.split(':').map(Number);
      const [hSelIn] = horaInicio.split(':').map(Number);

      if (hClickIn >= hSelIn) {
        // Si el click es posterior o igual, intentamos extender el rango hacia adelante
        // Validamos que no existan reservas ajenas ocupando el medio del nuevo rango extendido
        const hayBloqueadoEnMedio = comprobarSlotOcupado(horaInicio, slot.fin);
        
        if (hayBloqueadoEnMedio) {
          // Si hay un turno ocupado en el medio, no podemos extender. Reseteeamos la selección a este nuevo slot
          setHoraInicio(slot.inicio);
          setHoraFin(slot.fin);
        } else {
          // Rango limpio, extendemos el horario de finalización con éxito
          setHoraFin(slot.fin);
        }
      } else {
        // Caso 3: El click es anterior al inicio actual, reseteamos el bloque comenzando en este slot
        setHoraInicio(slot.inicio);
        setHoraFin(slot.fin);
      }
    }
  };

 const gestionarConfirmacionReserva = async () => {
    if (!horaInicio || !horaFin) return;
    try {
      // 🔥 CAMBIO REST: Enviamos POST a la colección de turnos directamente
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
      // 🔥 CAMBIO 1: Usamos producto.id en lugar de id (complejo)
      // 🔥 CAMBIO 2: Añadimos un turnoId temporal (o el que corresponda si ya hay reserva)
      // Nota: Si el usuario DEBE reservar primero, esta lógica debería cambiar
      // para habilitarse solo DESPUÉS de tener un turnoId.
      await API.post(`/productos/${producto.id}/ventas`, { 
        cantidad: 1, // Cambiado a 1 asumiendo que compras 1 por click, ajusta si es necesario
        turnoId: "turno_temporal_pendiente_de_reserva" // O ajusta el backend para que sea opcional
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
      alert("Error al procesar la operación. Verifica la consola.");
    }
  };

  if (loading) return (
    <div style={styles.estadoVacio}>
      <div style={styles.spinner}></div>
      <p>Cargando disponibilidad...</p>
    </div>
  );
  
  if (error || !complejo) return (
    <div style={styles.estadoVacio}>
      <p>{error || "Complejo no encontrado"}</p>
    </div>
  );

  const listaProductos = complejo.productos || [];

  return (
    <div style={styles.contenedor}>
      <button onClick={() => navigate('/turnos')} style={styles.botonVolver}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver a buscar complejos
      </button>

      <div style={styles.headerClub}>
        <h1 style={styles.tituloClub}>{complejo.nombre}</h1>
        <p style={styles.infoClub}>
          <span style={styles.iconoGris}>📍</span> {complejo.direccion}
        </p>
      </div>

      <div style={styles.panelReserva}>
        {/* COLUMNA 1: CANCHAS */}
        <div style={styles.columna}>
          <h3 style={styles.subtitulo}>1. Seleccioná la Cancha</h3>
          <div style={styles.listaCanchas}>
            {complejo.canchas?.map((cancha) => {
              const seleccionada = canchaSeleccionada?.id === cancha.id;
              return (
                <div 
                  key={cancha.id} 
                  style={{
                    ...styles.tarjetaCancha, 
                    borderColor: seleccionada ? '#00ff66' : 'rgba(255,255,255,0.05)',
                    backgroundColor: seleccionada ? 'rgba(0, 255, 102, 0.05)' : '#121212',
                  }} 
                  onClick={() => {
                    setCanchaSeleccionada(cancha);
                    setHoraInicio(""); 
                    setHoraFin("");
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{...styles.iconoCancha, opacity: seleccionada ? 1 : 0.5}}>🎾</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', color: seleccionada ? '#fff' : '#aaa' }}>{cancha.nombre}</h4>
                    </div>
                  </div>
                  {seleccionada && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 2: HORARIOS CON EXTENSIÓN MULTIPLE */}
        <div style={styles.columna}>
          <h3 style={styles.subtitulo}>2. Fecha y Horario</h3>
          
          <div style={styles.grupoInput}>
            <label style={styles.labelInput}>Fecha del Partido</label>
            <input 
              type="date" 
              value={fechaSeleccionada} 
              min={obtenerFechaHoy()} 
              onChange={(e) => {
                setFechaSeleccionada(e.target.value);
                setHoraInicio(""); 
                setHoraFin("");
              }} 
              style={styles.inputPicker} 
            />
          </div>

          <div style={{ marginTop: '12px' }}>
            <label style={styles.labelInput}>Horarios Disponibles (Hacé click para extender las horas)</label>
            <div style={styles.grillaHorarios}>
              {generarSlotsHorarios().map(slot => {
                const ocupado = comprobarSlotOcupado(slot.inicio, slot.fin);
                
                // Un slot se ilumina si está contenido dentro del rango seleccionado
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
                    {slot.inicio}
                    {ocupado && <span style={styles.textoOcupadoLabel}>Ocupado</span>}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* CHECKBOX PARTIDO ABIERTO */}
          <div style={styles.tarjetaPartidoAbierto}>
            <label htmlFor="partidoAbierto" style={styles.labelPartidoAbierto}>
              <div style={styles.textoPartidoAbierto}>
                <span style={styles.tituloPartidoAbierto}>Crear "Partido Abierto"</span>
                <span style={styles.descPartidoAbierto}>Hace público tu turno para que otros jugadores se sumen.</span>
              </div>
              <input
                type="checkbox"
                id="partidoAbierto"
                checked={esPartidoAbierto}
                onChange={(e) => setEsPartidoAbierto(e.target.checked)}
                style={styles.checkboxPremium}
              />
            </label>
          </div>

          <button 
            onClick={gestionarConfirmacionReserva} 
            disabled={!horaInicio || !horaFin} 
            style={{
              ...styles.botonReservar,
              opacity: (horaInicio && horaFin) ? 1 : 0.4,
              cursor: (horaInicio && horaFin) ? 'pointer' : 'not-allowed'
            }}
          >
            {(horaInicio && horaFin) 
              ? `Reservar de ${horaInicio} a ${horaFin} hs` 
              : "Seleccioná un Horario"
            }
          </button>
        </div>
      </div>

      {/* SECCIÓN DE TIENDA Y CANTINA INTEGRADA */}
      <div style={styles.seccionTiendaWrapper}>
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
          <h3 style={styles.subtituloTienda}>🛒 Extras: Tienda y Cantina</h3>
          <p style={{ color: '#8A8A8A', fontSize: '14px', margin: 0 }}>
            ¿Te falta paleta o querés dejar paga la bebida? Agregalo a tu turno.
          </p>
        </div>

        {listaProductos.length === 0 ? (
          <div style={styles.tiendaEstadoVacio}>
            <span style={{ fontSize: '40px', marginBottom: '16px', display: 'block' }}>🎒</span>
            <h4 style={{ margin: '0 0 8px 0', color: '#EAEAEA' }}>Sin productos por ahora</h4>
            <p style={{ color: '#8A8A8A', margin: 0, fontSize: '14px' }}>Este club no tiene cargados productos para alquiler o venta.</p>
          </div>
        ) : (
          <div style={styles.grillaTienda}>
            {listaProductos.map(p => {
              const agotado = p.stock <= 0;
              return (
                <div key={p.id} style={{ ...styles.tarjetaProducto, opacity: agotado ? 0.6 : 1 }}>
                  <div style={styles.imagenPlaceholder}>
                    {p.esAlquiler ? '🎾' : '🥤'}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span style={{ 
                        ...styles.badgeTipo, 
                        backgroundColor: p.esAlquiler ? 'rgba(0, 204, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
                        color: p.esAlquiler ? '#00ccff' : '#aaa' 
                      }}>
                        {p.esAlquiler ? '🔄 ALQUILER' : '🛒 VENTA'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.infoProductoContainer}>
                    <h4 style={styles.nombreProducto}>{p.nombre}</h4>
                    <div style={styles.precioProducto}>${p.precio}</div>
                    
                    <div style={styles.stockContenedor}>
                      <span style={{ 
                        ...styles.badgeStock, 
                        backgroundColor: agotado ? 'rgba(255, 51, 51, 0.1)' : 'rgba(0, 255, 102, 0.1)', 
                        color: agotado ? '#ff4d4d' : '#00ff66' 
                      }}>
                        {agotado ? 'Agotado' : `${p.stock} u.`}
                      </span>
                    </div>

                    <button 
                      disabled={agotado}
                      onClick={() => gestionarCompraProducto(p)}
                      style={{ 
                        ...styles.botonAccion, 
                        backgroundColor: agotado ? '#1A1A1A' : 'rgba(0, 255, 102, 0.1)', 
                        color: agotado ? '#555' : '#00ff66',
                        cursor: agotado ? 'not-allowed' : 'pointer',
                        border: agotado ? '1px solid transparent' : '1px solid rgba(0, 255, 102, 0.3)'
                      }}
                    >
                      {agotado ? 'Sin stock' : (p.esAlquiler ? 'Alquilar' : 'Comprar')}
                    </button>
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
  contenedor: { width: '100%', boxSizing: 'border-box' },
  botonVolver: { 
    display: 'flex', alignItems: 'center', backgroundColor: 'transparent', 
    color: '#8A8A8A', border: 'none', cursor: 'pointer', marginBottom: '24px', 
    fontSize: '14px', fontWeight: '600', padding: 0, transition: 'color 0.2s' 
  },
  headerClub: { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px' },
  tituloClub: { fontSize: '36px', margin: '0 0 8px 0', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' },
  infoClub: { color: '#8A8A8A', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  iconoGris: { opacity: 0.7 },
  
  panelReserva: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
  columna: { flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' },
  subtitulo: { fontSize: '18px', color: '#fff', margin: '0 0 8px 0', fontWeight: '700' },
  
  listaCanchas: { display: 'flex', flexDirection: 'column', gap: '12px' },
  tarjetaCancha: { 
    padding: '16px 20px', borderRadius: '12px', border: '1px solid', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.2s ease'
  },
  iconoCancha: { fontSize: '20px' },
  
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, marginBottom: '8px' },
  labelInput: { fontSize: '13px', color: '#8A8A8A', fontWeight: '600', marginBottom: '6px', display: 'block' },
  inputPicker: { 
    backgroundColor: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', 
    padding: '14px', borderRadius: '10px', width: '100%', fontSize: '15px', outline: 'none',
    boxSizing: 'border-box'
  },

  grillaHorarios: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
    gap: '10px',
    marginTop: '6px'
  },
  botonSlot: {
    padding: '14px 10px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
  },
  slotDisponible: {
    backgroundColor: '#141414',
    borderColor: 'rgba(255,255,255,0.08)',
    color: '#ccc',
  },
  slotSeleccionado: {
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    borderColor: '#00ff66',
    color: '#00ff66',
  },
  slotOcupado: {
    backgroundColor: '#1e1e1e',
    borderColor: 'transparent',
    color: '#555',
    cursor: 'not-allowed',
    opacity: 0.4
  },
  textoOcupadoLabel: {
    fontSize: '9px',
    fontWeight: '600',
    color: '#ff4d4d',
    textTransform: 'uppercase'
  },

  tarjetaPartidoAbierto: { 
    backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.05)', 
    borderRadius: '12px', padding: '16px', marginTop: '8px', marginBottom: '8px' 
  },
  labelPartidoAbierto: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '16px' 
  },
  textoPartidoAbierto: { display: 'flex', flexDirection: 'column', gap: '4px' },
  tituloPartidoAbierto: { color: '#fff', fontSize: '15px', fontWeight: '700' },
  descPartidoAbierto: { color: '#8A8A8A', fontSize: '12px', lineHeight: '1.4' },
  checkboxPremium: { width: '22px', height: '22px', accentColor: '#00ff66', cursor: 'pointer' },

  botonReservar: { 
    width: '100%', padding: '16px', backgroundColor: '#00ff66', color: '#000', 
    border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', 
    transition: 'all 0.2s ease' 
  },

  seccionTiendaWrapper: { marginTop: '48px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' },
  subtituloTienda: { fontSize: '20px', color: '#fff', margin: '0 0 4px 0', fontWeight: '700' },
  grillaTienda: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '16px' },
  tarjetaProducto: { backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s' },
  imagenPlaceholder: { height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', opacity: 0.8, backgroundColor: '#181818', position: 'relative' },
  badgeTipo: { fontSize: '9px', fontWeight: '800', padding: '4px 6px', borderRadius: '6px', letterSpacing: '0.5px' },
  infoProductoContainer: { padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 },
  nombreProducto: { color: '#fff', fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.3px' },
  precioProducto: { color: '#EAEAEA', fontSize: '18px', fontWeight: '800', marginBottom: '12px' },
  stockContenedor: { marginTop: 'auto', marginBottom: '16px' },
  badgeStock: { fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '20px' },
  botonAccion: { width: '100%', padding: '12px', border: 'none', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s', borderRadius: '8px' },
  tiendaEstadoVacio: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#8A8A8A', textAlign: 'center', backgroundColor: '#121212', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' },
  
  estadoVacio: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8A8A8A', fontSize: '16px' },
  spinner: { width: '30px', height: '30px', border: '3px solid rgba(0,255,102,0.2)', borderTop: '3px solid #00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }
};

export default ReservarTurnoScreen;