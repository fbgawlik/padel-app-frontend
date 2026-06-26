// src/screens/DashboardScreen.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';

const BACKEND_URL = 'https://padel-api-backend-production.up.railway.app'; 

const DashboardScreen = () => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate(); 

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardDatos'], 
    queryFn: async () => {
      // Agregamos el endpoint de torneos a la consulta inicial
      const [resComplejos, resPartidos, resTorneos] = await Promise.all([
        API.get('/complejos'),
        API.get('/turnos/partidos-abiertos'),
        API.get('/torneos')
      ]);
      return {
        complejos: resComplejos.data,
        partidosAbiertos: resPartidos.data,
        torneos: resTorneos.data
      };
    }
  });

  const complejos = data?.complejos || [];
  const partidosAbiertos = data?.partidosAbiertos || [];
  const torneosActivos = data?.torneos || [];
  const loading = isLoading;
  const error = isError ? "No se pudieron cargar algunos datos del panel." : "";

  const handleUnirsePartido = async (partidoId) => {
    try {
      const res = await API.post(`/turnos/${partidoId}/inscripciones`);
      alert(res.data.message);
      refetch(); 
    } catch (err) {
      alert(err.response?.data?.error || "Error al unirse al partido.");
    }
  };

  return (
    <div style={styles.contenedorPadre}>
      
      {/* CABECERA BIENVENIDA */}
      <div style={styles.headerPremium}>
        <div style={styles.headerInfo}>
          <h1 style={styles.tituloBienvenida}>
            Hola, <span style={styles.nombreResaltado}>{usuario?.nombre || 'Jugador'}</span> 👋
          </h1>
          <p style={styles.subtituloPremium}>
            {usuario?.rol === 'admin_complejo' || usuario?.rol === 'profesor' 
              ? 'Panel de gestión profesional para tu club.'
              : 'Preparate para tu próximo desafío. Reservá canchas y sumate a partidos abiertos.'}
          </p>
        </div>
        <button onClick={logout} style={styles.botonLogout}>Cerrar Sesión</button>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ color: '#8A8A8A', margin: 0, fontWeight: '600' }}>Cargando ecosistema ADN Pádel...</p>
        </div>
      )}

      {error && !loading && (
        <div style={styles.alerta}><span>⚠️ {error}</span></div>
      )}

      {!loading && (
        <>
          {/* ========================================== */}
          {/* GRILLA SUPERIOR: 2 COLUMNAS ESTRICTAS */}
          {/* ========================================== */}
          <div style={styles.topCardsGrid}>
            
            {/* 🟦 TARJETA 1: PARTIDOS ABIERTOS (Izquierda) */}
            <div style={styles.summaryCard}>
              <div style={styles.cardHeaderArea}>
                <h3 style={styles.summaryCardTitle}>PARTIDOS<br/>ABIERTOS</h3>
              </div>

              <div style={styles.listaPartidosScroll}>
                {partidosAbiertos.length > 0 ? (
                  partidosAbiertos.map((partido) => {
                    const jugadoresAnotados = partido.inscripcionesPartido?.length || 0;
                    const lugaresLibres = 4 - jugadoresAnotados; 
                    const estaLleno = lugaresLibres <= 0;

                    return (
                      <div key={partido.id} style={styles.tarjetaAdentro}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ 
                            ...styles.badgeCupos, 
                            backgroundColor: estaLleno ? 'rgba(255, 51, 51, 0.12)' : 'rgba(0, 255, 102, 0.12)',
                            color: estaLleno ? '#ff4d4d' : '#00ff66'
                          }}>
                            {estaLleno ? 'Lleno' : `Faltan ${lugaresLibres}`}
                          </span>
                          <span style={{ color: '#8A8A8A', fontSize: '10px', fontWeight: '500' }}>
                            {partido.fechaFormateada || partido.fecha}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ fontSize: '16px', backgroundColor: '#1A1A1A', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎾</div>
                          <div>
                            <h3 style={{ color: '#fff', margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700' }}>
                              {partido.horaInicio?.slice(0,5) || partido.hora} hs
                            </h3>
                            <p style={{ color: '#8A8A8A', margin: 0, fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                              {partido.cancha?.complejo?.nombre || 'Complejo'}
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleUnirsePartido(partido.id)}
                          disabled={estaLleno}
                          style={{ 
                            ...styles.botonAccionInterno,
                            backgroundColor: estaLleno ? 'rgba(255,255,255,0.05)' : '#00ff66', 
                            color: estaLleno ? '#555' : '#000', 
                            cursor: estaLleno ? 'not-allowed' : 'pointer',
                          }}>
                          {estaLleno ? 'Cerrado' : '¡Me anoto!'}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p style={styles.summaryCardText}>No hay partidos abiertos.</p>
                )}
              </div>

              <div style={styles.cardFooterArea}>
                <button style={styles.verMasBtn} onClick={() => navigate('/turnos')}>
                  VER MAS &gt;
                </button>
              </div>
            </div>

            {/* 🟦 TARJETA 2: TORNEOS ACTIVOS (Derecha) */}
            <div style={styles.summaryCard}>
              <div style={styles.cardHeaderArea}>
                <h3 style={styles.summaryCardTitle}>TORNEOS<br/>ACTIVOS</h3>
              </div>
              
              <div style={styles.listaPartidosScroll}>
                {torneosActivos.length > 0 ? (
                  torneosActivos.map((torneo) => {
                    // Lógica para calcular cupos replicada de TorneosScreen.jsx
                    const arrayCategoriasVisuales = torneo.categoria ? torneo.categoria.split(' | ') : [];
                    const totalInscriptos = torneo.inscripciones?.length || 0;
                    const cupoMaxPorCategoria = torneo.cupoParejas || 16;
                    const cupoMaxTotal = cupoMaxPorCategoria * arrayCategoriasVisuales.length;
                    const lugaresLibres = cupoMaxTotal - totalInscriptos;
                    const torneoLleno = lugaresLibres <= 0;

                    return (
                      <div key={torneo.id} style={styles.tarjetaAdentro}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ 
                            ...styles.badgeCupos, 
                            backgroundColor: torneoLleno ? 'rgba(255, 51, 51, 0.12)' : 'rgba(0, 255, 102, 0.12)',
                            color: torneoLleno ? '#ff4d4d' : '#00ff66'
                          }}>
                            {torneoLleno ? 'Agotado' : `${lugaresLibres} cupos`}
                          </span>
                          <span style={{ color: '#8A8A8A', fontSize: '10px', fontWeight: '500' }}>
                            {torneo.fechaInicio.slice(5)} // Muestra solo el mes y día
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ fontSize: '16px', backgroundColor: '#1A1A1A', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏆</div>
                          <div>
                            <h3 style={{ color: '#fff', margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                              {torneo.nombre}
                            </h3>
                            <p style={{ color: '#8A8A8A', margin: 0, fontSize: '10px' }}>
                              ${torneo.precioInscripcion} x Pareja
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => navigate('/torneos')}
                          style={{ 
                            ...styles.botonAccionInterno,
                            backgroundColor: 'transparent', 
                            color: '#00ff66', 
                            border: '1px solid rgba(0, 255, 102, 0.3)',
                            cursor: 'pointer',
                          }}>
                          Ver Torneo
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p style={styles.summaryCardText}>No hay torneos activos en este momento.</p>
                )}
              </div>

              <div style={styles.cardFooterArea}>
                <button style={styles.verMasBtn} onClick={() => navigate('/torneos')}>
                  VER MAS &gt;
                </button>
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* COMPLEJOS DISPONIBLES */}
          {/* ========================================== */}
          <div style={{ marginTop: '20px' }}>
            {complejos.length === 0 ? (
              <p style={{ color: '#8A8A8A' }}>No hay complejos registrados actualmente.</p>
            ) : (
              <div style={styles.listaComplejos}>
                {complejos.map((club) => {
                  const urlFoto = club.imagenUrl 
                    ? (club.imagenUrl.startsWith('http') ? club.imagenUrl : `${BACKEND_URL}${club.imagenUrl}`)
                    : null;

                  return (
                    <div key={club.id} style={styles.tarjetaComplejoTarget}>
                      <div style={styles.contenedorImagenTarget}>
                        {urlFoto ? (
                          <img src={urlFoto} alt={club.nombre} style={styles.imagenClubTarget} />
                        ) : (
                          <div style={styles.placeholderImagenTarget}>IMG URL</div>
                        )}
                      </div>

                      <div style={styles.infoClubContainerTarget}>
                        <h4 style={styles.tituloInfoComplejo}>INFORMACION DEL COMPLEJO</h4>
                        <p style={styles.descripcionComplejo}>
                          <strong style={{color: '#1A1A1A'}}>{club.nombre}:</strong> {club.direccion || 'Ubicación céntrica'}. <br/>
                          Cuenta con {club.canchas?.length || 0} canchas, vestuarios y servicios.
                        </p>
                        
                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => navigate(`/reservar/${club.id}`)}
                            style={styles.botonVer}>
                            Reservar Cancha
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  contenedorPadre: { padding: '20px', backgroundColor: '#0a0a0a', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  headerPremium: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: '#1A1A1A', padding: '20px', borderRadius: '16px' },
  headerInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  tituloBienvenida: { fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: 0 },
  nombreResaltado: { color: '#00ff66' },
  subtituloPremium: { fontSize: '12px', color: '#8A8A8A', margin: 0 },
  botonLogout: { backgroundColor: 'rgba(255, 51, 51, 0.1)', border: 'none', color: '#ff4d4d', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  
  // GRILLA SUPERIOR CORREGIDA: Fuerza siempre 2 columnas
  topCardsGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', // <-- Esto es lo que las pone una al lado de la otra
    gap: '12px',
    alignItems: 'stretch' // Hace que las dos midan exactamente el mismo alto
  },
  
  summaryCard: { 
    backgroundColor: '#0a0a0a', 
    borderRadius: '20px', 
    padding: '16px', 
    display: 'flex', 
    flexDirection: 'column', 
    height: '320px', // Alto fijo para que no se deformen 
    border: '1px solid #2aff00'
  },
  cardHeaderArea: { 
    marginBottom: '10px',
    textAlign: 'center'
  },
  summaryCardTitle: { 
    color: '#2efb00', 
    fontSize: '16px', 
    fontWeight: '800', 
    margin: '0', 
    textTransform: 'uppercase', 
    lineHeight: '1.2' 
  },
  cardFooterArea: {
    marginTop: 'auto',
    textAlign: 'center',
    paddingTop: '10px'
  },
  verMasBtn: { 
    background: 'none', 
    border: 'none', 
    color: '#00A843', 
    fontWeight: '800', 
    fontSize: '14px', 
    padding: '0', 
    cursor: 'pointer' 
  },

  // LISTA INTERNA SCROLLEABLE (Para no romper las columnas)
  listaPartidosScroll: { 
    flex: 1, 
    overflowY: 'auto', // Permite hacer scroll interno si hay muchos partidos
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px',
    paddingRight: '4px' // Espacio para la barra de scroll
  },
  summaryCardText: { color: '#333', fontSize: '14px', margin: 0, lineHeight: '1.4', fontWeight: '500', textAlign: 'center', marginTop: '20px' },

  // TARJETA DE PARTIDO (Adaptada para caber en la mitad de la pantalla)
  tarjetaPartidoAdentro: { 
    backgroundColor: '#1A1A1A', 
    borderRadius: '12px', 
    padding: '12px', 
    border: '1px solid rgba(255,255,255,0.05)' 
  },
  badgeCupos: { fontSize: '9px', fontWeight: '700', padding: '4px 8px', borderRadius: '20px' },
  botonAnotarse: { width: '100%', padding: '8px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', marginTop: '4px' },

  // Complejos (Estilo Blanco/Verde de la imagen)
  listaComplejos: { display: 'flex', flexDirection: 'column', gap: '20px' },
  tarjetaComplejoTarget: { backgroundColor: '#030000', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #7bf700' },
  contenedorImagenTarget: { height: '120px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #1A1A1A', margin: '8px', borderRadius: '12px' },
  imagenClubTarget: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' },
  placeholderImagenTarget: { color: '#ebef00', fontSize: '16px', fontWeight: '600' },
  infoClubContainerTarget: { padding: '0 16px 16px 16px' },
  tituloInfoComplejo: { color: '#ffffff', fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0' },
  descripcionComplejo: { color: '#ffffff', fontSize: '13px', margin: 0, lineHeight: '1.4', fontWeight: '500' },
  botonVer: { backgroundColor: '#00ff66', color: '#040a06', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },

  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px', gap: '16px' },
  spinner: { width: '40px', height: '40px', border: '4px solid rgba(0, 255, 102, 0.1)', borderTop: '4px solid #00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  alerta: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', fontWeight: '600' },
};

export default DashboardScreen;