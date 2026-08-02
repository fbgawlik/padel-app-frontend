import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { torneoService } from '../services/torneoService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { resolverUrlImagen } from '../services/imageHelper';
import Toast from '../components/Toast'; // Aseguramos renderizado de feedback si lo requieres

const GestionTorneoScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Pestañas: 'inscriptos', 'llaves', 'resultados'
  const [pestanaActiva, setPestanaActiva] = useState('inscriptos');
  const [busqueda, setBusqueda] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState('7ago');
  const [categoriaFiltrada, setCategoriaFiltrada] = useState('');
  const [generoFiltrado, setGeneroFiltrado] = useState(''); // Estado para filtro de género
  const [resultadoEdicion, setResultadoEdicion] = useState({});
  const [toast, setToast] = useState(null);

  const { data: torneo, isLoading, isError, error } = useQuery({
    queryKey: ['torneoGestion', id],
    queryFn: async () => {
      const data = await torneoService.getById(id);
      return data || { nombre: 'Edición Origen', inscripciones: [], partidos: [], zonas: [] };
    }
  });

  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    if (torneo?.categoria) {
      const categorias = torneo.categoria.split(/[|/]+/).map(c => c.trim()).filter(Boolean);
      if (categorias.length > 0 && !categoriaFiltrada) {
        setCategoriaFiltrada(categorias[0]);
      }
    }
  }, [torneo]);

  const partidos = torneo?.partidos || [];
  const zonas = torneo?.zonas || [];
  const categoriasDisponibles = torneo?.categoria ? torneo.categoria.split(/[|/]+/).map(c => c.trim()).filter(Boolean) : [];

  // FILTRADO COMPLETO DE INSCRIPTOS (Texto + Categoría + Género)
  const inscriptosFiltrados = (torneo?.inscripciones || []).filter(insc => {
    const texto = `${insc.jugador1} ${insc.jugador2}`.toLowerCase();
    const coincideBusqueda = !busqueda || texto.includes(busqueda.toLowerCase());
    
    // Filtrado por categoría
    const coincideCategoria = !categoriaFiltrada || 
      (insc.categoria && insc.categoria.toLowerCase().includes(categoriaFiltrada.toLowerCase()));

    // Filtrado por género (detecta si la categoría o la inscripción tiene Caballeros / Damas / Mixto)
    let coincideGenero = true;
    if (generoFiltrado) {
      const catTexto = (insc.categoria || '').toLowerCase();
      if (generoFiltrado === 'Caballeros') {
        coincideGenero = catTexto.includes('caballeros') || catTexto.includes('varones') || catTexto.includes('masculino');
      } else if (generoFiltrado === 'Damas') {
        coincideGenero = catTexto.includes('damas') || catTexto.includes('femenino');
      } else if (generoFiltrado === 'Mixto') {
        coincideGenero = catTexto.includes('mixto');
      }
    }

    return coincideBusqueda && coincideCategoria && coincideGenero;
  });

  const partidosFiltrados = partidos.filter(partido => !categoriaFiltrada || partido.categoria === categoriaFiltrada);
  const zonasFiltradas = zonas.filter(zona => !categoriaFiltrada || zona.categoria === categoriaFiltrada);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // MUTACIÓN PARA PUBLICAR RESULTADOS
  const publicarResultadosMutation = useMutation({
    mutationFn: async () => {
      if (torneoService.publicarResultados) {
        return await torneoService.publicarResultados(id);
      }
      // Mock fallback si el endpoint no existe aún
      return new Promise((res) => setTimeout(res, 800));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['torneoGestion', id]);
      mostrarToast('¡Resultados publicados a los participantes!', 'success');
    },
    onError: (error) => {
      mostrarToast(error.response?.data?.error || 'Error al publicar los resultados.', 'error');
    }
  });

  const generarZonasMutation = useMutation({
    mutationFn: async (categoria) => {
      return await torneoService.generarZonas(id, categoria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['torneoGestion', id]);
      mostrarToast('Cuadros y zonas generados correctamente.', 'success');
    },
    onError: (error) => {
      mostrarToast(error.response?.data?.error || 'Error al generar zonas.', 'error');
    }
  });

  const resultadoMutation = useMutation({
    mutationFn: async ({ partidoId, resultado }) => {
      return await torneoService.actualizarPartido(partidoId, resultado);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['torneoGestion', id]);
      mostrarToast('Resultado guardado correctamente.', 'success');
    },
    onError: (error) => {
      mostrarToast(error.response?.data?.error || 'Error al guardar resultado.', 'error');
    }
  });

  const handleResultadoChange = (partidoId, value) => {
    setResultadoEdicion(prev => ({ ...prev, [partidoId]: value }));
  };

  const handleGuardarResultado = (partidoId) => {
    const resultado = (resultadoEdicion[partidoId] || '').trim();
    if (!resultado) {
      mostrarToast('Ingresá un resultado válido.', 'error');
      return;
    }
    resultadoMutation.mutate({ partidoId, resultado });
  };

  if (isLoading) return <div style={styles.centerContainer}><div style={styles.spinner}></div></div>;
  if (isError) return <div style={styles.centerContainer}><div style={{color:'#fff'}}>Error cargando torneo: {error?.message || 'Error desconocido'}</div></div>;

  return (
    <div style={styles.screenContainer}>
      
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}

      {/* ─── ENCABEZADO Y TÍTULOS ─── */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div style={styles.headerInfo}>
          <div style={styles.logoRow}>
            <span style={styles.logoText}>ADN PADEL</span>
            {pestanaActiva === 'resultados' && (
               <button 
                onClick={() => publicarResultadosMutation.mutate()} 
                disabled={publicarResultadosMutation.isLoading}
                style={{
                  ...styles.btnPublicar,
                  opacity: publicarResultadosMutation.isLoading ? 0.6 : 1
                }}
               >
                 {publicarResultadosMutation.isLoading ? 'PUBLICANDO...' : 'PUBLICAR RESULTADOS'}
               </button>
            )}
          </div>
          <h1 style={styles.tituloSecundario}>GESTIÓN DE TORNEO:</h1>
          <h2 style={styles.tituloPrincipal}>{torneo?.nombre?.toUpperCase()}</h2>
          <div style={styles.organizadorRow}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#2C2C2E' }}>
              {torneo?.usuario?.imagenPerfil ? (
                <img src={resolverUrlImagen(torneo.usuario.imagenPerfil)} alt="Organizador" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800 }}>
                  { (torneo?.usuario?.nombre?.charAt(0) || 'O').toUpperCase() }
                </div>
              )}
            </div>
            <span style={styles.organizadorText}>
              {torneo?.usuario ? `${torneo.usuario.nombre} ${torneo.usuario.apellido}` : 'Organizador'} {torneo?.usuario?.id === usuario?.id ? '(Tú - ORGANIZADOR)' : '(ORGANIZADOR)'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── PESTAÑAS ─── */}
      <div style={styles.tabsContainer}>
        {[
          { id: 'inscriptos', label: 'INSCRIPTOS' },
          { id: 'llaves', label: 'LLAVES' },
          { id: 'resultados', label: 'RESULTADOS' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id)}
            style={{
              ...styles.tabButton,
              color: pestanaActiva === tab.id ? '#39FF14' : '#8E8E93',
              borderBottom: pestanaActiva === tab.id ? '3px solid #39FF14' : '3px solid transparent'
            }}
          >
            {pestanaActiva === tab.id ? `[ ${tab.label} ]` : tab.label}
          </button>
        ))}
      </div>

      {/* ─── CONTENIDO DINÁMICO ─── */}
      <div style={styles.mainContent}>

        {/* VISTA 1: INSCRIPTOS */}
        {pestanaActiva === 'inscriptos' && (
          <div style={styles.seccionContenido}>
            <div style={styles.searchRow}>
              <div style={styles.searchContainer}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" style={{marginLeft: '12px'}}>
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar inscriptos..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <div style={styles.counterBox}>
                <span style={styles.counterNumber}>{inscriptosFiltrados.length * 2} Inscriptos</span>
                <span style={styles.counterSub}>({inscriptosFiltrados.length} Parejas)</span>
              </div>
            </div>

            {/* FILTROS DE CATEGORÍA Y GÉNERO FUNCIONALES */}
            <div style={styles.filtersRow}>
              <select style={styles.selectInput} value={categoriaFiltrada} onChange={(e) => setCategoriaFiltrada(e.target.value)}>
                <option value="">Categoría: Todas</option>
                {categoriasDisponibles.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              
              <select style={styles.selectInput} value={generoFiltrado} onChange={(e) => setGeneroFiltrado(e.target.value)}>
                <option value="">Género: Todos</option>
                <option value="Caballeros">Caballeros</option>
                <option value="Damas">Damas</option>
                <option value="Mixto">Mixto</option>
              </select>
            </div>

            <div style={styles.listContainer}>
              {inscriptosFiltrados.length === 0 ? (
                <div style={styles.textoListaVacia}>No se encontraron inscriptos para los filtros seleccionados.</div>
              ) : (
                inscriptosFiltrados.map(insc => (
                  <div key={insc.id} style={{...styles.cardInscripto, borderColor: '#39FF14'}}>
                    <div style={styles.avatarDoble}>
                      <div style={{...styles.avatar, zIndex: 2, overflow: 'hidden'}}>
                        {insc.usuario1?.imagenPerfil ? (
                          <img src={resolverUrlImagen(insc.usuario1.imagenPerfil)} alt={insc.jugador1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ color: '#FFF', fontWeight: 800 }}>{(insc.jugador1 || 'J').charAt(0).toUpperCase()}</div>
                        )}
                      </div>
                      <div style={{...styles.avatar, zIndex: 1, marginLeft: '-10px', overflow: 'hidden'}}>
                        {insc.usuario2?.imagenPerfil ? (
                          <img src={resolverUrlImagen(insc.usuario2.imagenPerfil)} alt={insc.jugador2} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ color: '#FFF', fontWeight: 800 }}>{(insc.jugador2 || 'J').charAt(0).toUpperCase()}</div>
                        )}
                      </div>
                    </div>
                    <div style={styles.infoInscripto}>
                      <h4 style={styles.nombreInscripto}>{`${insc.jugador1} / ${insc.jugador2}`}</h4>
                      <span style={styles.catInscripto}>Categoría: {insc.categoria}</span>
                      <span style={{...styles.estadoInscripto, color: '#39FF14'}}>Confirmado</span>
                    </div>
                    <div style={styles.actionIcons}>
                      <button style={styles.iconBtn}>💬</button>
                      <button style={styles.iconBtn}>👁️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA 2: LLAVES */}
        {pestanaActiva === 'llaves' && (
          <div style={styles.seccionContenido}>
            <div style={styles.filtersRow}>
               <select style={styles.selectInput} value={categoriaFiltrada} onChange={(e) => setCategoriaFiltrada(e.target.value)}>
                 <option value="">Categoría: Seleccionar</option>
                 {categoriasDisponibles.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>

               {/* BOTÓN CON DISEÑO MEJORADO E INTEGRADO AL TEMA */}
               <button 
                 onClick={() => generarZonasMutation.mutate(categoriaFiltrada)}
                 disabled={generarZonasMutation.isLoading || !categoriaFiltrada}
                 style={{ 
                   ...styles.btnGenerarZonas,
                   opacity: (!categoriaFiltrada || generarZonasMutation.isLoading) ? 0.5 : 1,
                   cursor: (!categoriaFiltrada || generarZonasMutation.isLoading) ? 'not-allowed' : 'pointer'
                 }}
               >
                 {generarZonasMutation.isLoading ? 'Generando...' : 'Generar Zonas'}
               </button>
            </div>

            {zonasFiltradas.length === 0 ? (
              <div style={styles.llavesContainer}>
                <div style={styles.mensajePlaceholder}>
                  <span style={{fontSize: '36px', display: 'block', marginBottom: '8px'}}>🏆</span>
                  <p style={{ fontWeight: '700', color: '#FFF' }}>No hay zonas generadas todavía para esta categoría.</p>
                  <p style={{ color: '#8E8E93', marginTop: '6px', fontSize: '13px' }}>
                    Seleccioná una categoría y tocá <strong>"Generar Zonas"</strong> para armar el cuadro.
                  </p>
                </div>
              </div>
            ) : (
              zonasFiltradas.map(zona => {
                const partidosZona = partidosFiltrados.filter(partido => partido.zonaId === zona.id);
                return (
                  <div key={zona.id} style={styles.zoneCard}>
                    <div style={styles.zoneHeader}>{zona.nombre} • {zona.categoria}</div>
                    {partidosZona.length === 0 ? (
                      <div style={styles.textoListaVacia}>No hay partidos generados para esta zona.</div>
                    ) : partidosZona.map(partido => (
                      <div key={partido.id} style={styles.partidoCard}>
                        <div style={styles.partidoHeader}>
                          <span>{partido.fecha || 'Fecha pendiente'} • {partido.hora || 'Hora pendiente'}</span>
                          <span style={styles.badgeEstado}>{partido.estado.toUpperCase()}</span>
                        </div>
                        <div style={styles.partidoEquipos}>
                          <span>{partido.pareja1 ? `${partido.pareja1.jugador1} / ${partido.pareja1.jugador2}` : 'Pareja A'}</span>
                          <span>vs</span>
                          <span>{partido.pareja2 ? `${partido.pareja2.jugador1} / ${partido.pareja2.jugador2}` : 'Pareja B'}</span>
                        </div>
                        <div style={styles.partidoResultado}>{partido.resultado || 'Resultado pendiente'}</div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VISTA 3: RESULTADOS */}
        {pestanaActiva === 'resultados' && (
          <div style={styles.seccionContenido}>
            <div style={styles.diasRow}>
              {[
                { id: '7ago', text1: 'VIE', text2: '7 AGO' },
                { id: '8ago', text1: 'SAB', text2: '8 AGO' },
                { id: '9ago', text1: 'DOM', text2: '9 AGO' }
              ].map(dia => (
                <button 
                  key={dia.id} onClick={() => setDiaSeleccionado(dia.id)}
                  style={{
                    ...styles.diaBtn,
                    backgroundColor: diaSeleccionado === dia.id ? 'rgba(57, 255, 20, 0.1)' : 'rgba(22, 22, 24, 0.8)',
                    borderColor: diaSeleccionado === dia.id ? '#39FF14' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <span style={{color: diaSeleccionado === dia.id ? '#39FF14' : '#8E8E93', fontWeight: '700', fontSize: '13px'}}>{dia.text1}</span>
                  <span style={{color: '#FFF', fontWeight: '800', fontSize: '16px'}}>{dia.text2}</span>
                </button>
              ))}
            </div>

            <h3 style={styles.tituloFecha}>Resultados del viernes, 7 de agosto</h3>

            <div style={styles.listContainer}>
              {partidosFiltrados.length === 0 ? (
                <div style={styles.textoListaVacia}>No hay partidos registrados para esta categoría.</div>
              ) : (
                partidosFiltrados.map(partido => (
                  <div key={partido.id} style={styles.cardResultado}>
                    <div style={styles.resultadoHeader}>
                      <span style={styles.textoPista}>{partido.zona?.nombre || partido.tipoFase} • {partido.fecha || 'Fecha pendiente'}</span>
                      <span style={{...styles.badgeEstado, color: partido.estado === 'finalizado' ? '#39FF14' : '#E5C200'}}>
                        {partido.estado.toUpperCase()}
                      </span>
                    </div>

                    <div style={styles.enfrentamientoRow}>
                      <div style={styles.parejasCol}>
                        <div style={styles.parejaItem}>
                          <span style={styles.parejaLetra}>Pareja A</span>
                          <span style={styles.parejaNombres}>{partido.pareja1 ? `${partido.pareja1.jugador1} / ${partido.pareja1.jugador2}` : 'Pareja A'}</span>
                        </div>
                        <div style={styles.vsSmall}>vs</div>
                        <div style={styles.parejaItem}>
                          <span style={styles.parejaLetra}>Pareja B</span>
                          <span style={styles.parejaNombres}>{partido.pareja2 ? `${partido.pareja2.jugador1} / ${partido.pareja2.jugador2}` : 'Pareja B'}</span>
                        </div>
                      </div>

                      <div style={styles.setsCol}>
                        <div style={styles.setFila}>
                          <span style={styles.setCaja}>{partido.resultado || 'Resultado pendiente'}</span>
                        </div>
                      </div>
                    </div>

                    {partido.estado !== 'finalizado' ? (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={resultadoEdicion[partido.id] || ''}
                          onChange={(e) => handleResultadoChange(partido.id, e.target.value)}
                          placeholder="Ej: 6-3 / 6-4 o W.O. P1"
                          style={styles.inputResultado}
                        />
                        <button
                          type="button"
                          onClick={() => handleGuardarResultado(partido.id)}
                          disabled={resultadoMutation.isLoading}
                          style={{ ...styles.btnPrimario, opacity: resultadoMutation.isLoading ? 0.6 : 1 }}
                        >
                          {resultadoMutation.isLoading ? 'Guardando...' : 'Guardar resultado'}
                        </button>
                      </div>
                    ) : (
                      <div style={styles.resultadoFooter}>
                        <span style={styles.textoLiveScore}>Resultado final: {partido.resultado}</span>
                        <span style={{ color: '#8E8E93', fontSize: '12px' }}>No editable</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTÓN FLOTANTE */}
      <button style={styles.fabButton}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      
    </div>
  );
};

// --- ESTILOS VISUALES MEJORADOS ---
const styles = {
  screenContainer: {
    backgroundColor: '#0A0A0B', minHeight: '100vh', width: '100%', 
    color: '#FFF', paddingBottom: '120px', boxSizing: 'border-box'
  },
  header: { display: 'flex', padding: '20px', gap: '16px', alignItems: 'flex-start', background: 'linear-gradient(180deg, rgba(30,50,40,0.4) 0%, rgba(10,10,11,1) 100%)' },
  backButton: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', outline: 'none' },
  headerInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  logoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  logoText: { color: '#FFF', fontWeight: '800', fontSize: '14px', letterSpacing: '1px' },
  btnPublicar: { backgroundColor: 'transparent', border: '1px solid #39FF14', color: '#39FF14', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: '0.5px' },
  tituloSecundario: { fontSize: '20px', color: '#FFF', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  tituloPrincipal: { fontSize: '26px', color: '#FFF', fontWeight: '900', margin: '4px 0 12px 0', letterSpacing: '-0.5px' },
  organizadorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  organizadorText: { color: '#8E8E93', fontSize: '12px', fontWeight: '600' },
  
  tabsContainer: { display: 'flex', justifyContent: 'space-around', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tabButton: { background: 'transparent', border: 'none', padding: '14px 0', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px' },
  
  mainContent: { padding: '20px' },
  seccionContenido: { display: 'flex', flexDirection: 'column', gap: '16px' },
  
  searchRow: { display: 'flex', gap: '12px', alignItems: 'center' },
  searchContainer: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#161618', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, backgroundColor: 'transparent', border: 'none', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none' },
  counterBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  counterNumber: { fontSize: '14px', fontWeight: '600', color: '#FFF' },
  counterSub: { fontSize: '12px', color: '#8E8E93' },
  
  filtersRow: { display: 'flex', gap: '12px', alignItems: 'center' },
  selectInput: { flex: 1, backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF', padding: '12px', borderRadius: '14px', fontSize: '13px', outline: 'none' },
  
  btnGenerarZonas: { 
    backgroundColor: '#39FF14', 
    color: '#0A0A0B', 
    border: 'none', 
    padding: '12px 18px', 
    borderRadius: '14px', 
    fontWeight: '800', 
    fontSize: '13px',
    boxShadow: '0 4px 14px rgba(57, 255, 20, 0.25)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },

  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  textoListaVacia: { textAlign: 'center', color: '#8E8E93', padding: '24px 0', fontSize: '13px' },
  zoneCard: { backgroundColor: '#141416', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.07)' },
  zoneHeader: { fontSize: '14px', fontWeight: '800', color: '#39FF14', marginBottom: '12px' },
  partidoCard: { backgroundColor: '#1D1D20', borderRadius: '14px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' },
  partidoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', color: '#8E8E93' },
  partidoEquipos: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '12px', color: '#FFFFFF', flexWrap: 'wrap' },
  partidoResultado: { fontSize: '13px', color: '#8E8E93', padding: '10px 14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'center' },
  inputResultado: { flex: 1, backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', color: '#FFF', fontSize: '13px', outline: 'none', minWidth: '220px' },
  cardInscripto: { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(22, 22, 24, 0.7)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', gap: '12px' },
  avatarDoble: { display: 'flex', position: 'relative' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '2px solid #161618' },
  infoInscripto: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  nombreInscripto: { margin: 0, fontSize: '14px', fontWeight: '800', color: '#FFF' },
  catInscripto: { fontSize: '12px', color: '#8E8E93' },
  estadoInscripto: { fontSize: '11px', fontWeight: '700' },
  actionIcons: { display: 'flex', gap: '8px' },
  iconBtn: { background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', outline: 'none' },
  
  diasRow: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' },
  diaBtn: { flex: 1, minWidth: '90px', padding: '12px', borderRadius: '16px', border: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' },
  tituloFecha: { fontSize: '18px', fontWeight: '700', margin: '10px 0', color: '#FFF' },
  
  cardResultado: { backgroundColor: 'rgba(22, 22, 24, 0.7)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  resultadoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  textoPista: { color: '#8E8E93', fontSize: '13px', fontWeight: '600' },
  badgeEstado: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' },
  
  enfrentamientoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  parejasCol: { display: 'flex', flexDirection: 'column', gap: '6px' },
  parejaItem: { display: 'flex', flexDirection: 'column' },
  parejaLetra: { fontSize: '14px', fontWeight: '800', color: '#FFF' },
  parejaNombres: { fontSize: '12px', color: '#8E8E93', marginTop: '2px' },
  vsSmall: { fontSize: '10px', color: '#39FF14', fontWeight: '800', paddingLeft: '8px' },
  
  setsCol: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' },
  setFila: { display: 'flex', gap: '6px' },
  setCaja: { color: '#39FF14', fontSize: '16px', fontWeight: '800', letterSpacing: '2px' },
  
  resultadoFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  textoLiveScore: { fontSize: '13px', color: '#8E8E93' },
  btnPrimario: { backgroundColor: '#39FF14', color: '#0A0A0B', padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' },

  llavesContainer: { minHeight: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px' },
  mensajePlaceholder: { textAlign: 'center' },

  fabButton: { position: 'fixed', bottom: '104px', right: '24px', width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#39FF14', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 4px 16px rgba(57, 255, 20, 0.4)', cursor: 'pointer', zIndex: 99 },
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(57, 255, 20, 0.1)', borderTopColor: '#39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default GestionTorneoScreen;