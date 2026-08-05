// src/screens/TorneoDetalleScreen.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { resolverUrlImagen } from '../services/imageHelper';
import { torneoService } from '../services/torneoService';
import { styles } from './TorneoDetalleScreen.styles';

const TorneoDetalleScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  
  const [pestanaActiva, setPestanaActiva] = useState('cronograma');
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [filtroGaleria, setFiltroGaleria] = useState('Todo');
  const [archivoGaleria, setArchivoGaleria] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mensajeGaleria, setMensajeGaleria] = useState(null);
  const fileInputRef = useRef(null);

  // 1. Traemos el torneo específico desde el backend usando React Query
  const { data: torneo, isLoading, isError } = useQuery({
    queryKey: ['torneo', id],
    queryFn: async () => {
      const res = await API.get(`/torneos/${id}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

  const yaInscripto = torneo?.inscripciones?.some(insc =>
    insc.jugador1Id === usuario?.id || insc.jugador2Id === usuario?.id
  );

  // 2. Generar días dinámicos entre fechaInicio y fechaFin
  const generarFechasTorneo = (inicio, fin) => {
    if (!inicio || !fin) return [];
    
    const lista = [];
    const fechaActual = new Date(inicio + 'T00:00:00');
    const fechaFinal = new Date(fin + 'T00:00:00');
    
    const opcionesDia = { weekday: 'short' }; // "vie", "sáb"
    const opcionesNum = { day: 'numeric', month: 'short' }; // "7 ago"
    const opcionesCompleto = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

    while (fechaActual <= fechaFinal) {
      const idString = fechaActual.toISOString().split('T')[0]; // "2026-07-03"
      
      lista.push({
        id: idString,
        diaText: fechaActual.toLocaleDateString('es-AR', opcionesDia).replace('.', ''),
        numText: fechaActual.toLocaleDateString('es-AR', opcionesNum),
        title: fechaActual.toLocaleDateString('es-AR', opcionesCompleto)
      });
      
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return lista;
  };

  const fechasDinamicas = torneo ? generarFechasTorneo(torneo.fechaInicio, torneo.fechaFin) : [];

  // Establecer por defecto el primer día del torneo cuando los datos carguen
  useEffect(() => {
    if (fechasDinamicas.length > 0 && !diaSeleccionado) {
      setDiaSeleccionado(fechasDinamicas[0].id);
    }
  }, [torneo, fechasDinamicas, diaSeleccionado]);

  if (isLoading) return (
    <div style={styles.centerContainer}>
      <div style={styles.spinner}></div>
    </div>
  );

  if (isError || !torneo) return (
    <div style={styles.centerContainer}>
      <div style={styles.alerta}>
        <p style={{ color: '#ff4d4d', fontWeight: 'bold', margin: 0 }}>Torneo no encontrado o error de carga.</p>
        <button onClick={() => navigate(-1)} style={styles.btnVolver}>Volver atrás</button>
      </div>
    </div>
  );

  const zonasDisponibles = torneo?.zonas || [];

  // Filtrar los partidos que pertenezcan estrictamente al día seleccionado
  const partidosDelDia = torneo.partidos 
    ? torneo.partidos.filter(partido => {
        const partidoFecha = partido.fecha ? partido.fecha.split('T')[0] : null;
        return partidoFecha === diaSeleccionado;
      })
    : [];

  const partidosPorZona = zonasDisponibles.map(zona => {
    const zonaPartidos = zona.partidos?.length > 0
      ? zona.partidos
      : torneo.partidos.filter(partido => partido.zonaId === zona.id);

    return {
      ...zona,
      partidos: zonaPartidos.map(partido => ({
        ...partido,
        pareja1: partido.pareja1 || torneo.partidos.find(p => p.id === partido.id)?.pareja1 || null,
        pareja2: partido.pareja2 || torneo.partidos.find(p => p.id === partido.id)?.pareja2 || null
      }))
    };
  });

  const fechaActivaData = fechasDinamicas.find(f => f.id === diaSeleccionado);
  const bannerImagen = resolverUrlImagen(torneo.imagenPortada || torneo.complejo?.imagenUrl || "https://images.unsplash.com/photo-1592656094267-764a4506f368?w=800");

  // Evaluar si las inscripciones están abiertas (Fecha de inicio es posterior a hoy)
  const hoyStr = new Date().toISOString().split('T')[0];
  const inscripcionesAbiertas = torneo.fechaInicio > hoyStr && torneo.estado !== 'finalizado';

  const imagenesGaleria = torneo?.imagenes || [];
  const imagenesFiltradas = imagenesGaleria.filter(img => filtroGaleria === 'Todo' || filtroGaleria === 'Fotos');

  const esOrganizador = usuario?.id && torneo?.organizadorId && usuario.id === torneo.organizadorId;

  const handleArchivoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setArchivoGaleria(file);
      setMensajeGaleria(null);
    }
  };

  const handleSubirImagen = async () => {
    if (!archivoGaleria) {
      setMensajeGaleria({ tipo: 'error', texto: 'Seleccioná una imagen primero.' });
      return;
    }

    try {
      setSubiendoImagen(true);
      await torneoService.subirImagenGaleria(id, archivoGaleria);
      setArchivoGaleria(null);
      setMensajeGaleria({ tipo: 'success', texto: 'Imagen subida correctamente.' });
      window.location.reload();
    } catch (error) {
      console.error(error);
      setMensajeGaleria({ tipo: 'error', texto: error.response?.data?.error || 'Error al subir la imagen.' });
    } finally {
      setSubiendoImagen(false);
    }
  };

  return (
    <div style={styles.screenContainer}>
      
      {/* HEADER HERO */}
      <div style={{ ...styles.headerHero, backgroundImage: `url("${bannerImagen}")` }}>
        <div style={styles.headerOverlay}>
          
          {/* Barra Superior */}
          <div style={styles.topBar}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div style={styles.logoContainer}>
              <img src="/logo-adn-padel.png" alt="ADN Padel" style={styles.logoIcon} onError={(e) => { e.target.style.display = 'none'; }} />
              <span style={styles.logoText}>ADN PADEL</span>
            </div>
          </div>

          {/* Títulos */}
          <div style={styles.heroTitles}>
            <span style={styles.etiquetaTorneo}>COMPETICIÓN ACTIVA</span>
            <h1 style={styles.tituloTorneo}>{torneo.nombre}</h1>
          </div>

          {/* MENÚ DE PESTAÑAS */}
          <div style={styles.tabsMenu}>
            {['fixture', 'cronograma', 'galeria'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setPestanaActiva(tab)}
                style={{
                  ...styles.tabItem,
                  ...(pestanaActiva === tab ? styles.tabItemActivo : {})
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={styles.mainContent}>

        {/* ─── PESTAÑA: CRONOGRAMA ─── */}
        {pestanaActiva === 'cronograma' && (
          <div style={styles.tabSection}>
            
            {/* Selector de Fechas Dinámico */}
            <div style={styles.dateSelectorRow}>
              {fechasDinamicas.map(f => (
                <button 
                  key={f.id}
                  onClick={() => setDiaSeleccionado(f.id)}
                  style={{
                    ...styles.datePill,
                    ...(diaSeleccionado === f.id ? styles.datePillActivo : {})
                  }}
                >
                  <span style={{ ...styles.datePillDia, ...(diaSeleccionado === f.id ? styles.textNeon : {}) }}>
                    {f.diaText.toUpperCase()}
                  </span>
                  <span style={{ ...styles.datePillNum, ...(diaSeleccionado === f.id ? styles.textNeon : {}) }}>
                    {f.numText}
                  </span>
                </button>
              ))}
            </div>

            {/* Encabezado del día seleccionado */}
            <div style={styles.dateSubtitleRow}>
              <span style={styles.dateSubtitleText}>{fechaActivaData?.title || 'Seleccione una fecha'}</span>
              <span style={styles.matchesCount}>{partidosDelDia.length} partidos</span>
            </div>

            {/* LISTA DE PARTIDOS REALES */}
            <div style={styles.matchesList}>
              {partidosDelDia.length > 0 ? (
                partidosDelDia.map((partido, index) => (
                  <div key={index} style={styles.matchCard}>
                    
                    <div style={styles.timeColumn}>
                      <span style={styles.timeText}>{partido.hora || "13:00"}</span>
                      <span style={styles.dayText}>{fechaActivaData?.diaText.toUpperCase()}</span>
                    </div>
                    
                    <div style={styles.detailsColumn}>
                      <div style={styles.badgesRow}>
                        <span style={styles.badgeEstado(partido.estado || 'programado')}>
                          {`• ${(partido.estado || 'programado').toUpperCase()}`}
                        </span>
                        <span style={styles.badgeCategoria}>{partido.categoria || torneo.categoria}</span>
                        {partido.zona?.nombre && <span style={styles.badgeZona}>{partido.zona.nombre}</span>}
                      </div>

                      <div style={styles.playersBlock}>
                        <div style={styles.playerLine}>
                          🎾 {partido.pareja1?.jugador1 || "Pareja A"} / {partido.pareja1?.jugador2 || ""}
                        </div>
                        <div style={styles.vsText}>VS</div>
                        <div style={styles.playerLine}>
                          🎾 {partido.pareja2?.jugador1 || "Pareja B"} / {partido.pareja2?.jugador2 || ""}
                        </div>
                      </div>

                      {partido.resultado && (
                        <div style={styles.resultadoRow}>
                          <span style={styles.resultadoLabel}>Resultado:</span>
                          <span style={styles.resultadoValue}>{partido.resultado}</span>
                        </div>
                      )}

                      <div style={styles.locationRow}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span style={styles.locationText}>
                          {torneo.complejo?.nombre || 'Complejo ADN'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noMatches}>
                  <span style={{ fontSize: '24px' }}>🎾</span>
                  <p style={{ marginTop: '8px' }}>No hay partidos agendados para este día.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PESTAÑA: FIXTURE ─── */}
        {pestanaActiva === 'fixture' && (
          <div style={styles.tabSection}>
            {partidosPorZona.length > 0 ? (
              partidosPorZona.map((zona) => (
                <div key={zona.id} style={styles.zonaCard}>
                  <div style={styles.zonaHeader}>
                    <div>
                      <div style={styles.zonaNombre}>{zona.nombre || 'Zona sin nombre'}</div>
                      <div style={styles.zonaCategoria}>{zona.categoria || torneo.categoria || 'Categoría general'}</div>
                    </div>
                    <div style={styles.zonaMeta}>
                      <span style={styles.zonaMetaText}>{zona.partidos?.length || 0} partido{zona.partidos?.length === 1 ? '' : 's'}</span>
                      <span style={styles.zonaMetaText}>{zona.parejas?.length || 0} pareja{zona.parejas?.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  {zona.partidos && zona.partidos.length > 0 ? (
                    <div style={styles.zonaPartidosList}>
                      {zona.partidos.map((partido) => (
                        <div key={partido.id} style={styles.matchCardNested}>
                          <div style={styles.badgesRow}>
                            <span style={styles.badgeEstado(partido.estado || 'programado')}>
                              {`• ${(partido.estado || 'programado').toUpperCase()}`}
                            </span>
                            <span style={styles.badgeCategoria}>{partido.categoria || torneo.categoria}</span>
                          </div>

                          <div style={styles.playersBlock}>
                            <div style={styles.playerLine}>
                              🎾 {partido.pareja1?.jugador1 || 'Pareja A'} / {partido.pareja1?.jugador2 || ''}
                            </div>
                            <div style={styles.vsText}>VS</div>
                            <div style={styles.playerLine}>
                              🎾 {partido.pareja2?.jugador1 || 'Pareja B'} / {partido.pareja2?.jugador2 || ''}
                            </div>
                          </div>

                          <div style={styles.locationRow}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span style={styles.locationText}>{torneo.complejo?.nombre || 'Complejo ADN'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : zona.parejas && zona.parejas.length > 0 ? (
                    <div style={styles.parejasList}>
                      {zona.parejas.map((pareja) => (
                        <div key={pareja.id} style={styles.parejaItem}>
                          <span>🎾 {pareja.jugador1} / {pareja.jugador2}</span>
                          <span style={{ color: '#8E8E93' }}>{pareja.categoria || zona.categoria}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.noMatches}>
                      <span style={{ fontSize: '24px' }}>📊</span>
                      <p style={{ marginTop: '10px' }}>No hay partidos ni parejas cargadas en esta zona.</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.noMatches}>
                <span style={{ fontSize: '32px' }}>📊</span>
                <p style={{ marginTop: '10px' }}>No hay zonas generadas todavía para este torneo.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── PESTAÑA: GALERÍA ─── */}
        {pestanaActiva === 'galeria' && (
          <div style={styles.tabSection}>
            <div style={styles.galeriaHeader}>
              <div style={styles.galeriaFiltros}>
                {['Todo', 'Fotos', 'Videos'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFiltroGaleria(f)}
                    style={{
                      ...styles.galeriaPill,
                      ...(filtroGaleria === f ? styles.galeriaPillActivo : {})
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {esOrganizador && (
              <div style={styles.uploadSection}>
                <input
                  ref={fileInputRef}
                  id="imagenGaleria"
                  type="file"
                  accept="image/*"
                  onChange={handleArchivoChange}
                  style={styles.uploadInput}
                />

                <div style={styles.uploadControls}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={styles.btnFilePicker}
                  >
                    📁 Elegir archivo
                  </button>

                  <span style={styles.fileName}>
                    {archivoGaleria ? archivoGaleria.name : 'Ningún archivo seleccionado'}
                  </span>

                  <button
                    onClick={handleSubirImagen}
                    disabled={subiendoImagen || !archivoGaleria}
                    style={{ ...styles.btnSubirImagen, opacity: (subiendoImagen || !archivoGaleria) ? 0.6 : 1 }}
                  >
                    {subiendoImagen ? 'Subiendo...' : 'Subir foto'}
                  </button>
                </div>
              </div>
            )}

            {esOrganizador && mensajeGaleria && (
              <div style={{
                ...styles.messageBox,
                backgroundColor: mensajeGaleria.tipo === 'success' ? 'rgba(57,255,20,0.12)' : 'rgba(255,75,75,0.12)',
                color: mensajeGaleria.tipo === 'success' ? '#39FF14' : '#FF6B6B'
              }}>
                {mensajeGaleria.texto}
              </div>
            )}

            <div style={styles.galeriaGrid}>
              {imagenesFiltradas.length > 0 ? imagenesFiltradas.map((imagen) => (
                <div key={imagen.id} style={styles.imageCard}>
                  <img src={resolverUrlImagen(imagen.imagenUrl)} alt={`Torneo ${torneo.nombre}`} style={styles.img} />
                  <div style={styles.imageMeta}>
                    <span>{imagen.usuario ? `${imagen.usuario.nombre} ${imagen.usuario.apellido}` : 'Subido por invitado'}</span>
                    <span>{new Date(imagen.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              )) : (
                <div style={styles.noMatches}>
                  <span style={{ fontSize: '24px' }}>📸</span>
                  <p style={{ marginTop: '8px' }}>No hay fotos en la galería todavía.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 🔥 BOTÓN PREMIUM FLOTANTE DE INSCRIPCIÓN */}
      <div style={styles.fixedActionContainer}>
        {yaInscripto ? (
          <div style={styles.badgeInscripto}>
            ✅ Ya estás inscripto en este torneo
          </div>
        ) : inscripcionesAbiertas ? (
          <button 
            onClick={() => navigate(`/torneos/${torneo.id}/inscribirse`)}
            style={styles.btnInscribirse}
          >
            <span>Inscribirme al Torneo</span>
            <span style={styles.precioBadge}>${torneo.precioInscripcion || '0'}</span>
          </button>
        ) : (
          <div style={styles.badgeCerrado}>
            🔒 Inscripciones cerradas o torneo en curso
          </div>
        )}
      </div>

    </div>
  );
};

// --- ARQUITECTURA DE ESTILOS PREMIUM ---
;

export default TorneoDetalleScreen;