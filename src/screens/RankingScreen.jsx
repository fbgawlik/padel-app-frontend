// src/screens/RankingScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; // 🔥 Tu servicio centralizado

const RankingScreen = () => {
  // Coincidiendo exactamente con los valores de tu BD ("2da Categoría", "5ta Categoría", etc.)
  const [categoria, setCategoria] = useState('5ta Categoría'); 
  const [rama, setRama] = useState('Caballeros'); 
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const navigate = useNavigate(); 

  // Mapeo exacto de las categorías guardadas en tu Base de Datos
  const categoriasDisponibles = [
    '1ra Categoría', 
    '2da Categoría', 
    '3ra Categoría', 
    '4ta Categoría', 
    '5ta Categoría', 
    '6ta Categoría', 
    '7ma Categoría', 
    '8va Categoría'
  ];

  useEffect(() => {
    const cargarRanking = async () => {
      setCargando(true);
      try {
        // Se envían los términos idénticos a los almacenados en la base de datos
        const respuesta = await API.get(`/ranking?categoria=${encodeURIComponent(categoria)}&rama=${encodeURIComponent(rama)}`);
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

  // Lógica de resolución de imágenes de PerfilScreen
  const resolverUrlImagen = (ruta) => {
    if (!ruta) return null;
    if (ruta.includes('localhost:5000')) {
      const rutaRelativa = ruta.replace('http://localhost:5000', ''); 
      return `${import.meta.env.VITE_API_URL}${rutaRelativa}`;
    }
    if (ruta.startsWith('http')) return ruta; 
    return `${import.meta.env.VITE_API_URL}${ruta}`; 
  };

  // Obtener iniciales de PerfilScreen
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
            // Visualmente mostramos solo "1ra", "2da", etc., quitando la palabra " Categoría"
            const nombreVisual = cat.replace(' Categoría', ''); 
            
            return (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                style={esActivo ? styles.chipCategoriaActivo : styles.chipCategoriaInactivo}
              >
                {nombreVisual}
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
              Aún no hay jugadores registrados en {categoria.replace(' Categoría', '')} {rama}.
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
                      {categoria.replace(' Categoría', '')} {rama}
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
const styles = {
  contenedor: {
    width: '100%',
    color: '#FFFFFF',
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0C0C0E'
  },
  tarjetaContenido: {
    width: '100%',
    maxWidth: '440px',
    padding: '20px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  tituloHeader: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    margin: '10px 0 20px 0',
    color: '#FFFFFF'
  },
  contenedorRamas: {
    display: 'flex',
    backgroundColor: '#141416',
    borderRadius: '14px',
    padding: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '16px'
  },
  btnRamaActivo: {
    flex: 1,
    backgroundColor: '#39FF14',
    color: '#000000',
    border: 'none',
    borderRadius: '10px',
    height: '40px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnRamaInactivo: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#A0A0A5',
    border: 'none',
    borderRadius: '10px',
    height: '40px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  sliderCategorias: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '12px',
    marginBottom: '14px',
    scrollbarWidth: 'none', 
    WebkitOverflowScrolling: 'touch',
  },
  chipCategoriaActivo: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    color: '#39FF14',
    border: '1px solid #39FF14',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  chipCategoriaInactivo: {
    backgroundColor: '#1A1A1E',
    color: '#A0A0A5',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  listaClasificacion: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '6px'
  },
  filaJugador: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    gap: '12px',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  colPosicion: {
    width: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textoPosicion: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#A0A0A5'
  },
  badgeMedalla: (pos) => ({
    backgroundColor: pos === 1 ? '#D4AF37' : pos === 2 ? '#AAA9AD' : '#CD7F32',
    color: '#000000',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '900',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
  }),
  colFoto: {
    width: '42px',
    height: '42px'
  },
  avatarContenedor: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#1A1A1E',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  inicialAvatar: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#A0A0A5'
  },
  colInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  nombreJugador: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  subtextoCategoria: {
    fontSize: '12px',
    color: '#A0A0A5',
    fontWeight: '500'
  },
  colPuntos: {
    textAlign: 'right'
  },
  textoPuntos: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#39FF14'
  },
  contenedorCarga: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 0'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255, 255, 255, 0.08)',
    borderTop: '3px solid #39FF14',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  mensajeEstado: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#A0A0A5',
    fontSize: '14px',
    lineHeight: '20px'
  }
};

if (typeof document !== 'undefined') {
  const estiloAnimacion = document.createElement('style');
  estiloAnimacion.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(estiloAnimacion);
}

export default RankingScreen;