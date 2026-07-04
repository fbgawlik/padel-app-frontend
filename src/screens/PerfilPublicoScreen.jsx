// src/screens/PerfilPublicoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api'; // 🔥 Conexión con tu servicio de Axios centralizado

const PerfilPublicoScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jugador, setJugador] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Usamos tu variable de entorno para las imágenes, con un fallback local por si acaso
  const URL_IMAGENES = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchJugador = async () => {
      try {
        // 🔥 Usamos tu instancia de Axios (ya incluye el token gracias al interceptor)
        const respuesta = await API.get(`/jugadores/${id}`);
        
        // Axios guarda la respuesta automáticamente en la propiedad .data
        setJugador(respuesta.data); 
      } catch (err) {
        // Capturamos el error que venga del backend o un mensaje genérico
        setError(err.response?.data?.error || 'No se pudo cargar el perfil del jugador');
      } finally {
        setCargando(false);
      }
    };

    fetchJugador();
  }, [id]);

  if (cargando) {
    return (
      <div style={styles.contenedorLoading}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error || !jugador) {
    return (
      <div style={styles.contenedor}>
        <button onClick={() => navigate(-1)} style={styles.botonVolverFlotante}>← Volver</button>
        <div style={styles.alertaError}>{error || 'Error al cargar el perfil'}</div>
      </div>
    );
  }

  // Fallbacks visuales si el jugador no configuró una foto de portada
  const portadaEstilo = jugador.imagenPortada 
    ? { backgroundImage: `url(${URL_IMAGENES}${jugador.imagenPortada})` }
    : { background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.1) 0%, rgba(10, 10, 10, 1) 100%)' };

  return (
    <div style={styles.contenedor}>
      {/* Botón Flotante para Volver */}
      <button onClick={() => navigate(-1)} style={styles.botonVolverFlotante}>
        ← Volver
      </button>

      {/* Tarjeta Principal del Perfil */}
      <div style={styles.tarjetaPerfil}>
        
        {/* Banner de Portada */}
        <div style={{ ...styles.portada, ...portadaEstilo }}></div>

        {/* Info Principal con Avatar Superpuesto */}
        <div style={styles.cuerpoPerfil}>
          <div style={styles.avatarContenedor}>
            {jugador.imagenPerfil ? (
              <img src={`${URL_IMAGENES}${jugador.imagenPerfil}`} alt="Perfil" style={styles.avatarImagen} />
            ) : (
              <div style={styles.avatarLetra}>{jugador.nombre.charAt(0).toUpperCase()}</div>
            )}
          </div>

          <h1 style={styles.nombreJugador}>{jugador.nombre} {jugador.apellido}</h1>
          <p style={styles.bio}>{jugador.bio || 'Jugador del circuito sin biografía por el momento.'}</p>

          {/* Estadísticas / Badges en formato Grid */}
          <div style={styles.gridStats}>
            
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Categoría</span>
              <span style={styles.statValue}>{jugador.categoriaPadel || 'N/C'}</span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>Lado</span>
              <span style={styles.statValue}>{jugador.ladoJuego || '-'}</span>
            </div>

            <div style={styles.statCardHighlight}>
              <span style={styles.statLabelHighlight}>Puntos</span>
              <span style={styles.statValueHighlight}>{jugador.puntosGenerales || 0}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos Dark Premium (Objetos en línea para mantener tu compatibilidad)
const styles = {
  contenedor: {
    padding: '24px 16px',
    backgroundColor: 'transparent',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  contenedorLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(57, 255, 20, 0.2)',
    borderTop: '3px solid #39FF14',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  botonVolverFlotante: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
  },
  tarjetaPerfil: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#121214',
    borderRadius: '28px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
  },
  portada: {
    width: '100%',
    height: '140px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cuerpoPerfil: {
    padding: '0 24px 32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    top: '-40px',
    marginBottom: '-40px'
  },
  avatarContenedor: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: '#1C1C1E',
    border: '4px solid #121214',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: '16px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
  },
  avatarImagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarLetra: {
    fontSize: '36px',
    color: '#8E8E93',
    fontWeight: '700',
  },
  nombreJugador: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
    textAlign: 'center',
  },
  bio: {
    fontSize: '14px',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: '1.5',
    margin: '0 0 24px 0',
  },
  gridStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    width: '100%',
  },
  statCard: {
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '11px',
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '15px',
    color: '#ffffff',
    fontWeight: '700',
  },
  statCardHighlight: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    border: '1px solid rgba(57, 255, 20, 0.2)',
    borderRadius: '16px',
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabelHighlight: {
    fontSize: '11px',
    color: '#39FF14',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '6px',
  },
  statValueHighlight: {
    fontSize: '16px',
    color: '#39FF14',
    fontWeight: '800',
  },
  alertaError: {
    backgroundColor: 'rgba(255,69,58,0.08)',
    color: '#FF453A',
    padding: '14px 18px',
    borderRadius: '16px',
    border: '1px solid rgba(255,69,58,0.15)',
    marginTop: '20px',
    textAlign: 'center'
  }
};

export default PerfilPublicoScreen;