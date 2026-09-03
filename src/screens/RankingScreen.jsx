// src/screens/RankingScreen.jsx
// ───────────────────────────────────────────────────────────
// Refactor v2: agrega podio visual top 3 + lista para el resto.
// Mantiene TODA la lógica de carga desde la API intacta.
// ───────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './RankingScreen.styles';

const RankingScreen = () => {
  const [categoria, setCategoria] = useState('5ta');
  const [rama, setRama] = useState('Caballeros');
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  const categoriasDisponibles = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va'];

  useEffect(() => {
    const cargarRanking = async () => {
      setCargando(true);
      try {
        const categoriaFormateada = `${categoria} ${rama}`;
        const respuesta = await API.get(`/ranking?categoria=${encodeURIComponent(categoriaFormateada)}`);
        setJugadores(respuesta.data || []);
      } catch (error) {
        console.error("Error al obtener la tabla de posiciones:", error);
        setJugadores([]);
      } finally {
        setCargando(false);
      }
    };

    cargarRanking();
  }, [categoria, rama]);

  const obtenerIniciales = (jugador) => {
    const n = jugador?.nombre?.charAt(0) || '';
    const a = jugador?.apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || 'P';
  };

  // Colores de medalla
  const medallaColor = (pos) =>
    pos === 1 ? '#FBBF24' : pos === 2 ? '#CBD5E1' : '#D97706';

  // Slots del podio: 2do (izq), 1ero (centro, más alto), 3ero (der)
  const podioOrder = [1, 0, 2]; // índices en jugadores[]
  const podioHeights = ['64px', '88px', '52px'];
  const podioAvatarSizes = [46, 58, 46];
  const tienePodio = !cargando && jugadores.length >= 3;
  const topJugadores = jugadores.slice(0, 3);
  const restoJugadores = jugadores.slice(3);

  return (
    <div style={styles.contenedor}>
      <div style={styles.tarjetaContenido}>

        {/* TÍTULO */}
        <h2 style={styles.tituloHeader}>Ranking Oficial</h2>

        {/* SEGMENTED CONTROL (RAMAS) */}
        <div style={styles.contenedorRamas}>
          <button
            style={rama === 'Damas' ? styles.btnRamaActivo : styles.btnRamaInactivo}
            onClick={() => setRama('Damas')}
          >
            Damas
          </button>
          <button
            style={rama === 'Caballeros' ? styles.btnRamaActivo : styles.btnRamaInactivo}
            onClick={() => setRama('Caballeros')}
          >
            Caballeros
          </button>
        </div>

        {/* CHIPS DE CATEGORÍA */}
        <div style={styles.sliderCategorias}>
          {categoriasDisponibles.map((cat) => {
            const esActivo = categoria === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                style={esActivo ? styles.chipCategoriaActivo : styles.chipCategoriaInactivo}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* CONTENIDO */}
        <div style={styles.listaClasificacion}>
          {cargando ? (
            <div style={styles.contenedorCarga}>
              <div style={styles.spinner}></div>
              <p style={{ color: '#7A847E', marginTop: '12px', fontSize: '14px' }}>Actualizando posiciones...</p>
            </div>
          ) : jugadores.length === 0 ? (
            <div style={styles.mensajeEstado}>
              Aún no hay jugadores registrados en {categoria} {rama}.
            </div>
          ) : (
            <>
              {/* PODIO TOP 3 (si hay 3 o más) */}
              {tienePodio && (
                <div style={styles.podio}>
                  {podioOrder.map((idx, i) => {
                    const jugador = topJugadores[idx];
                    if (!jugador) return null;
                    const place = idx + 1;
                    const size = podioAvatarSizes[i];
                    const pillarH = podioHeights[i];
                    return (
                      <div key={jugador.id} style={styles.podioSlot}>
                        <div style={styles.podioAvatarWrap}>
                          {jugador.imagenPerfil ? (
                            <img
                              src={resolverUrlImagen(jugador.imagenPerfil)}
                              alt="Perfil"
                              style={{ ...styles.podioAvatarImg, width: size, height: size }}
                            />
                          ) : (
                            <div
                              style={{
                                ...styles.podioAvatar,
                                width: size,
                                height: size,
                                fontSize: size * 0.36,
                                backgroundColor: medallaColor(place) + '30',
                              }}
                            >
                              {obtenerIniciales(jugador)}
                            </div>
                          )}
                          <span
                            style={{
                              ...styles.podioMedalla,
                              backgroundColor: medallaColor(place),
                              color: place === 2 ? '#0B0F0D' : '#fff',
                            }}
                          >
                            {place === 1 ? '👑' : place}
                          </span>
                        </div>
                        <p style={styles.podioNombre}>{jugador.nombre}</p>
                        <p style={styles.podioPuntos}>{jugador.puntosGenerales || 0} pts</p>
                        <div style={{ ...styles.podioPilar, height: pillarH }}>
                          <span style={styles.podioPilarNum}>{place}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Si hay menos de 3, mostrar los primeros como lista normal */}
              {!tienePodio && topJugadores.map((jugador, index) => {
                const posicion = index + 1;
                return (
                  <FilaJugador
                    key={jugador.id}
                    jugador={jugador}
                    posicion={posicion}
                    categoria={categoria}
                    rama={rama}
                    obtenerIniciales={obtenerIniciales}
                    onClick={() => navigate(`/jugador/${jugador.id}`)}
                    esTop
                  />
                );
              })}

              {/* RESTO DE LA TABLA */}
              {restoJugadores.length > 0 && (
                <>
                  <div style={styles.restoHeader}>
                    <span>✦ Resto de la tabla</span>
                  </div>
                  {restoJugadores.map((jugador, index) => {
                    const posicion = index + 4;
                    return (
                      <FilaJugador
                        key={jugador.id}
                        jugador={jugador}
                        posicion={posicion}
                        categoria={categoria}
                        rama={rama}
                        obtenerIniciales={obtenerIniciales}
                        onClick={() => navigate(`/jugador/${jugador.id}`)}
                      />
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de fila reutilizable
const FilaJugador = ({ jugador, posicion, categoria, rama, obtenerIniciales, onClick, esTop }) => (
  <div style={styles.filaJugador} onClick={onClick} role="button" tabIndex={0}>
    <div style={styles.colPosicion}>
      <span style={{ ...styles.posicionBadge, ...(esTop ? styles.posicionTop : styles.posicionResto) }}>
        {posicion}
      </span>
    </div>

    <div style={styles.colFoto}>
      <div style={styles.avatarContenedor}>
        {jugador.imagenPerfil ? (
          <img src={resolverUrlImagen(jugador.imagenPerfil)} alt="Perfil" style={styles.avatar} />
        ) : (
          <span style={styles.inicialAvatar}>{obtenerIniciales(jugador)}</span>
        )}
      </div>
    </div>

    <div style={styles.colInfo}>
      <div style={styles.nombreJugador}>
        {jugador.nombre} {jugador.apellido}
      </div>
      <div style={styles.subtextoCategoria}>
        {categoria} {rama}
      </div>
    </div>

    <div style={styles.colPuntos}>
      <span style={styles.textoPuntos}>{jugador.puntosGenerales || 0} pts</span>
    </div>
  </div>
);

export default RankingScreen;
