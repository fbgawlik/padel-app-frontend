// src/screens/GestionComplejo.jsx
import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GestionComplejo = () => {
  const { usuario } = useContext(AuthContext);
  const [complejo, setComplejo] = useState(null); 
  const [canchas, setCanchas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [necesitaCrear, setNecesitaCrear] = useState(false);
  const [formNuevoComplejo, setFormNuevoComplejo] = useState({ nombre: '', direccion: '', telefono: '' });
  const [archivoImagen, setArchivoImagen] = useState(null); 
  const [archivoImagenEdit, setArchivoImagenEdit] = useState(null);

  const [formComplejo, setFormComplejo] = useState({ nombre: '', direccion: '', telefono: '' });
  const [formCancha, setFormCancha] = useState({ nombre: '', tipoPiso: 'Césped Sintético', tipoPared: 'Blindex', techada: true });
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', stock: '0', esAlquiler: false });

  // Pestaña activa para la subgestión dentro del panel
  const [subTabActiva, setSubTabActiva] = useState('canchas');

  // ✨ NUEVO: Estado para saber qué métrica clickeó el usuario (ej: 'reservas', 'ocupacion', etc.)
  const [metricaExpandida, setMetricaExpandida] = useState(null);

  // ✨ NUEVO: Mock de datos de reservas de ejemplo vinculadas a las canchas para el desglose interactivo
  const [reservasHoy, setReservasHoy] = useState([
    { id: 1, canchaNombre: 'Cancha 1', hora: '18:00', cliente: 'Lucas Perez', estado: 'Confirmado' },
    { id: 2, canchaNombre: 'Cancha 1', hora: '20:00', cliente: 'Martín Gómez', estado: 'Confirmado' },
    { id: 3, canchaNombre: 'Cancha 2', hora: '19:00', cliente: 'Juan Rodriguez', estado: 'Pendiente' },
    { id: 4, canchaNombre: 'Cancha 2', hora: '21:00', cliente: 'Gonzalo Fernández', estado: 'Confirmado' },
  ]);

  const cargarProductosTienda = async (clubId) => {
    try {
      const res = await API.get(`/productos?complejoId=${clubId}`);
      setProductos(res.data);
    } catch (err) {
      console.error("Error al traer productos:", err);
    }
  };

  useEffect(() => {
    const cargarDatosClub = async () => {
      if (!usuario?.id) return;
      
      try {
        setLoading(true);
        const res = await API.get('/complejos'); 
        const miClub = res.data.find(c => c.administradorId === usuario.id);
        
        if (miClub) {
          setComplejo(miClub);
          setFormComplejo({ nombre: miClub.nombre, direccion: miClub.direccion, telefono: miClub.telefono || '' });
          
          const resCanchas = await API.get('/canchas');
          const filtradas = resCanchas.data.filter(c => c.complejoId === miClub.id);
          setCanchas(filtradas);

          await cargarProductosTienda(miClub.id);
        } else {
          setNecesitaCrear(true);
        }
      } catch (err) {
        setError('No se pudieron cargar los datos del sistema.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatosClub();
  }, [usuario]);

  const gestionarCrearMiComplejo = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', formNuevoComplejo.nombre);
      formData.append('direccion', formNuevoComplejo.direccion);
      formData.append('telefono', formNuevoComplejo.telefono);
      if (archivoImagen) {
        formData.append('imagen', archivoImagen);
      }

      const res = await API.post('/complejos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("¡Complejo registrado con éxito!");
      setComplejo(res.data.complejo);
      setFormComplejo({ nombre: res.data.complejo.nombre, direccion: res.data.complejo.direccion, telefono: res.data.complejo.telefono || '' });
      setNecesitaCrear(false); 
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear el complejo.");
    }
  };

  const gestionarActualizarComplejo = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', formComplejo.nombre);
      formData.append('direccion', formComplejo.direccion);
      formData.append('telefono', formComplejo.telefono);
      if (archivoImagenEdit) {
        formData.append('imagen', archivoImagenEdit);
      }

      const res = await API.put('/complejos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("¡Datos del complejo actualizados!");
      setComplejo(res.data.complejo);
      setArchivoImagenEdit(null);
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar los datos.");
    }
  };

  const gestionarCrearCancha = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/canchas', formCancha);
      alert(res.data.message || "Cancha añadida.");
      setCanchas([...canchas, res.data.cancha]);
      setFormCancha({ nombre: '', tipoPiso: 'Césped Sintético', tipoPared: 'Blindex', techada: true });
    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar cancha.");
    }
  };

  const gestionarCrearProducto = async (e) => {
    e.preventDefault();
    if (!formProducto.nombre || !formProducto.precio) return alert("Ingresá nombre y precio.");

    try {
      const res = await API.post('/productos', formProducto);
      setProductos([...productos, res.data.producto]);
      setFormProducto({ nombre: '', precio: '', stock: '0', esAlquiler: false });
    } catch (err) {
      alert(err.response?.data?.error || "Error registrando producto.");
    }
  };

  const gestionarEliminarProducto = async (productoId) => {
    if (!window.confirm("¿Seguro que querés eliminar esto?")) return;
    try {
      await API.delete(`/productos/${productoId}`);
      setProductos(productos.filter(p => p.id !== productoId));
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar producto.");
    }
  };

  if (loading) {
    return (
      <div style={styles.contenedorLoading}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (necesitaCrear) {
    return (
      <div style={styles.contenedorBase}>
        <div style={styles.tarjetaCentralForm}>
          <h2 style={{ color: '#39FF14', margin: '0 0 10px 0', fontWeight: '800' }}>¡Bienvenido, Administrador!</h2>
          <p style={{ color: '#A0A0A5', marginBottom: '24px', fontSize: '14px', lineHeight: '1.4' }}>Para comenzar a recibir reservas, primero registra los datos de tu complejo.</p>
          <form onSubmit={gestionarCrearMiComplejo} style={styles.formulario}>
            <input 
              type="text" placeholder="Nombre Comercial del Complejo" required 
              value={formNuevoComplejo.nombre} onChange={(e) => setFormNuevoComplejo({...formNuevoComplejo, nombre: e.target.value})} 
              style={styles.input} 
            />
            <input 
              type="text" placeholder="Dirección Física (Ej: Av. San Martín 1500)" required 
              value={formNuevoComplejo.direccion} onChange={(e) => setFormNuevoComplejo({...formNuevoComplejo, direccion: e.target.value})} 
              style={styles.input} 
            />
            <input 
              type="text" placeholder="Teléfono de Contacto" 
              value={formNuevoComplejo.telefono} onChange={(e) => setFormNuevoComplejo({...formNuevoComplejo, telefono: e.target.value})} 
              style={styles.input} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#8E8E93', fontSize: '12px', fontWeight: '600' }}>Logo o Foto de Portada</label>
              <input type="file" accept="image/*" onChange={(e) => setArchivoImagen(e.target.files[0])} style={styles.input} />
            </div>
            <button type="submit" style={styles.botonPrincipal}>Registrar Complejo</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.contenedorBase}>
      <div style={styles.panelAnchoMaximo}>
        
        {/* HEADER DE CONTROL ESTILO APP */}
        <div style={styles.headerClubContainer}>
          <div style={styles.headerClubLeft}>
            <div style={styles.avatarMiniClub}>🏢</div>
            <div>
              <h1 style={styles.tituloClubName}>{complejo?.nombre || 'Mi Complejo'}</h1>
              <p style={styles.subtituloUbicacion}>📍 {complejo?.direccion}</p>
            </div>
          </div>
          <button style={styles.btnAjustesRedondo}>⚙️</button>
        </div>

        {error && <div style={styles.alertaError}>{error}</div>}

        {/* 📊 TARJETAS DE MÉTRICAS RÁPIDAS (Interactivas y enlazadas al estado) */}
        <div style={styles.grillaMetricas}>
          
          <div 
            style={{
              ...styles.tarjetaMetrica,
              ...(metricaExpandida === 'reservas' ? styles.tarjetaMetricaActiva : {})
            }}
            onClick={() => setMetricaExpandida(metricaExpandida === 'reservas' ? null : 'reservas')}
          >
            <span style={styles.metricaLabel}>Reservas Hoy</span>
            <div style={styles.metricaFilaValor}>
              <span style={styles.metricaNumero}>24</span>
              <span style={{color: '#39FF14', fontSize: '11px', fontWeight: '700'}}>▲ 12%</span>
            </div>
          </div>

          <div 
            style={{
              ...styles.tarjetaMetrica,
              ...(metricaExpandida === 'ocupacion' ? styles.tarjetaMetricaActiva : {})
            }}
            onClick={() => setMetricaExpandida(metricaExpandida === 'ocupacion' ? null : 'ocupacion')}
          >
            <span style={styles.metricaLabel}>Canchas Ocupadas</span>
            <div style={styles.metricaFilaValor}>
              <span style={styles.metricaNumero}>{canchas.length > 0 ? `${Math.ceil(canchas.length / 2)}/${canchas.length}` : '0/0'}</span>
            </div>
          </div>

          <div style={styles.tarjetaMetrica}>
            <span style={styles.metricaLabel}>Ventas Cantina</span>
            <div style={styles.metricaFilaValor}>
              <span style={{...styles.metricaNumero, color: '#39FF14'}}>$14.2K</span>
            </div>
          </div>

          <div style={styles.tarjetaMetrica}>
            <span style={styles.metricaLabel}>Stock Bajo</span>
            <div style={styles.metricaFilaValor}>
              <span style={styles.metricaNumero}>{productos.filter(p => p.stock <= 3).length}</span>
              <div style={styles.badgeAlertaMinitab}>Alerta</div>
            </div>
          </div>
        </div>

        {/* ✨ NUEVO: DESGLOSE INLINE DINÁMICO DE MÉTRICAS */}
        {metricaExpandida === 'reservas' && (
          <div style={styles.contenedorDesgloseMetrica}>
            <div style={styles.headerDesglose}>
              <h3 style={styles.tituloDesglose}>📅 Cronograma de Reservas (Hoy)</h3>
              <button onClick={() => setMetricaExpandida(null)} style={styles.btnCerrarDesglose}>✕</button>
            </div>
            
            {canchas.length === 0 ? (
              // Fallback por si todavía no hay canchas guardadas en base de datos
              <div>
                <div style={styles.subtituloCanchaDesglose}>🎾 Cancha de Ejemplo</div>
                <div style={styles.itemReservaDesglose}>
                  <span style={styles.horaReserva}>19:00 hs</span>
                  <span style={styles.clienteReserva}>Lucas Pérez</span>
                  <span style={{...styles.badgeEstadoReserva, color: '#39FF14', backgroundColor: 'rgba(57, 255, 20, 0.1)'}}>Confirmado</span>
                </div>
              </div>
            ) : (
              canchas.map(cancha => (
                <div key={cancha.id} style={{ marginBottom: '14px' }}>
                  <div style={styles.subtituloCanchaDesglose}>🎾 {cancha.nombre}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Filtramos el mock o datos de reserva vinculándolos por consistencia visual */}
                    {reservasHoy.filter(r => r.canchaNombre === 'Cancha 1' || r.canchaNombre === cancha.nombre).slice(0, 2).map((r, index) => (
                      <div key={index} style={styles.itemReservaDesglose}>
                        <span style={styles.horaReserva}>{index === 0 ? '18:00' : '20:30'} hs</span>
                        <span style={styles.clienteReserva}>{index === 0 ? 'Matias Almada' : 'Facundo Gomez'}</span>
                        <span style={{
                          ...styles.badgeEstadoReserva,
                          color: index === 0 ? '#39FF14' : '#FFD60A',
                          backgroundColor: index === 0 ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 214, 10, 0.1)'
                        }}>{index === 0 ? 'Confirmado' : 'Pendiente'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {metricaExpandida === 'ocupacion' && (
          <div style={styles.contenedorDesgloseMetrica}>
            <div style={styles.headerDesglose}>
              <h3 style={styles.tituloDesglose}>📊 Estado de Ocupación en Tiempo Real</h3>
              <button onClick={() => setMetricaExpandida(null)} style={styles.btnCerrarDesglose}>✕</button>
            </div>
            {canchas.length === 0 ? (
              <p style={styles.textoVacioDesglose}>No hay canchas dadas de alta para evaluar ocupación.</p>
            ) : (
              canchas.map((c, idx) => (
                <div key={c.id} style={{...styles.itemReservaDesglose, marginTop: idx > 0 ? '6px' : '0px'}}>
                  <span style={styles.clienteReserva}>{idx % 2 === 0 ? '🟢' : '⚪'} {c.nombre} ({c.tipoPiso})</span>
                  <span style={{
                    ...styles.badgeEstadoReserva, 
                    color: idx % 2 === 0 ? '#FF453A' : '#39FF14', 
                    backgroundColor: idx % 2 === 0 ? 'rgba(255,69,58,0.1)' : 'rgba(57,255,20,0.1)'
                  }}>
                    {idx % 2 === 0 ? 'OCUPADA' : 'LIBRE'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* SELECTOR DE SUBGESTIONES (TABS) */}
        <div style={styles.barraTabsNavegacion}>
          <button 
            style={subTabActiva === 'canchas' ? styles.tabActivo : styles.tabInactivo} 
            onClick={() => setSubTabActiva('canchas')}
          >
            🎾 Canchas
          </button>
          <button 
            style={subTabActiva === 'productos' ? styles.tabActivo : styles.tabInactivo} 
            onClick={() => setSubTabActiva('productos')}
          >
            🍺 Cantina & Alquiler
          </button>
          <button 
            style={subTabActiva === 'perfil' ? styles.tabActivo : styles.tabInactivo} 
            onClick={() => setSubTabActiva('perfil')}
          >
            📝 Datos Club
          </button>
        </div>

        {/* CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
        <div style={styles.bloqueContenidoDinamico}>
          
          {/* TAB 1: CANCHAS */}
          {subTabActiva === 'canchas' && (
            <div style={styles.layoutSeccionInterna}>
              <div style={styles.tarjetaFormularioInterno}>
                <h3 style={styles.tituloSeccionMini}>Agregar Nueva Cancha</h3>
                <form onSubmit={gestionarCrearCancha} style={styles.formulario}>
                  <input 
                    type="text" placeholder="Ej: Cancha Central Blindex" value={formCancha.nombre}
                    onChange={(e) => setFormCancha({ ...formCancha, nombre: e.target.value })} style={styles.input} required
                  />
                  <div style={styles.filaInputsMitad}>
                    <select value={formCancha.tipoPiso} onChange={(e) => setFormCancha({ ...formCancha, tipoPiso: e.target.value })} style={styles.selectInput}>
                      <option value="Césped Sintético">Césped Sintético</option>
                      <option value="Cemento / Quick">Cemento / Quick</option>
                    </select>
                    <select value={formCancha.tipoPared} onChange={(e) => setFormCancha({ ...formCancha, tipoPared: e.target.value })} style={styles.selectInput}>
                      <option value="Blindex">Blindex</option>
                      <option value="Muro">Muro (Cemento)</option>
                      <option value="Panorámica">Panorámica</option>
                    </select>
                  </div>
                  <label style={styles.checkboxLabelContainer}>
                    <input type="checkbox" checked={formCancha.techada} onChange={(e) => setFormCancha({ ...formCancha, techada: e.target.checked })} style={styles.checkboxInput} />
                    <span>¿Cancha Cubierta / Techada?</span>
                  </label>
                  <button type="submit" style={styles.botonPrincipal}>Dar de Alta</button>
                </form>
              </div>

              <div style={styles.tarjetaListaDatos}>
                <h3 style={styles.tituloSeccionMini}>Canchas Registradas ({canchas.length})</h3>
                <div style={styles.scrollerListaInterna}>
                  {canchas.length === 0 ? (
                    <p style={styles.textoListaVacia}>No hay canchas registradas.</p>
                  ) : (
                    canchas.map(c => (
                      <div key={c.id} style={styles.itemFilaClub}>
                        <div>
                          <div style={styles.nombreItemLista}>{c.nombre}</div>
                          <div style={styles.detalleItemLista}>{c.tipoPiso} • {c.tipoPared} • {c.techada ? '🧱 Techada' : '☀️ Descubierta'}</div>
                        </div>
                        <span style={styles.badgeEstadoActivo}>DISPONIBLE</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIENDA / CANTINA */}
          {subTabActiva === 'productos' && (
            <div style={styles.layoutSeccionInterna}>
              <div style={styles.tarjetaFormularioInterno}>
                <h3 style={styles.tituloSeccionMini}>Alta de Artículo / Alquiler</h3>
                <form onSubmit={gestionarCrearProducto} style={styles.formulario}>
                  <input 
                    type="text" placeholder="Nombre (Ej: Pala Nox AT10 o Agua 500ml)" value={formProducto.nombre}
                    onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })} style={styles.input} required
                  />
                  <div style={styles.filaInputsMitad}>
                    <input type="number" placeholder="Precio ($)" value={formProducto.precio} onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })} style={styles.input} required min="0" />
                    <input type="number" placeholder="Stock" value={formProducto.stock} onChange={(e) => setFormProducto({ ...formProducto, stock: e.target.value })} style={styles.input} min="0" />
                  </div>
                  <label style={styles.checkboxLabelContainer}>
                    <input type="checkbox" checked={formProducto.esAlquiler} onChange={(e) => setFormProducto({ ...formProducto, esAlquiler: e.target.checked })} style={styles.checkboxInputBlue} />
                    <span>¿Es artículo de Alquiler?</span>
                  </label>
                  <button type="submit" style={{ ...styles.botonPrincipal, backgroundColor: '#00ccff', color: '#000' }}>Registrar</button>
                </form>
              </div>

              <div style={styles.tarjetaListaDatos}>
                <h3 style={styles.tituloSeccionMini}>Inventario ({productos.length})</h3>
                <div style={styles.scrollerListaInterna}>
                  {productos.length === 0 ? (
                    <p style={styles.textoListaVacia}>No hay artículos cargados.</p>
                  ) : (
                    productos.map(p => (
                      <div key={p.id} style={styles.itemFilaClub}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.nombreItemLista}>{p.nombre}</span>
                            <span style={{
                              ...styles.badgeTipoProducto,
                              backgroundColor: p.esAlquiler ? 'rgba(0, 204, 255, 0.1)' : 'rgba(57, 255, 20, 0.1)',
                              color: p.esAlquiler ? '#00ccff' : '#39FF14'
                            }}>{p.esAlquiler ? 'Alquiler' : 'Venta'}</span>
                          </div>
                          <div style={styles.detalleItemLista}>Precio: ${p.precio} | Stock: <span style={{ color: p.stock <= 3 ? '#FF453A' : '#E5E5EA' }}>{p.stock} u.</span></div>
                        </div>
                        <button onClick={() => gestionarEliminarProducto(p.id)} style={styles.btnEliminarIcono}>🗑️</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATOS DEL CLUB */}
          {subTabActiva === 'perfil' && (
            <div style={styles.tarjetaFormularioInternoCompleto}>
              <h3 style={styles.tituloSeccionMini}>Editar Información del Complejo</h3>
              <form onSubmit={gestionarActualizarComplejo} style={styles.formulario}>
                <div style={styles.filaInputsMitad}>
                  <input type="text" placeholder="Nombre Complejo" required value={formComplejo.nombre} onChange={(e) => setFormComplejo({ ...formComplejo, nombre: e.target.value })} style={styles.input} />
                  <input type="text" placeholder="Teléfono" required value={formComplejo.telefono} onChange={(e) => setFormComplejo({ ...formComplejo, telefono: e.target.value })} style={styles.input} />
                </div>
                <input type="text" placeholder="Dirección" required value={formComplejo.direccion} onChange={(e) => setFormComplejo({ ...formComplejo, direccion: e.target.value })} style={styles.input} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#8E8E93', fontSize: '12px' }}>Cambiar Imagen de Portada</label>
                  <input type="file" accept="image/*" onChange={(e) => setArchivoImagenEdit(e.target.files[0])} style={styles.input} />
                </div>
                <button type="submit" style={styles.botonPrincipal}>Guardar Cambios</button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// ESTILOS DASHBOARD PRO DARK PREMIUM UNIFICADOS Y AMPLIADOS
const styles = {
  contenedorBase: {
    width: '100%',
    color: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0C0C0E',
    padding: '16px'
  },
  panelAnchoMaximo: {
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column'
  },
  headerClubContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  headerClubLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  avatarMiniClub: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#141416',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  tituloClubName: {
    fontSize: '18px',
    fontWeight: '800',
    margin: 0,
    color: '#FFFFFF'
  },
  subtituloUbicacion: {
    fontSize: '12px',
    color: '#8E8E93',
    margin: '2px 0 0 0'
  },
  btnAjustesRedondo: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#141416',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    color: '#FFFFFF',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  grillaMetricas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  tarjetaMetrica: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tarjetaMetricaActiva: {
    border: '1px solid #39FF14',
    backgroundColor: '#19191C'
  },
  metricaLabel: {
    fontSize: '11px',
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  metricaFilaValor: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: '8px'
  },
  metricaNumero: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#FFFFFF'
  },
  badgeAlertaMinitab: {
    fontSize: '9px',
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    color: '#FF453A',
    padding: '2px 6px',
    borderRadius: '6px',
    fontWeight: '700'
  },
  
  // ESTILOS DE DESGLOSE PREMIUM INLINE POP-IN
  contenedorDesgloseMetrica: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px'
  },
  headerDesglose: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '8px'
  },
  tituloDesglose: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#39FF14',
    margin: 0
  },
  btnCerrarDesglose: {
    background: 'none',
    border: 'none',
    color: '#8E8E93',
    fontSize: '14px',
    cursor: 'pointer'
  },
  subtituloCanchaDesglose: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '6px',
    paddingLeft: '2px'
  },
  itemReservaDesglose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    padding: '10px 12px',
    borderRadius: '10px',
    fontSize: '12px'
  },
  horaReserva: {
    fontWeight: '700',
    color: '#39FF14',
    width: '55px'
  },
  clienteReserva: {
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500'
  },
  badgeEstadoReserva: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  textoVacioDesglose: {
    fontSize: '11px',
    color: '#636366',
    fontStyle: 'italic',
    margin: '2px 0 6px 0'
  },

  barraTabsNavegacion: {
    display: 'flex',
    backgroundColor: '#141416',
    padding: '4px',
    borderRadius: '12px',
    gap: '4px',
    marginBottom: '16px'
  },
  tabActivo: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 4px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  tabInactivo: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#8E8E93',
    border: 'none',
    padding: '10px 4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  bloqueContenidoDinamico: {
    width: '100%'
  },
  layoutSeccionInterna: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  tarjetaFormularioInterno: {
    backgroundColor: '#141416',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  tarjetaFormularioInternoCompleto: {
    backgroundColor: '#141416',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  tarjetaListaDatos: {
    backgroundColor: '#141416',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.04)'
  },
  tituloSeccionMini: {
    fontSize: '14px',
    fontWeight: '700',
    margin: '0 0 14px 0',
    color: '#E5E5EA'
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '12px',
    color: '#FFFFFF',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  filaInputsMitad: {
    display: 'flex',
    gap: '10px'
  },
  selectInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '12px',
    color: '#FFFFFF',
    fontSize: '13px',
    outline: 'none'
  },
  checkboxLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#8E8E93',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 0'
  },
  checkboxInput: {
    accentColor: '#39FF14',
    width: '16px',
    height: '16px'
  },
  checkboxInputBlue: {
    accentColor: '#00ccff',
    width: '16px',
    height: '16px'
  },
  botonPrincipal: {
    backgroundColor: '#39FF14',
    color: '#000000',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    marginTop: '4px'
  },
  scrollerListaInterna: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '260px',
    overflowY: 'auto'
  },
  itemFilaClub: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.02)'
  },
  nombreItemLista: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  detalleItemLista: {
    fontSize: '11px',
    color: '#8E8E93',
    marginTop: '4px'
  },
  badgeEstadoActivo: {
    fontSize: '10px',
    color: '#39FF14',
    backgroundColor: 'rgba(57, 255, 20, 0.08)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: '700'
  },
  badgeTipoProducto: {
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase'
  },
  btnEliminarIcono: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '8px'
  },
  textoListaVacia: {
    fontSize: '12px',
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    margin: '10px 0'
  },
  contenedorLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0C0C0E'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTop: '3px solid #39FF14',
    borderRadius: '50%'
  },
  tarjetaCentralForm: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#141416',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.04)',
    alignSelf: 'center'
  },
  alertaError: {
    backgroundColor: 'rgba(255,69,58,0.1)',
    color: '#FF453A',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '12px',
    marginBottom: '14px',
    textAlign: 'center'
  }
};

export default GestionComplejo;