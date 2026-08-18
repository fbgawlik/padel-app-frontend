import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './TorneoDetalleScreen.styles';

const TorneoDetalleScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  const [pestanaActiva, setPestanaActiva] = useState('fixture');
  const [subTabActiva, setSubTabActiva] = useState('cronograma');
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('');

  const { data: torneo, isLoading, isError } = useQuery({
    queryKey: ['torneo', id],
    queryFn: async () => {
      const res = await API.get(`/torneos/${id}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

  const categoriasDisponibles = torneo?.categoria
    ? torneo.categoria.split(/[|/]+/).map((cat) => cat.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    if (!categoriaActiva && categoriasDisponibles.length > 0) {
      setCategoriaActiva(categoriasDisponibles[0]);
    }
  }, [categoriaActiva, categoriasDisponibles]);

  const yaInscripto = torneo?.inscripciones?.some(
    (insc) => insc.jugador1Id === usuario?.id || insc.jugador2Id === usuario?.id
  );

  const generarFechasTorneo = (inicio, fin) => {
    if (!inicio || !fin) return [];

    const lista = [];
    const fechaActual = new Date(inicio + 'T00:00:00');
    const fechaFinal = new Date(fin + 'T00:00:00');

    while (fechaActual <= fechaFinal) {
      const idString = fechaActual.toISOString().split('T')[0];
      lista.push({
        id: idString,
        diaText: fechaActual.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', ''),
        numText: fechaActual.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
        title: fechaActual.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      });
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return lista;
  };

  const fechasDinamicas = torneo ? generarFechasTorneo(torneo.fechaInicio, torneo.fechaFin) : [];

  useEffect(() => {
    if (fechasDinamicas.length > 0 && !diaSeleccionado) {
      setDiaSeleccionado(fechasDinamicas[0].id);
    }
  }, [fechasDinamicas, diaSeleccionado]);

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (isError || !torneo) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.alerta}>
          <p style={{ color: '#FFF', fontWeight: '700', margin: 0 }}>Torneo no encontrado o error de carga.</p>
          <button onClick={() => navigate(-1)} style={styles.btnVolver}>Volver atrás</button>
        </div>
      </div>
    );
  }

  // Filtrado de partidos según la respuesta de la API
  const partidosDelDia = torneo.partidos
    ? torneo.partidos.filter((partido) => {
        const partidoFecha = partido.fecha ? partido.fecha.split('T')[0] : null;
        return partidoFecha === diaSeleccionado;
      })
    : [];

  const bannerImagen = resolverUrlImagen(
    torneo.imagenPortada || torneo.complejo?.imagenUrl
  );

  const hoyStr = new Date().toISOString().split('T')[0];
  const inscripcionesAbiertas = torneo.fechaInicio > hoyStr && torneo.estado !== 'finalizado';

  // Datos reales obtenidos de la API
  const zonasActivas = torneo.zonas || [];
  const crucesActivos = torneo.cruces || [];

  return (
    <div style={styles.screenContainer}>
      <div style={{ ...styles.headerHero, backgroundImage: bannerImagen ? `url("${bannerImagen}")` : 'none', backgroundColor: '#121214' }}>
        <div style={styles.headerOverlay}>
          <div style={styles.topBar}>
            <button onClick={() => navigate(-1)} style={styles.backButton} type="button" aria-label="Volver">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div style={styles.logoContainer}>
              <img src="/logo-adn-padel.png" alt="ADN Padel" style={styles.logoIcon} onError={(e) => { e.target.style.display = 'none'; }} />
              <span style={styles.logoText}>ADN PADEL</span>
            </div>
          </div>

          <div style={styles.heroTitles}>
            <span style={styles.etiquetaTorneo}>{torneo.estado ? torneo.estado.toUpperCase() : 'COMPETICIÓN'}</span>
            <h1 style={styles.tituloTorneo}>{torneo.nombre?.toUpperCase()}</h1>
          </div>

          <div style={styles.tabsMenu}>
            {['fixture', 'cronograma'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPestanaActiva(tab)}
                style={{
                  ...styles.tabItem,
                  ...(pestanaActiva === tab ? styles.tabItemActivo : {})
                }}
              >
                {tab === 'fixture' ? 'FIXTURE' : 'CRONOGRAMA'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {pestanaActiva === 'fixture' && (
          <>
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <div style={styles.infoIconWrap}><span style={styles.infoIcon}>📅</span></div>
                <span style={styles.infoLabel}>Fechas</span>
                <span style={styles.infoValue}>{torneo.fechaInicio} • {torneo.fechaFin}</span>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.infoIconWrap}><span style={styles.infoIcon}>📍</span></div>
                <span style={styles.infoLabel}>Sede</span>
                <span style={styles.infoValue}>{torneo.complejo?.nombre || 'Sin sede asignada'}</span>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.infoIconWrap}><span style={styles.infoIcon}>👥</span></div>
                <span style={styles.infoLabel}>Inscriptos</span>
                <span style={styles.infoValue}>{torneo.inscripciones?.length || 0}</span>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.infoIconWrap}><span style={styles.infoIcon}>🏆</span></div>
                <span style={styles.infoLabel}>Formato</span>
                <span style={styles.infoValue}>{torneo.formato || 'Zonas/Eliminatorias'}</span>
              </div>
            </div>

            <div style={styles.sectionHeaderRow}>
              <h2 style={styles.sectionTitle}>CATEGORÍAS</h2>
            </div>

            <div style={styles.categoryList}>
              {categoriasDisponibles.length > 0 ? (
                categoriasDisponibles.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    onClick={() => {
                      setCategoriaActiva(categoria);
                      setPestanaActiva('cronograma');
                      setSubTabActiva('cronograma');
                    }}
                    style={styles.categoryCard}
                  >
                    <div style={styles.categoryLeft}>
                      <span style={styles.categoryIcon}>🏟️</span>
                      <div style={styles.categoryTextWrap}>
                        <span style={styles.categoryTitle}>{categoria}</span>
                      </div>
                    </div>

                    <div style={styles.categoryAction}>
                      <span style={styles.categoryActionText}>VER</span>
                      <span style={styles.categoryActionArrow}>›</span>
                    </div>
                  </button>
                ))
              ) : (
                <div style={styles.emptyStateContainer}>
                  <p>No hay categorías registradas en este torneo.</p>
                </div>
              )}
            </div>
          </>
        )}

        {pestanaActiva === 'cronograma' && (
          <div style={styles.detailPanel}>
            <div style={styles.categoryHeaderRow}>
              <div style={styles.categoryTitleBlock}>
                <h2 style={styles.categoryHeading}>{categoriaActiva || 'General'}</h2>
              </div>
              <span style={styles.statusBadge}>{torneo.estado ? torneo.estado.toUpperCase() : 'EN CURSO'}</span>
            </div>

            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>⌕</span>
              <input type="text" placeholder="Buscá tu apellido o pareja..." style={styles.searchInput} />
            </div>

            <div style={styles.subTabsRow}>
              {['cronograma', 'zonas', 'cruces'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSubTabActiva(tab)}
                  style={{
                    ...styles.subTabButton,
                    ...(subTabActiva === tab ? styles.subTabButtonActive : {})
                  }}
                >
                  {tab === 'cronograma' ? 'Cronograma' : tab === 'zonas' ? 'Zonas' : 'Cruces'}
                </button>
              ))}
            </div>

            {subTabActiva === 'cronograma' && (
              <>
                {fechasDinamicas.length > 0 && (
                  <div style={styles.chipRow}>
                    {fechasDinamicas.map((fecha) => (
                      <button
                        key={fecha.id}
                        type="button"
                        onClick={() => setDiaSeleccionado(fecha.id)}
                        style={{
                          ...styles.chip,
                          ...(diaSeleccionado === fecha.id ? styles.chipActive : {})
                        }}
                      >
                        {fecha.diaText} {fecha.numText}
                      </button>
                    ))}
                  </div>
                )}

                <div style={styles.matchList}>
                  {partidosDelDia.length > 0 ? (
                    partidosDelDia.map((partido, index) => (
                      <div key={partido.id || `${partido.hora}-${index}`} style={styles.matchCardDetail}>
                        <div style={styles.timeColumnDetail}>
                          <span style={styles.timeDetail}>{partido.hora || '--:--'}</span>
                        </div>

                        <div style={styles.matchContent}>
                          <div style={styles.badgeRowDetail}>
                            <span style={styles.stateBadge}>{partido.estado || 'Programado'}</span>
                          </div>

                          <div style={styles.teamsRow}>
                            <div style={styles.teamGroup}>
                              <span style={styles.teamLabel}>A</span>
                              <span style={styles.teamName}>{partido.pareja1 || partido.nombre1 || 'Sin definir'}</span>
                            </div>
                            <div style={styles.scoreGroup}>
                              <span style={styles.scoreValue}>{partido.resultado ? partido.resultado.split('-')[0] : '-'}</span>
                              <span style={styles.scoreSeparator}>:</span>
                              <span style={styles.scoreValue}>{partido.resultado ? partido.resultado.split('-')[1] : '-'}</span>
                            </div>
                          </div>

                          <div style={styles.teamsRow}>
                            <div style={styles.teamGroup}>
                              <span style={styles.teamLabel}>B</span>
                              <span style={styles.teamName}>{partido.pareja2 || partido.nombre2 || 'Sin definir'}</span>
                            </div>
                          </div>

                          <div style={styles.matchFooter}>
                            <span style={styles.locationIcon}>📍</span>
                            <span style={styles.locationTextDetail}>{partido.ubicacion || 'Sin cancha asignada'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyStateContainer}>
                      <p>No hay partidos programados para este día.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {subTabActiva === 'zonas' && (
              <div style={styles.zonesList}>
                {zonasActivas.length > 0 ? (
                  zonasActivas.map((zona) => (
                    <div key={zona.id || zona.nombre} style={styles.zoneCard}>
                      <div style={styles.zoneHeader}>
                        <span style={styles.zoneTitle}>{zona.nombre}</span>
                      </div>

                      <div style={styles.positionsTable}>
                        <div style={styles.positionsHeader}>
                          <span style={styles.tableLabel}>Pareja</span>
                          <span style={styles.tableLabelRight}>Puntos</span>
                        </div>

                        {(zona.parejas || []).map((pareja) => (
                          <div key={pareja.id || pareja.nombre} style={styles.positionRow}>
                            <span style={styles.parejaName}>{pareja.nombre || `${pareja.jugador1} / ${pareja.jugador2}`}</span>
                            <span style={styles.puntosValue}>{pareja.puntos ?? 0}</span>
                          </div>
                        ))}
                      </div>

                      {zona.partidos?.length > 0 && (
                        <div style={styles.zoneMatchesList}>
                          {zona.partidos.map((partido) => (
                            <div key={partido.id || `${partido.nombre1}-${partido.nombre2}`} style={styles.zoneMatchItem}>
                              <span style={styles.locationPin}>📍</span>
                              <div style={styles.zoneMatchTextWrap}>
                                <span style={styles.zoneMatchTeams}>
                                  {partido.nombre1 || partido.pareja1} vs {partido.nombre2 || partido.pareja2}
                                </span>
                                <span style={styles.zoneMatchMeta}>
                                  {partido.hora || ''} {partido.ubicacion ? `• ${partido.ubicacion}` : ''}
                                </span>
                              </div>
                              <span style={styles.zoneResult}>{partido.resultado || 'Pendiente'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyStateContainer}>
                    <p>No hay zonas configuradas para este torneo.</p>
                  </div>
                )}
              </div>
            )}

            {subTabActiva === 'cruces' && (
              <div style={styles.bracketWrap}>
                {crucesActivos.length > 0 ? (
                  <div style={styles.bracketBoard}>
                    {crucesActivos.map((cruce) => (
                      <div key={cruce.id} style={styles.bracketNode}>
                        <span style={styles.nodeMeta}>{cruce.fechaHora || 'Por definir'}</span>
                        <span style={styles.nodeState}>{cruce.estado || 'Programado'}</span>
                        <span style={styles.nodeTeam}>{cruce.pareja1 || 'TBD'}</span>
                        <span style={styles.nodeTeam}>{cruce.pareja2 || 'TBD'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyStateContainer}>
                    <p>Los cruces de eliminatoria aún no están disponibles.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.actionFooter}>
        {yaInscripto ? (
          <div style={styles.badgeInscripto}>✅ Ya estás inscripto en este torneo</div>
        ) : inscripcionesAbiertas ? (
          <button onClick={() => navigate(`/torneos/${torneo.id}/inscribirse`)} style={styles.btnInscribirse} type="button">
            <span>Inscribirme al Torneo</span>
            <span style={styles.precioBadge}>${torneo.precioInscripcion || '0'}</span>
          </button>
        ) : (
          <div style={styles.badgeCerrado}>🔒 Inscripciones cerradas o torneo en curso</div>
        )}
      </div>
    </div>
  );
};

export default TorneoDetalleScreen;