// src/screens/RankingScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { resolverUrlImagen } from '../services/imageHelper'; 
import { styles } from './RankingScreen.styles';

const RankingScreen = () => {
  // Manejamos estados limpios para simplificar el renderizado y la lógica
  const [categoria, setCategoria] = useState('5ta'); 
  const [rama, setRama] = useState('Caballeros'); 
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const navigate = useNavigate(); 

  // Categorías base estandarizadas
  const categoriasDisponibles = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va'];

  useEffect(() => {
    const cargarRanking = async () => {
      setCargando(true);
      try {
        // 🔥 REPARACIÓN AQUÍ: Reconstruimos el string "5ta Caballeros" que se genera en RegisterScreen
        const categoriaFormateada = `${categoria} ${rama}`;
        
        // Enviamos la query con el formato exacto que espera recibir el Backend
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
  }, [categoria, rama]); // Se vuelve a disparar al cambiar pestaña o categoría

  // Lógica de resolución de imágenes

  // Obtener iniciales de respaldo
  const obtenerIniciales = (jugador) => {
    const n = jugador?.nombre?.charAt(0) || '';
    const a = jugador?.apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || 'P';
  };

  return (
    <div style={styles.contenedor}>
      <div style={styles.tarjetaContenido}>
        
        {/* TÍTULO DE LA PANTALLA */}
        <h2 style={styles.tituloHeader}>Ranking Oficial</h2>

        {/* CONTENEDOR DE PESTAÑAS (RAMAS) */}
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

        {/* SLIDER HORIZONTAL DE CATEGORÍAS */}
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

        {/* CONTENEDOR DE LA LISTA / CARGA */}
        <div style={styles.listaClasificacion}>
          {cargando ? (
            <div style={styles.contenedorCarga}>
              <div style={styles.spinner}></div>
              <p style={{ color: '#8E8E93', marginTop: '12px', fontSize: '14px' }}>Actualizando posiciones...</p>
            </div>
          ) : jugadores.length === 0 ? (
            <div style={styles.mensajeEstado}>
              Aún no hay jugadores registrados en {categoria} {rama}.
            </div>
          ) : (
            jugadores.map((jugador, index) => {
              const posicion = index + 1;
              
              return (
                <div 
                  key={jugador.id} 
                  style={styles.filaJugador}
                  onClick={() => navigate(`/jugador/${jugador.id}`)}
                >
                  
                  {/* PUESTO / MEDALLA */}
                  <div style={styles.colPosicion}>
                    {posicion <= 3 ? (
                      <span style={styles.badgeMedalla(posicion)}>{posicion}</span>
                    ) : (
                      <span style={styles.textoPosicion}>{posicion}</span>
                    )}
                  </div>

                  {/* FOTO JUGADOR */}
                  <div style={styles.colFoto}>
                    <div style={styles.avatarContenedor}>
                      {jugador.imagenPerfil ? (
                        <img 
                          src={resolverUrlImagen(jugador.imagenPerfil)} 
                          alt="Perfil" 
                          style={styles.avatar}
                        />
                      ) : (
                        <span style={styles.inicialAvatar}>
                          {obtenerIniciales(jugador)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DATOS DEL JUGADOR */}
                  <div style={styles.colInfo}>
                    <div style={styles.nombreJugador}>
                      {jugador.nombre} {jugador.apellido}
                    </div>
                    <div style={styles.subtextoCategoria}>
                      {categoria} {rama}
                    </div>
                  </div>

                  {/* PUNTOS TOTALES */}
                  <div style={styles.colPuntos}>
                    <span style={styles.textoPuntos}>{jugador.puntosGenerales || 0} pts</span>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

// --- ARQUITECTURA DE ESTILOS ADN PÁDEL ---
// (Las animaciones como @keyframes spin ahora viven en index.css de forma global)

export default RankingScreen;