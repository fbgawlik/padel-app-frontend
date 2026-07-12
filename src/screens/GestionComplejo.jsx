// src/screens/GestionComplejo.jsx
import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GestionComplejo = () => {
  const { usuario } = useContext(AuthContext);
  const [complejo, setComplejo] = useState(null); 
  const [canchas, setCanchas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [turnosHoy, setTurnosHoy] = useState([]); // 🔥 Datos reales de la base de datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [necesitaCrear, setNecesitaCrear] = useState(false);
  const [formNuevoComplejo, setFormNuevoComplejo] = useState({ nombre: '', direccion: '', telefono: '' });
  const [archivoImagen, setArchivoImagen] = useState(null); 
  const [archivoImagenEdit, setArchivoImagenEdit] = useState(null);

  const [formComplejo, setFormComplejo] = useState({ nombre: '', direccion: '', telefono: '' });
  const [formCancha, setFormCancha] = useState({ nombre: '', tipoPiso: 'Césped Sintético', tipoPared: 'Blindex', techada: true });
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', stock: '0', esAlquiler: false });

  // Pestañas e interactividad de métricas
  const [subTabActiva, setSubTabActiva] = useState('canchas');
  const [metricaExpandida, setMetricaExpandida] = useState(null);

  // Obtener fecha actual en formato YYYY-MM-DD local de Argentina
  const obtenerFechaLocalArgentina = () => {
    const d = new Date();
    const tz = d.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" });
    const [dia, mes, anio] = tz.split('/');
    return `${anio}-${mes}-${dia}`;
  };

  const cargarProductosTienda = async (clubId) => {
    try {
      const res = await API.get(`/productos?complejoId=${clubId}`);
      setProductos(res.data);
    } catch (err) {
      console.error("Error al traer productos:", err);
    }
  };

  // 🔥 NUEVO: Cargar los turnos reales del día de hoy desde el backend
  const cargarTurnosDelDia = async (canchasIds) => {
    if (canchasIds.length === 0) return;
    try {
      const fechaHoy = obtenerFechaLocalArgentina();
      // Iteramos tus canchas registradas para traer sus grillas horarias de hoy
      const promesas = canchasIds.map(canchaId => 
        API.get(`/?canchaId=${canchaId}&fecha=${fechaHoy}`)
      );
      const respuestas = await Promise.all(promesas);
      // Unificamos todos los turnos en un solo array plano
      const todosLosTurnos = respuestas.flatMap(res => res.data);
      setTurnosHoy(todosLosTurnos);
    } catch (err) {
      console.error("Error al cargar los turnos del día:", err);
    }
  };

  useEffect(() => {
    const cargarDatosClub = async () => {
      if (!usuario?.id) return;
      
      try {
        setLoading(true);
        // Usamos la ruta nativa para traer los complejos
        const res = await API.get('/complejos'); 
        const miClub = res.data.find(c => c.administradorId === usuario.id);
        
        if (miClub) {
          setComplejo(miClub);
          setFormComplejo({ nombre: miClub.nombre, direccion: miClub.direccion, telefono: miClub.telefono || '' });
          
          const resCanchas = await API.get('/canchas');
          const filtradas = resCanchas.data.filter(c => c.complejoId === miClub.id);
          setCanchas(filtradas);

          // Cargar productos de la cantina
          await cargarProductosTienda(miClub.id);
          
          // Cargar turnos en tiempo real basándonos en sus canchas
          const ids = filtradas.map(c => c.id);
          await cargarTurnosDelDia(ids);
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

  // Métricas Calculadas en Tiempo Real (Cero Datos Harcodeados)
  const turnosReservadosHoy = turnosHoy.filter(t => t.estado === 'reservado' || t.usuarioId !== null);
  
  // Ocupación actual: Compara la hora del turno con la hora del sistema
  const obtenerCanchasOcupadasAhora = () => {
    const ahora = new Date();
    const horaActualStr = ahora.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Filtramos qué turnos reservados corresponden al bloque de hora actual
    const turnosActivos = turnosReservadosHoy.filter(t => {
      // Si tu backend maneja horaInicio y horaFin (ej: "18:00" y "19:30")
      if (t.horaInicio && t.horaFin) {
        return horaActualStr >= t.horaInicio && horaActualStr <= t.horaFin;
      }
      // Si maneja solo propiedad 'hora' fija (ej: "18:00"), asumimos un bloque estimado de 1 hora y media
      if (t.hora) {
        const [h, m] = t.hora.split(':').map(Number);
        const inicioMinutos = h * 60 + m;
        const [ha, ma] = horaActualStr.split(':').map(Number);
        const actualMinutos = ha * 60 + ma;
        return actualMinutos >= inicioMinutos && actualMinutos < (inicioMinutos + 90);
      }
      return false;
    });

    // Retorna la cantidad de canchas únicas que están ocupadas en este instante
    const canchasOcupadasIds = [...new Set(turnosActivos.map(t => t.canchaId))];
    return canchasOcupadasIds.length;
  };

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

      const res = await API.put(`/complejos/${complejo.id}`, formData, {
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
      const res = await API.post('/canchas', { ...formCancha, complejoId: complejo.id });
      alert("Cancha añadida exitosamente.");
      const nuevaCancha = res.data.cancha || res.data;
      const nuevasCanchas = [...canchas, nuevaCancha];
      setCanchas(nuevasCanchas);
      setFormCancha({ nombre: '', tipoPiso: 'Césped Sintético', tipoPared: 'Blindex', techada: true });
      
      // Re-actualizar grilla del día para contemplar la nueva cancha
      cargarTurnosDelDia(nuevasCanchas.map(c => c.id));
    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar cancha.");
    }
  };

  const gestionarCrearProducto = async (e) => {
    e.preventDefault();
    if (!formProducto.nombre || !formProducto.precio) return alert("Ingresá nombre y precio.");

    try {
      const res = await API.post('/productos', { ...formProducto, complejoId: complejo.id });
      setProductos([...productos, res.data.producto || res.data]);
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
        
        {/* HEADER */}
        <div style={styles.headerClubContainer}>
          <div style={styles.headerClubLeft}>
            <div style={styles.avatarMiniClub}>🏢</div>
            <div>
              <h1 style={styles.tituloClubName}>{complejo?.nombre || 'Mi Complejo'}</h1>
              <p style={styles.subtituloUbicacion}>📍 {complejo?.direccion}</p>
            </div>
          </div>
          <button onClick={() => setSubTabActiva('perfil')} style={styles.btnAjustesRedondo}>⚙️</button>
        </div>

        {error && <div style={styles.alertaError}>{error}</div>}

        {/* 📊 TARJETAS DE MÉTRICAS CONEXIÓN REAL BASE DE DATOS */}
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
              <span style={styles.metricaNumero}>{turnosReservadosHoy.length}</span>
              <span style={{color: '#8E8E93', fontSize: '11px'}}>totales</span>
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
              <span style={styles.metricaNumero}>{`${obtenerCanchasOcupadasAhora()}/${canchas.length}`}</span>
            </div>
          </div>

          <div style={styles.tarjetaMetrica}>
            <span style={styles.metricaLabel}>Artículos Tienda</span>
            <div style={styles.metricaFilaValor}>
              <span style={{...styles.metricaNumero, color: '#39FF14'}}>{productos.length}</span>
            </div>
          </div>

          <div style={styles.tarjetaMetrica}>
            <span style={styles.metricaLabel}>Sin Stock / Crítico</span>
            <div style={styles.metricaFilaValor}>
              <span style={styles.metricaNumero}>{productos.filter(p => Number(p.stock) <= 2).length}</span>
              {productos.filter(p => Number(p.stock) <= 2).length > 0 && <div style={styles.badgeAlertaMinitab}>Alerta</div>}
            </div>
          </div>
        </div>

        {/* 📅 DESGLOSE DE CRONOGRAMA REAL (HOY) */}
        {metricaExpandida === 'reservas' && (
          <div style={styles.contenedorDesgloseMetrica}>
            <div style={styles.headerDesglose}>
              <h3 style={styles.tituloDesglose}>📅 Turnos Reservados (Hoy)</h3>
              <button onClick={() => setMetricaExpandida(null)} style={styles.btnCerrarDesglose}>✕</button>
            </div>
            
            {turnosReservadosHoy.length === 0 ? (
              <p style={styles.textoVacioDesglose}>No hay ninguna reserva registrada para el día de hoy.</p>
            ) : (
              canchas.map(cancha => {
                const turnosCancha = turnosReservadosHoy.filter(t => t.canchaId === cancha.id);
                if (turnosCancha.length === 0) return null;
                return (
                  <div key={cancha.id} style={{ marginBottom: '12px' }}>
                    <div style={styles.subtituloCanchaDesglose}>🎾 {cancha.nombre}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {turnosCancha.map(turno => (
                        <div key={turno.id} style={styles.itemReservaDesglose}>
                          <span style={styles.horaReserva}>{turno.hora || turno.horaInicio} hs</span>
                          <span style={styles.clienteReserva}>
                            👤 {turno.usuario?.nombreCompleto || turno.clienteNombre || 'Usuario App'}
                          </span>
                          <span style={{
                            ...styles.badgeEstadoReserva,
                            color: turno.modalidad === 'turno_abierto' ? '#00ccff' : '#39FF14',
                            backgroundColor: turno.modalidad === 'turno_abierto' ? 'rgba(0, 204, 255, 0.1)' : 'rgba(57, 255, 20, 0.1)'
                          }}>
                            {turno.modalidad === 'turno_abierto' ? 'Abierto' : 'Privado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 📊 DESGLOSE DE OCUPACIÓN REAL (AHORA MISMO) */}
        {metricaExpandida === 'ocupacion' && (
          <div style={styles.contenedorDesgloseMetrica}>
            <div style={styles.headerDesglose}>
              <h3 style={styles.tituloDesglose}>📊 Estado de Pistas en este Instante</h3>
              <button onClick={() => setMetricaExpandida(null)} style={styles.btnCerrarDesglose}>✕</button>
            </div>
            {canchas.length === 0 ? (
              <p style={styles.textoVacioDesglose}>Debes registrar canchas primero.</p>
            ) : (
              canchas.map(c => {
                const ahora = new Date();
                const horaActualStr = ahora.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit', hour12: false });
                const estaOcupada = turnosReservadosHoy.some(t => {
                  if (t.canchaId !== c.id) return false;
                  if (t.horaInicio && t.horaFin) return horaActualStr >= t.horaInicio && horaActualStr <= t.horaFin;
                  if (t.hora) {
                    const [h, m] = t.hora.split(':').map(Number);
                    const inicio = h * 60 + m;
                    const [ha, ma] = horaActualStr.split(':').map(Number);
                    const actual = ha * 60 + ma;
                    return actual >= inicio && actual < (inicio + 90);
                  }
                  return false;
                });

                return (
                  <div key={c.id} style={{ ...styles.itemReservaDesglose, marginBottom: '6px' }}>
                    <span style={styles.clienteReserva}>{estaOcupada ? '🔴' : '🟢'} {c.nombre} <small style={{color: '#8E8E93'}}>({c.tipoPiso})</small></span>
                    <span style={{
                      ...styles.badgeEstadoReserva, 
                      color: estaOcupada ? '#FF453A' : '#39FF14', 
                      backgroundColor: estaOcupada ? 'rgba(255,69,58,0.1)' : 'rgba(57,255,20,0.1)'
                    }}>
                      {estaOcupada ? 'OCUPADA' : 'LIBRE'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TABS DE SECCIÓN */}
        <div style={styles.barraTabsNavegacion}>
          <button style={subTabActiva === 'canchas' ? styles.tabActivo : styles.tabInactivo} onClick={() => setSubTabActiva('canchas')}>🎾 Canchas</button>
          <button style={subTabActiva === 'productos' ? styles.tabActivo : styles.tabInactivo} onClick={() => setSubTabActiva('productos')}>🍺 Cantina & Alquiler</button>
          <button style={subTabActiva === 'perfil' ? styles.tabActivo : styles.tabInactivo} onClick={() => setSubTabActiva('perfil')}>📝 Datos Club</button>
        </div>

        {/* CONTENIDOS DE LAS PESTAÑAS (ALTAS REALES) */}
        <div style={styles.bloqueContenidoDinamico}>
          
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
                    <p style={styles.textoListaVacia}>No hay canchas registradas en la base de datos.</p>
                  ) : (
                    canchas.map(c => (
                      <div key={c.id} style={styles.itemFilaClub}>
                        <div>
                          <div style={styles.nombreItemLista}>{c.nombre}</div>
                          <div style={styles.detalleItemLista}>{c.tipoPiso} • {c.tipoPared} • {c.techada ? '🧱 Techada' : '☀️ Descubierta'}</div>
                        </div>
                        <span style={styles.badgeEstadoActivo}>ACTIVA</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

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
                <h3 style={styles.tituloSeccionMini}>Inventario Real ({productos.length})</h3>
                <div style={styles.scrollerListaInterna}>
                  {productos.length === 0 ? (
                    <p style={styles.textoListaVacia}>No hay artículos cargados en la base de datos.</p>
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
                          <div style={styles.detalleItemLista}>Precio: ${p.precio} | Stock: <span style={{ color: Number(p.stock) <= 2 ? '#FF453A' : '#E5E5EA' }}>{p.stock} u.</span></div>
                        </div>
                        <button onClick={() => gestionarEliminarProducto(p.id)} style={styles.btnEliminarIcono}>🗑️</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

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

// ESTILOS UNIFICADOS PREMIUM
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
  panelAnchoMaximo: { width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column' },
  headerClubContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  headerClubLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  avatarMiniClub: { width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#141416', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', border: '1px solid rgba(255,255,255,0.06)' },
  tituloClubName: { fontSize: '18px', fontWeight: '800', margin: 0, color: '#FFFFFF' },
  subtituloUbicacion: { fontSize: '12px', color: '#8E8E93', margin: '2px 0 0 0' },
  btnAjustesRedondo: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  grillaMetricas: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' },
  tarjetaMetrica: { backgroundColor: '#141416', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s ease' },
  tarjetaMetricaActiva: { border: '1px solid #39FF14', backgroundColor: '#19191C' },
  metricaLabel: { fontSize: '11px', color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' },
  metricaFilaValor: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' },
  metricaNumero: { fontSize: '20px', fontWeight: '800', color: '#FFFFFF' },
  badgeAlertaMinitab: { fontSize: '9px', backgroundColor: 'rgba(255, 69, 58, 0.15)', color: '#FF453A', padding: '2px 6px', borderRadius: '6px', fontWeight: '700' },
  contenedorDesgloseMetrica: { backgroundColor: '#141416', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px', marginBottom: '16px' },
  headerDesglose: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' },
  tituloDesglose: { fontSize: '13px', fontWeight: '700', color: '#39FF14', margin: 0 },
  btnCerrarDesglose: { background: 'none', border: 'none', color: '#8E8E93', fontSize: '14px', cursor: 'pointer' },
  subtituloCanchaDesglose: { fontSize: '12px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px', paddingLeft: '2px' },
  itemReservaDesglose: { display: 'flex', alignItems: 'center', justifyIntersection: 'space-between', backgroundColor: '#1C1C1E', padding: '10px 12px', borderRadius: '10px', fontSize: '12px' },
  horaReserva: { fontWeight: '700', color: '#39FF14', width: '65px' },
  clienteReserva: { color: '#FFFFFF', flex: 1, fontWeight: '500' },
  badgeEstadoReserva: { fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' },
  textoVacioDesglose: { fontSize: '11px', color: '#8E8E93', fontStyle: 'italic', textAlign: 'center', margin: '8px 0' },
  barraTabsNavegacion: { display: 'flex', backgroundColor: '#141416', padding: '4px', borderRadius: '12px', gap: '4px', marginBottom: '16px' },
  tabActivo: { flex: 1, backgroundColor: '#1C1C1E', color: '#FFFFFF', border: 'none', padding: '10px 4px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  tabInactivo: { flex: 1, backgroundColor: 'transparent', color: '#8E8E93', border: 'none', padding: '10px 4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  bloqueContenidoDinamico: { width: '100%' },
  layoutSeccionInterna: { display: 'flex', flexDirection: 'column', gap: '16px' },
  tarjetaFormularioInterno: { backgroundColor: '#141416', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.04)' },
  tarjetaFormularioInternoCompleto: { backgroundColor: '#141416', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.04)' },
  tarjetaListaDatos: { backgroundColor: '#141416', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.04)' },
  tituloSeccionMini: { fontSize: '14px', fontWeight: '700', margin: '0 0 14px 0', color: '#E5E5EA' },
  formulario: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { backgroundColor: '#1C1C1E', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px', color: '#FFFFFF', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  filaInputsMitad: { display: 'flex', gap: '10px' },
  selectInput: { flex: 1, backgroundColor: '#1C1C1E', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px', color: '#FFFFFF', fontSize: '13px', outline: 'none' },
  checkboxLabelContainer: { display: 'flex', alignItems: 'center', gap: '8px', color: '#8E8E93', fontSize: '12px', cursor: 'pointer', padding: '4px 0' },
  checkboxInput: { accentColor: '#39FF14', width: '16px', height: '16px' },
  checkboxInputBlue: { accentColor: '#00ccff', width: '16px', height: '16px' },
  botonPrincipal: { backgroundColor: '#39FF14', color: '#000000', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '4px' },
  scrollerListaInterna: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' },
  itemFilaClub: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1C1C1E', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' },
  nombreItemLista: { fontSize: '14px', fontWeight: '700', color: '#FFFFFF' },
  detalleItemLista: { fontSize: '11px', color: '#8E8E93', marginTop: '4px' },
  badgeEstadoActivo: { fontSize: '10px', color: '#39FF14', backgroundColor: 'rgba(57, 255, 20, 0.08)', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' },
  badgeTipoProducto: { fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' },
  btnEliminarIcono: { backgroundColor: 'rgba(255, 69, 58, 0.1)', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' },
  textoListaVacia: { fontSize: '12px', color: '#8E8E93', textAlign: 'center', fontStyle: 'italic', margin: '10px 0' },
  contenedorLoading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0C0C0E' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(255, 255, 255, 0.05)', borderTop: '3px solid #39FF14', borderRadius: '50%' },
  tarjetaCentralForm: { width: '100%', maxWidth: '400px', backgroundColor: '#141416', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.04)', alignSelf: 'center' },
  alertaError: { backgroundColor: 'rgba(255,69,58,0.1)', color: '#FF453A', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }
};

export default GestionComplejo;