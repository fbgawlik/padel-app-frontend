// src/screens/DashboardScreen.jsx
// ───────────────────────────────────────────────────────────
// Refactor v2: agrega tarjeta de nivel/progreso y grilla de
// acciones rápidas. Mantiene TODA la lógica de React Query y
// la API intacta.
// ───────────────────────────────────────────────────────────
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../context/NotificationContext';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './DashboardScreen.styles';

const DashboardScreen = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotification();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardDatos'],
    queryFn: async () => {
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

  // 🛠️ Verificar si un evento ya pasó
  const esFechaFutura = (fechaEvento, horaEvento) => {
    try {
      const ahora = new Date();
      const fechaLimpia = fechaEvento.split('T')[0];
      const horaLimpia = horaEvento ? horaEvento.slice(0, 5) : "00:00";
      const momentoEvento = new Date(`${fechaLimpia}T${horaLimpia}:00`);
      return momentoEvento > ahora;
    } catch (e) {
      return true;
    }
  };

  const complejos = data?.complejos || [];

  // 🔥 Filtrado en tiempo real
  const partidosAbiertos = (data?.partidosAbiertos || []).filter(p =>
    esFechaFutura(p.fecha, p.horaInicio || p.hora)
  );

  const torneosActivos = (data?.torneos || []).filter(t =>
    esFechaFutura(t.fechaInicio, "00:00")
  );

  const loading = isLoading;
  const error = isError ? "No se pudieron cargar algunos datos del panel." : "";

  const handleUnirsePartido = async (partidoId) => {
    try {
      const res = await API.post(`/turnos/${partidoId}/inscripciones`);
      mostrarNotificacion(res.data.message, 'success');
      refetch();
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || "Error al unirse al partido.", 'error');
    }
  };

  // Datos de nivel (mockeado desde el usuario; ajustar a tu API si tenés endpoints de nivel)
  const partidosJugados = usuario?.partidosJugados || 24;
  const nivel = usuario?.nivel || 3;
  const progresoNivel = usuario?.progresoNivel || 62;

  // Acciones rápidas en grilla (reemplaza las píldoras horizontales)
  const accionesRapidas = [
    { nombre: 'Reservar', icono: '📅', ruta: '/turnos', destacar: true },
    { nombre: 'Partidos', icono: '🎾', ruta: '/turnos' },
    { nombre: 'Clases', icono: '🎓', ruta: '/clases' },
    { nombre: 'Tienda', icono: '🛍️', ruta: '/tienda' },
  ];

  const categorias = [
    { nombre: 'Torneos', icono: '🏆', ruta: '/torneos' },
    { nombre: 'Ranking', icono: '🏅', ruta: '/ranking' },
  ];

  return (
    <div style={styles.contenedorPadre}>

      {/* CABECERA */}
      <div style={styles.headerPremium}>
        <div>
          <p style={styles.subtituloPremium}>Bienvenido de vuelta,</p>
          <h1 style={styles.tituloBienvenida}>
            {usuario?.nombre || 'Jugador'} <span style={{ fontSize: '24px' }}>👋</span>
          </h1>
        </div>

        {usuario?.rol === 'admin_complejo' ? (
          <button onClick={() => navigate('/gestion-complejo')} style={styles.botonAdmin}>
            ⚙️ Mi Club
          </button>
        ) : (
          <div
            style={styles.avatarMiniatura}
            onClick={() => navigate('/perfil')}
            role="button"
            tabIndex={0}
          >
            {usuario?.imagenPerfil ? (
              <img
                src={resolverUrlImagen(usuario.imagenPerfil)}
                alt="Perfil"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'
            )}
          </div>
        )}
      </div>

      {/* TARJETA DE NIVEL / PROGRESO (nueva) */}
      <div style={styles.tarjetaNivel}>
        <div style={styles.tarjetaNivelGlow} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <p style={styles.nivelLabel}>Nivel {nivel}</p>
            <p style={styles.nivelTitulo}>
              {partidosJugados} <span style={styles.nivelTituloChico}>partidos jugados</span>
            </p>
          </div>
          <div style={styles.nivelIcono}>🔥</div>
        </div>
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <div style={styles.progresoHeader}>
            <span style={styles.progresoLabel}>Progreso al nivel {nivel + 1}</span>
            <span style={styles.progresoValor}>{progresoNivel}%</span>
          </div>
          <div style={styles.progresoTrack}>
            <div
              style={{ ...styles.progresoFill, width: `${progresoNivel}%` }}
            />
          </div>
        </div>
      </div>

      {/* GRILLA DE ACCIONES RÁPIDAS (nueva) */}
      <div style={styles.grillaAcciones}>
        {accionesRapidas.map((cat) => (
          <button
            key={cat.nombre}
            style={styles.accionRapida}
            onClick={() => navigate(cat.ruta)}
          >
            <span style={{ ...styles.accionRapidaIcono, ...(cat.destacar ? styles.accionRapidaIconoDestacado : {}) }}>
              {cat.icono}
            </span>
            <span style={styles.accionRapidaLabel}>{cat.nombre}</span>
          </button>
        ))}
      </div>

      {/* PILDOAS SECUNDARIAS (Torneos / Ranking) */}
      <div style={{ ...styles.scrollHorizontalContenedor, marginBottom: '24px' }}>
        {categorias.map((cat) => (
          <button
            key={cat.nombre}
            onClick={() => navigate(cat.ruta)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: `1px solid ${'rgba(255,255,255,0.08)'}`,
              borderRadius: '999px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '16px' }}>{cat.icono}</span>
            {cat.nombre}
          </button>
        ))}
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      )}

      {error && !loading && (
        <div style={styles.alerta}><span>⚠️ {error}</span></div>
      )}

      {!loading && (
        <>
          {/* SECCIÓN: PARTIDOS ABIERTOS */}
          <div style={styles.seccionContenedor}>
            <div style={styles.seccionHeader}>
              <h2 style={styles.seccionTitulo}>Partidos Abiertos</h2>
              <span style={styles.verTodosText} onClick={() => navigate('/turnos')}>Ver todos</span>
            </div>

            <div style={styles.scrollHorizontalContenedor}>
              {partidosAbiertos.length > 0 ? (
                partidosAbiertos.map((partido) => {
                  const jugadoresAnotados = partido.inscripcionesPartido?.length || 0;
                  const lugaresLibres = 4 - jugadoresAnotados;
                  const estaLleno = lugaresLibres <= 0;
                  const porcentaje = Math.round((jugadoresAnotados / 4) * 100);

                  const creadorFoto = partido.jugador?.imagenPerfil || partido.usuarioCreador?.imagenPerfil || partido.usuario?.imagenPerfil;
                  const creadorNombre = partido.jugador ? `${partido.jugador.nombre} ${partido.jugador.apellido}` : null;

                  return (
                    <div key={partido.id} style={styles.tarjetaHorizontal}>
                      <div style={styles.tarjetaHorizontalHeader}>
                        <span style={styles.badgeClub}>{partido.cancha?.complejo?.nombre || 'Complejo'}</span>
                        <span style={styles.badgeFecha}>
                          {partido.fechaFormateada || partido.fecha?.split('T')[0]}
                        </span>
                      </div>

                      <div style={styles.partidoCuerpo}>
                        {creadorFoto ? (
                          <img
                            src={resolverUrlImagen(creadorFoto)}
                            alt="Creador"
                            style={styles.imagenCreadorPartido}
                          />
                        ) : (
                          <div style={styles.iconoLlamativo}>🎾</div>
                        )}
                        <div>
                          <h3 style={styles.partidoHora}>{partido.horaInicio?.slice(0, 5) || partido.hora} hs</h3>
                          {creadorNombre && (
                            <p style={styles.partidoCreador}>Organizado por {creadorNombre}</p>
                          )}
                          <p style={{ ...styles.partidoCupos, color: estaLleno ? '#FF6B6B' : '#BEF264' }}>
                            {estaLleno ? 'Partido Lleno' : `Faltan ${lugaresLibres} jugador${lugaresLibres > 1 ? 'es' : ''}`}
                          </p>
                        </div>
                      </div>

                      {/* Barra de progreso de cupos (nueva) */}
                      <div style={styles.partidoProgresoTrack}>
                        <div
                          style={{ ...styles.partidoProgresoFill, width: `${porcentaje}%` }}
                        />
                      </div>

                      <button
                        onClick={() => handleUnirsePartido(partido.id)}
                        disabled={estaLleno}
                        style={{
                          ...styles.botonAccionPrimario,
                          backgroundColor: estaLleno ? 'rgba(255,255,255,0.05)' : '#BEF264',
                          color: estaLleno ? '#555' : '#0B0F0D',
                          cursor: estaLleno ? 'not-allowed' : 'pointer',
                        }}>
                        {estaLleno ? 'Cerrado' : 'Anotarme al partido'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p style={styles.textoVacio}>No hay partidos disponibles de momento.</p>
              )}
            </div>
          </div>

          {/* SECCIÓN: TORNEOS DESTACADOS */}
          <div style={styles.seccionContenedor}>
            <div style={styles.seccionHeader}>
              <h2 style={styles.seccionTitulo}>Torneos Destacados</h2>
              <span style={styles.verTodosText} onClick={() => navigate('/torneos')}>Ver todos</span>
            </div>

            <div style={styles.torneosLista}>
              {torneosActivos.length > 0 ? (
                torneosActivos.slice(0, 3).map((torneo) => {
                  const portadaTorneo = torneo.imagenPortada || torneo.imagen;

                  return (
                    <div
                      key={torneo.id}
                      style={styles.tarjetaLista}
                      onClick={() => navigate('/torneos')}
                      role="button"
                      tabIndex={0}
                    >
                      {portadaTorneo ? (
                        <img
                          src={resolverUrlImagen(portadaTorneo)}
                          alt={torneo.nombre}
                          style={styles.imagenPortadaTorneo}
                        />
                      ) : (
                        <div style={styles.tarjetaListaIcono}>🏆</div>
                      )}

                      <div style={styles.torneoListaInfo}>
                        <h4 style={styles.torneoListaTitulo}>{torneo.nombre}</h4>
                        <p style={styles.torneoListaSub}>Inicia: {torneo.fechaInicio?.split('T')[0]}</p>
                      </div>
                      <div style={styles.torneoListaPrecio}>
                        ${torneo.precioInscripcion}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={styles.textoVacio}>No hay torneos próximos disponibles.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardScreen;
