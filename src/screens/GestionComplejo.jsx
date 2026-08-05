// src/screens/GestionComplejo.jsx
import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { styles } from './GestionComplejo.styles';

const GestionComplejo = () => {
  const { usuario } = useContext(AuthContext);
  const { mostrarNotificacion } = useNotification();
  const [complejo, setComplejo] = useState(null); 
  const [canchas, setCanchas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [turnosHoy, setTurnosHoy] = useState([]); 
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
  const [torneosClub, setTorneosClub] = useState([]);
  const [openInscriptos, setOpenInscriptos] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState({});

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

  // 🔥 Corregido: Endpoint real asignado a '/turnos'
  const cargarTurnosDelDia = async (canchasIds) => {
    if (canchasIds.length === 0) return;
    try {
      const fechaHoy = obtenerFechaLocalArgentina();
      const promesas = canchasIds.map(canchaId => 
        API.get('/turnos', { params: { canchaId, fecha: fechaHoy } })
      );
      const respuestas = await Promise.all(promesas);
      const todosLosTurnos = respuestas.flatMap(res => res.data);
      
      console.log("Turnos sincronizados en el panel:", todosLosTurnos);
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
        // Traemos el complejo del administrador logueado
        const res = await API.get('/complejos'); 
        const miClub = res.data.find(c => c.administradorId === usuario.id);
        
        if (miClub) {
          setComplejo(miClub);
          setFormComplejo({ nombre: miClub.nombre, direccion: miClub.direccion, telefono: miClub.telefono || '' });
          
          // Traemos las canchas y filtramos por el id del complejo obtenido
          const resCanchas = await API.get('/canchas');
          const filtradas = resCanchas.data.filter(c => c.complejoId === miClub.id || c.complejo === miClub.id);
          setCanchas(filtradas);

          await cargarProductosTienda(miClub.id);
          
          const ids = filtradas.map(c => c.id || c._id);
          await cargarTurnosDelDia(ids);
          // Cargamos torneos del complejo
          cargarTorneosDelComplejo(miClub.id);
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

  // Cargar torneos pertenecientes a este complejo y sus inscripciones
  const cargarTorneosDelComplejo = async (complejoId) => {
    try {
      const res = await API.get('/torneos');
      const todos = res.data || [];
      const filtrados = todos.filter(t => (t.complejoId || t.complejo?.id || t.complejo) === complejoId);
      setTorneosClub(filtrados);
      // inicializamos la categoría seleccionada para cada torneo
      const catMap = {};
      filtrados.forEach(t => {
        const opciones = (t.categoria || '').split('|').map(s => s.trim()).filter(Boolean);
        catMap[t.id] = opciones.length ? opciones[0] : t.categoria;
      });
      setCategoriaSeleccionada(catMap);
    } catch (err) {
      console.error('Error al cargar torneos del complejo:', err);
    }
  };

  // Filtro flexible para capturar turnos reservados o con usuarios asignados
  const turnosReservadosHoy = turnosHoy.filter(t => 
    t.estado !== 'disponible' || 
    t.usuarioId !== null || 
    t.usuario !== null || 
    t.clienteNombre
  );
  
  // Ocupación en tiempo real comparando con la hora del sistema
  const obtenerCanchasOcupadasAhora = () => {
    const ahora = new Date();
    const horaActualStr = ahora.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const turnosActivos = turnosReservadosHoy.filter(t => {
      if (t.horaInicio && t.horaFin) {
        return horaActualStr >= t.horaInicio && horaActualStr <= t.horaFin;
      }
      return false;
    });

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

      mostrarNotificacion("¡Complejo registrado con éxito!", 'success');
      const clubCreado = res.data.complejo || res.data;
      setComplejo(clubCreado);
      setFormComplejo({ nombre: clubCreado.nombre, direccion: clubCreado.direccion, telefono: clubCreado.telefono || '' });
      setNecesitaCrear(false); 
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || "Error al crear el complejo.", 'error');
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

      const res = await API.put(`/complejos/${complejo.id || complejo._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      mostrarNotificacion("¡Datos del complejo actualizados!", 'success');
      setComplejo(res.data.complejo || res.data);
      setArchivoImagenEdit(null);
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || "Error al actualizar los datos.", 'error');
    }
  };

  const gestionarCrearCancha = async (e) => {
    e.preventDefault();
    try {
      const idComplejo = complejo.id || complejo._id;
      const res = await API.post('/canchas', { ...formCancha, complejoId: idComplejo });
      mostrarNotificacion("Cancha añadida exitosamente.", 'success');
      const nuevaCancha = res.data.cancha || res.data;
      const nuevasCanchas = [...canchas, nuevaCancha];
      setCanchas(nuevasCanchas);
      setFormCancha({ nombre: '', tipoPiso: 'Césped Sintético', tipoPared: 'Blindex', techada: true });
      
      cargarTurnosDelDia(nuevasCanchas.map(c => c.id || c._id));
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || "Error al guardar cancha.", 'error');
    }
  };

  const gestionarCrearProducto = async (e) => {
    e.preventDefault();
    if (!formProducto.nombre || !formProducto.precio) return mostrarNotificacion("Ingresá nombre y precio.", 'error');

    try {
      const idComplejo = complejo.id || complejo._id;
      const res = await API.post('/productos', { ...formProducto, complejoId: idComplejo });
      setProductos([...productos, res.data.producto || res.data]);
      setFormProducto({ nombre: '', precio: '', stock: '0', esAlquiler: false });
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || "Error registrando producto.", 'error');
    }
  };

  const gestionarEliminarProducto = async (productoId) => {
    if (!window.confirm("¿Seguro que querés eliminar esto?")) return;
    try {
      await API.delete(`/productos/${productoId}`);
      setProductos(productos.filter(p => (p.id || p._id) !== productoId));
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || "Error al eliminar producto.", 'error');
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

        {/* 📊 TARJETAS DE MÉTRICAS */}
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

        {/* 📅 DESGLOSE DE CRONOGRAMA */}
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
                const canchaId = cancha.id || cancha._id;
                const turnosCancha = turnosReservadosHoy.filter(t => t.canchaId === canchaId);
                if (turnosCancha.length === 0) return null;
                return (
                  <div key={canchaId} style={{ marginBottom: '16px' }}>
                    <div style={styles.subtituloCanchaDesglose}>🎾 {cancha.nombre}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {turnosCancha.map(turno => {
                        const nombreCliente = turno.usuario?.nombreCompleto || turno.usuario?.nombre || turno.clienteNombre || 'Usuario App';
                        const telefonoCliente = turno.usuario?.telefono || turno.clienteTelefono || null;
                        const esAbierto = turno.tipoTurno === 'partido_abierto';

                        return (
                          <div key={turno.id || turno._id} style={styles.itemReservaDesglose}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={styles.horaReserva}>{turno.horaInicio} - {turno.horaFin} hs</span>
                                <span style={{
                                  ...styles.badgeEstadoReserva,
                                  color: esAbierto ? '#00ccff' : '#39FF14',
                                  backgroundColor: esAbierto ? 'rgba(0, 204, 255, 0.1)' : 'rgba(57, 255, 20, 0.1)'
                                }}>
                                  {esAbierto ? 'Abierto' : 'Normal'}
                                </span>
                              </div>
                              <span style={styles.clienteReserva}>
                                👤 {nombreCliente}
                              </span>
                            </div>

                            {telefonoCliente && (
                              <a 
                                href={`https://wa.me/${telefonoCliente.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={styles.botonWhatsappContacto}
                              >
                                💬 Contactar
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── TORNEOS DEL COMPLEJO Y GESTIÓN DE INSCRIPTOS ─── */}
        <div style={{ marginTop: '18px' }}>
          <h3 style={{ color: '#E5E5EA', margin: '0 0 10px 0' }}>Torneos del Complejo</h3>
          {torneosClub.length === 0 ? (
            <p style={styles.textoListaVacia}>No hay torneos cargados para este complejo.</p>
          ) : (
            torneosClub.map(t => (
              <div key={t.id} style={{ ...styles.tarjetaMetrica, marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{t.nombre}</div>
                    <div style={{ fontSize: 12, color: '#8E8E93' }}>{t.fechaInicio} → {t.fechaFin}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: '#39FF14', fontWeight: 800 }}>{(t.inscripciones || []).length} parejas</div>
                    <button onClick={() => setOpenInscriptos(prev => ({ ...prev, [t.id]: !prev[t.id] }))} style={{ ...styles.btnAjustesRedondo, width: '36px', height: '36px' }}>{openInscriptos[t.id] ? '🔽' : '🔍'}</button>
                  </div>
                </div>

                {openInscriptos[t.id] && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <label style={{ color: '#8E8E93', fontSize: 12 }}>Categoría:</label>
                      <select value={categoriaSeleccionada[t.id] || ''} onChange={(e) => setCategoriaSeleccionada(prev => ({ ...prev, [t.id]: e.target.value }))} style={styles.selectInput}>
                        {(t.categoria || '').split('|').map((c, idx) => <option key={idx} value={c.trim()}>{c.trim()}</option>)}
                      </select>
                      <button onClick={async () => {
                        try {
                          const categoria = categoriaSeleccionada[t.id] || (t.categoria || '').split('|')[0];
                          const resp = await API.post('/torneos/generar-zonas', { torneoId: t.id, categoria });
                          mostrarNotificacion(resp.data?.message || 'Zonas generadas', 'success');
                          // refetch torneos para mostrar zonas
                          cargarTorneosDelComplejo(complejo.id);
                        } catch (err) {
                          console.error(err);
                          mostrarNotificacion(err.response?.data?.error || 'Error generando zonas', 'error');
                        }
                      }} style={{ ...styles.botonPrincipal, padding: '8px 10px' }}>Generar Zonas</button>
                    </div>

                    <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(t.inscripciones || []).length === 0 ? (
                        <div style={styles.textoListaVacia}>Aún no hay parejas inscriptas.</div>
                      ) : (
                        (t.inscripciones || []).map(ins => (
                          <div key={ins.id} style={{ backgroundColor: '#1C1C1E', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 800 }}>{ins.jugador1} & {ins.jugador2}</div>
                              <div style={{ fontSize: 12, color: '#8E8E93' }}>{ins.telefono1 || '—'} • {ins.restriccionHoraria || 'Sin restricción'}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 12, color: '#8E8E93' }}>Categoria: {ins.categoria}</div>
                              <div style={{ fontSize: 12, color: '#8E8E93' }}>{ins.zonaId ? `Zona: ${ins.zonaId}` : ''}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

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
                const canchaId = c.id || c._id;
                const ahora = new Date();
                const horaActualStr = ahora.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit', hour12: false });
                const estaOcupada = turnosReservadosHoy.some(t => {
                  if (t.canchaId !== canchaId) return false;
                  return horaActualStr >= t.horaInicio && horaActualStr <= t.horaFin;
                });

                return (
                  <div key={canchaId} style={{ ...styles.itemReservaDesglose, marginBottom: '6px' }}>
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

        {/* CONTENIDOS DE LAS PESTAÑAS */}
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
                      <div key={c.id || c._id} style={styles.itemFilaClub}>
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
                    <input type="number" placeholder="Precio ($)" value={formProducto.precio} onChange={(e) => setFormProducto({ ...formProducto, price: e.target.value, precio: e.target.value })} style={styles.input} required min="0" />
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
                    productos.map(p => {
                      const prodId = p.id || p._id;
                      return (
                        <div key={prodId} style={styles.itemFilaClub}>
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
                          <button onClick={() => gestionarEliminarProducto(prodId)} style={styles.btnEliminarIcono}>🗑️</button>
                        </div>
                      );
                    })
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
;

export default GestionComplejo;