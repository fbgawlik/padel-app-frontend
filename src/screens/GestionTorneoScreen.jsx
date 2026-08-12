// src/screens/GestionTorneoScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { torneoService } from '../services/torneoService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { resolverUrlImagen } from '../services/imageHelper';
import Toast from '../components/Toast';
import { styles } from './GestionTorneoScreen.styles';

const GestionTorneoScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Pestañas: 'inscriptos', 'llaves', 'resultados'
  const [pestanaActiva, setPestanaActiva] = useState('inscriptos');
  const [busqueda, setBusqueda] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState('7ago');
  const [categoriaFiltrada, setCategoriaFiltrada] = useState('');
  const [generoFiltrado, setGeneroFiltrado] = useState('');
  const [resultados, setResultados] = useState({});
  const [guardandoPartidoId, setGuardandoPartidoId] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal de Restricciones Horarias
  const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState(null);

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

    // Filtrado por género
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

  const parseBloquesRestringidos = (bloquesString = '[]') => {
    try {
      const bloques = JSON.parse(bloquesString);
      return Array.isArray(bloques) ? bloques : [];
    } catch (e) {
      return [];
    }
  };

  const obtenerTextoRestricciones = (insc) => {
    const textoLibre = insc.restriccionHoraria?.trim();
    const bloques = parseBloquesRestringidos(insc.bloquesRestringidos);
    const partes = [];
    if (textoLibre) partes.push(textoLibre);
    if (bloques.length > 0) partes.push(`Bloques restringidos: ${bloques.join(', ')}`);
    return partes.length > 0 ? partes.join(' | ') : 'Sin restricciones de horario indicadas.';
  };

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // MUTACIÓN PARA CAMBIAR EL ESTADO DE PAGO
  const togglePagoMutation = useMutation({
    mutationFn: async ({ inscripcionId, pagado }) => {
      return await torneoService.togglePagoInscripcion(inscripcionId, pagado);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['torneoGestion', id], (prevData) => {
        if (!prevData) return prevData;
        const inscripcionesActualizadas = (prevData.inscripciones || []).map((insc) => {
          if (insc.id !== variables.inscripcionId) return insc;
          return {
            ...insc,
            pagado: variables.pagado
          };
        });
        return {
          ...prevData,
          inscripciones: inscripcionesActualizadas
        };
      });
      mostrarToast(
        variables.pagado ? 'Inscripción marcada como PAGADA' : 'Inscripción marcada como PENDIENTE',
        variables.pagado ? 'success' : 'info'
      );
    },
    onError: (error) => {
      mostrarToast(error.response?.data?.error || 'Error al actualizar el pago.', 'error');
    }
  });

  // MUTACIÓN PARA PUBLICAR RESULTADOS
  const publicarResultadosMutation = useMutation({
    mutationFn: async () => {
      if (torneoService.publicarResultados) {
        return await torneoService.publicarResultados(id);
      }
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

  // MUTACIÓN PARA GENERAR ZONAS
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

  // MUTACIÓN PARA GUARDAR RESULTADO DE UN PARTIDO
  const resultadoMutation = useMutation({
    mutationFn: async ({ partidoId, resultado }) => {
      return await torneoService.actualizarPartido(partidoId, resultado);
    },
    onMutate: async ({ partidoId }) => {
      setGuardandoPartidoId(partidoId);
    },
    onSettled: () => {
      setGuardandoPartidoId(null);
    },
    onSuccess: (data, variables) => {
      const resultado = variables.resultado;
      queryClient.setQueryData(['torneoGestion', id], (prevData) => {
        if (!prevData) return prevData;
        const partidosActualizados = (prevData.partidos || []).map((partido) => {
          if (partido.id !== variables.partidoId) return partido;
          return {
            ...partido,
            estado: 'finalizado',
            resultado,
            ...(data?.partido || {})
          };
        });
        return {
          ...prevData,
          partidos: partidosActualizados
        };
      });
      setResultados((prev) => ({ ...prev, [variables.partidoId]: '' }));
      mostrarToast('Resultado guardado correctamente.', 'success');
      if (data?.faseAvanzada) {
        queryClient.invalidateQueries(['torneoGestion', id]);
      }
    },
    onError: (error) => {
      mostrarToast(error.response?.data?.error || 'Error al guardar resultado.', 'error');
    }
  });

  const handleResultadoChange = (partidoId, value) => {
    setResultados(prev => ({ ...prev, [partidoId]: value }));
  };

  const handleGuardarResultado = (partidoId) => {
    const resultado = (resultados[partidoId] || '').trim();
    if (!resultado) {
      mostrarToast('Ingresá un resultado válido.', 'error');
      return;
    }
    resultadoMutation.mutate({ partidoId, resultado });
  };

  const abriendoWhatsApp = (telefono) => {
    if (!telefono) {
      mostrarToast('Teléfono no disponible.', 'error');
      return;
    }
    const numeroLimpio = telefono.replace(/\D/g, '');
    window.open(`https://wa.me/${numeroLimpio}`, '_blank');
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

            {/* FILTROS DE CATEGORÍA Y GÉNERO */}
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

            {/* LISTADO DE PAREJAS INSCRIPTAS */}
            <div style={styles.listContainer}>
              {inscriptosFiltrados.length === 0 ? (
                <div style={styles.textoListaVacia}>No se encontraron inscriptos para los filtros seleccionados.</div>
              ) : (
                inscriptosFiltrados.map(insc => {
                  const tieneRestricciones = Boolean(
                    (insc.restriccionHoraria && insc.restriccionHoraria.trim() !== "") ||
                    (insc.bloquesRestringidos && insc.bloquesRestringidos !== "[]")
                  );

                  return (
                    <div 
                      key={insc.id} 
                      style={{
                        ...styles.cardInscripto, 
                        borderColor: insc.pagado ? '#39FF14' : 'rgba(255,255,255,0.1)'
                      }}
                    >
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{
                            ...styles.badgePago,
                            backgroundColor: insc.pagado ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 69, 58, 0.15)',
                            color: insc.pagado ? '#39FF14' : '#FF453A',
                            border: `1px solid ${insc.pagado ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 69, 58, 0.3)'}`
                          }}>
                            {insc.pagado ? '✓ PAGADO' : '✕ DEBE PAGO'}
                          </span>
                        </div>
                      </div>

                      {/* ICONOS DE ACCIÓN */}
                      <div style={styles.actionIcons}>
                        {/* ICONO DE BOTÓN DE PAGO (BILLETE) */}
                        <button 
                          onClick={() => togglePagoMutation.mutate({ inscripcionId: insc.id, pagado: !insc.pagado })}
                          disabled={togglePagoMutation.isLoading}
                          title={insc.pagado ? 'Marcar como pendiente de pago' : 'Marcar como pagado'}
                          style={{
                            ...styles.iconActionBtn,
                            backgroundColor: insc.pagado ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: insc.pagado ? '#39FF14' : 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          💵
                        </button>

                        {/* ICONO DE WHATSAPP / CONTACTO */}
                        <button 
                          onClick={() => abriendoWhatsApp(insc.telefono1 || insc.telefono2)}
                          title="Contactar por WhatsApp"
                          style={{
                            ...styles.iconActionBtn,
                            backgroundColor: 'rgba(37, 211, 102, 0.15)',
                            borderColor: 'rgba(37, 211, 102, 0.4)'
                          }}
                        >
                          💬
                        </button>

                        {/* ICONO DE OJO (RESTRICCIONES) */}
                        <button 
                          onClick={() => setInscripcionSeleccionada(insc)}
                          title={tieneRestricciones ? "Ver restricciones horarias" : "Sin restricciones"}
                          style={{
                            ...styles.iconActionBtn,
                            backgroundColor: tieneRestricciones ? 'rgba(255, 159, 10, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: tieneRestricciones ? '#FF9F0A' : 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  );
                })
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
                          value={resultados[partido.id] || ''}
                          onChange={(e) => handleResultadoChange(partido.id, e.target.value)}
                          placeholder="Ej: 6-3 / 6-4 o W.O. P1"
                          style={styles.inputResultado}
                        />
                        <button
                          type="button"
                          onClick={() => handleGuardarResultado(partido.id)}
                          disabled={guardandoPartidoId === partido.id}
                          style={{ ...styles.btnPrimario, opacity: guardandoPartidoId === partido.id ? 0.6 : 1 }}
                        >
                          {guardandoPartidoId === partido.id ? 'Guardando...' : 'Guardar resultado'}
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

      {/* ─── MODAL DE RESTRICCIONES HORARIAS & DATOS DE CONTACTO ─── */}
      {inscripcionSeleccionada && (
        <div style={styles.modalOverlay} onClick={() => setInscripcionSeleccionada(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Detalles de la Inscripción</h3>
              <button style={styles.modalCloseBtn} onClick={() => setInscripcionSeleccionada(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <span style={styles.modalLabel}>Pareja:</span>
                <p style={styles.modalValue}>{inscripcionSeleccionada.jugador1} / {inscripcionSeleccionada.jugador2}</p>
              </div>

              <div style={styles.modalSection}>
                <span style={styles.modalLabel}>Categoría:</span>
                <p style={styles.modalValue}>{inscripcionSeleccionada.categoria}</p>
              </div>

              <div style={styles.modalSection}>
                <span style={styles.modalLabel}>Estado de Pago:</span>
                <span style={{
                  ...styles.badgePago,
                  backgroundColor: inscripcionSeleccionada.pagado ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 69, 58, 0.15)',
                  color: inscripcionSeleccionada.pagado ? '#39FF14' : '#FF453A',
                  border: `1px solid ${inscripcionSeleccionada.pagado ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 69, 58, 0.3)'}`,
                  marginTop: '4px',
                  display: 'inline-block'
                }}>
                  {inscripcionSeleccionada.pagado ? '✓ PAGADO' : '✕ PENDIENTE DE PAGO'}
                </span>
              </div>

              <div style={styles.modalSection}>
                <span style={styles.modalLabel}>Restricciones Horarias:</span>
                <p style={styles.modalValueHighlight}>
                  {obtenerTextoRestricciones(inscripcionSeleccionada)}
                </p>
              </div>
              <div style={styles.modalSection}>
                <span style={styles.modalLabel}>Contactos WhatsApp:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  {inscripcionSeleccionada.telefono1 && (
                    <button 
                      onClick={() => abriendoWhatsApp(inscripcionSeleccionada.telefono1)}
                      style={styles.btnWhatsappModal}
                    >
                      💬 Contactar a {inscripcionSeleccionada.jugador1} ({inscripcionSeleccionada.telefono1})
                    </button>
                  )}
                  {inscripcionSeleccionada.telefono2 && (
                    <button 
                      onClick={() => abriendoWhatsApp(inscripcionSeleccionada.telefono2)}
                      style={styles.btnWhatsappModal}
                    >
                      💬 Contactar a {inscripcionSeleccionada.jugador2} ({inscripcionSeleccionada.telefono2})
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button style={styles.btnCerrarModal} onClick={() => setInscripcionSeleccionada(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GestionTorneoScreen;