// src/screens/PerfilPublicoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api'; 

const PerfilPublicoScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jugador, setJugador] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJugador = async () => {
      try {
        // Petición al backend usando tu axios centralizado
        const respuesta = await API.get(`/usuarios/perfil-publico/${id}`); 
        setJugador(respuesta.data); 
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo cargar el perfil del jugador');
      } finally {
        setCargando(false);
      }
    };

    fetchJugador();
  }, [id]);

  // Lógica segura para resolver URLs de imágenes (Igual que en tus otras screens)
  const resolverUrlImagen = (ruta) => {
    if (!ruta) return null;
    if (ruta.includes('localhost:5000')) {
      const rutaRelativa = ruta.replace('http://localhost:5000', ''); 
      return `${import.meta.env.VITE_API_URL}${rutaRelativa}`;
    }
    if (ruta.startsWith('http')) return ruta; 
    return `${import.meta.env.VITE_API_URL}${ruta}`; 
  };

  const obtenerIniciales = () => {
    const n = jugador?.nombre?.charAt(0) || '';
    const a = jugador?.apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || 'P';
  };

  if (cargando) {
    return (
      <div style={styles.contenedorLoading}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error || !jugador) {
    return (
      <div style={styles.contenedorBase}>
        <div style={styles.tarjetaContenido}>
          <button onClick={() => navigate(-1)} style={styles.botonVolverFlotante}>← Volver</button>
          <div style={styles.alertaError}>{error || 'Error al cargar el perfil'}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.contenedorBase}>
      <div style={styles.tarjetaContenido}>
        
        {/* ENCABEZADO DE NAVEGACIÓN */}
        <div style={styles.headerNavegacion}>
          <button onClick={() => navigate(-1)} style={styles.btnVolverBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={styles.tituloHeader}>Perfil del Jugador</span>
          <div style={{ width: 24 }}></div> {/* Espaciador estético */}
        </div>

        {/* CONTENEDOR FOTOS (PORTADA Y AVATAR FLOTANTE) */}
        <div style={styles.bloqueMultimedia}>
          {jugador.imagenPortada ? (
            <img src={resolverUrlImagen(jugador.imagenPortada)} alt="Portada" style={styles.imagenPortadaImg} />
          ) : (
            <div style={styles.bannerVacio}></div>
          )}
          
          {/* Avatar Superpuesto */}
          <div style={styles.avatarSeccion}>
            <div style={styles.avatarContenedor}>
              {jugador.imagenPerfil ? (
                <img src={resolverUrlImagen(jugador.imagenPerfil)} alt="Perfil" style={styles.avatarImagen} />
              ) : (
                <div style={styles.avatarLetra}>{obtenerIniciales()}</div>
              )}
            </div>
          </div>
        </div>

        {/* NOMBRE DEL JUGADOR */}
        <h1 style={styles.nombreJugador}>{jugador.nombre} {jugador.apellido}</h1>

        {/* MEDALLAS / CARDS SUPERIORES DESTACADAS */}
        <div style={styles.filaBadges}>
          
          {/* Card Puntos */}
          <div style={styles.badgeCard}>
            <div style={{...styles.badgeIcono, color: '#39FF14', backgroundColor: 'rgba(57, 255, 20, 0.1)'}}>🏅</div>
            <span style={styles.badgeTitulo}>Puntos</span>
            <span style={styles.badgeValor}>{jugador.puntosGenerales || 0} pts</span>
          </div>

          {/* Card Ranking */}
          <div style={styles.badgeCard}>
            <div style={{...styles.badgeIcono, color: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.1)'}}>🏆</div>
            <span style={styles.badgeTitulo}>Ranking</span>
            <span style={styles.badgeValor}>Nº 1</span>
          </div>

          {/* Card Categoría */}
          <div style={styles.badgeCard}>
            <div style={{...styles.badgeIcono, color: '#00BFFF', backgroundColor: 'rgba(0, 191, 255, 0.1)'}}>🎗️</div>
            <span style={styles.badgeTitulo}>Categoría</span>
            <span style={styles.badgeValorFiltrado}>{jugador.categoriaPadel || 'N/C'}</span>
          </div>

        </div>

        {/* BLOQUE DE INFORMACIÓN INFERIOR split horizontal */}
        <div style={styles.bloqueInfoDetalle}>
          
          {/* Sobre Mí */}
          <div style={styles.colInformacion}>
            <h3 style={styles.subtituloSeccion}>Sobre Mí</h3>
            <div style={styles.cajaTextoBio}>
              <p style={styles.textoBio}>
                {jugador.bio || 'Este jugador aún mantiene un perfil misterioso en la cancha sin biografía escrita.'}
              </p>
            </div>
          </div>

          {/* Detalles de Juego */}
          <div style={styles.colInfoLado}>
            <h3 style={styles.subtituloSeccion}>Lado de Juego</h3>
            <div style={styles.cajaTextoLado}>
              <span style={styles.iconoRaqueta}>🎾</span>
              <div>
                <div style={styles.labelLadoTitle}>Posición</div>
                <div style={styles.valorLadoText}>{jugador.ladoJuego || 'No definido'}</div>
              </div>
            </div>

            {/* Record Extra Estético */}
            <div style={styles.cajaRecord}>
              <div style={styles.labelLadoTitle}>Rendimiento Circuito</div>
              <div style={styles.valorRecordText}>W - L : <span style={{color: '#39FF14'}}>12 - 2</span></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// ARQUITECTURA DE DISEÑO DARK ADN PADEL
const styles = {
  contenedorBase: {
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
    padding: '16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  headerNavegacion: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: '16px',
    padding: '4px 0'
  },
  btnVolverBack: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  tituloHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  bloqueMultimedia: {
    width: '100%',
    height: '150px',
    backgroundColor: '#1F1F23',
    position: 'relative',
    borderRadius: '20px',
    overflow: 'visible', // Permite que el avatar sobresalga de la base
    marginBottom: '50px'
  },
  imagenPortadaImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '20px'
  },
  bannerVacio: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1f1f23 0%, #2c2c35 100%)',
    borderRadius: '20px'
  },
  avatarSeccion: {
    position: 'absolute',
    bottom: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2'
  },
  avatarContenedor: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: '#1C1C1E',
    border: '4px solid #0C0C0E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.6)'
  },
  avatarImagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarLetra: {
    fontSize: '32px',
    color: '#8E8E93',
    fontWeight: '700'
  },
  nombreJugador: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '800',
    margin: '4px 0 20px 0',
    letterSpacing: '0.2px'
  },
  filaBadges: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '24px'
  },
  badgeCard: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '12px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  badgeIcono: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    marginBottom: '6px'
  },
  badgeTitulo: {
    fontSize: '11px',
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: '4px'
  },
  badgeValor: {
    fontSize: '13px',
    color: '#FFFFFF',
    fontWeight: '800'
  },
  badgeValorFiltrado: {
    fontSize: '11px',
    color: '#FFFFFF',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%'
  },
  subtituloSeccion: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#A0A0A5',
    margin: '0 0 10px 0'
  },
  bloqueInfoDetalle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cajaTextoBio: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '14px',
    boxSizing: 'border-box'
  },
  textoBio: {
    fontSize: '13px',
    color: '#E5E5EA',
    lineHeight: '1.5',
    margin: 0
  },
  cajaTextoLado: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },
  iconoRaqueta: {
    fontSize: '20px'
  },
  labelLadoTitle: {
    fontSize: '11px',
    color: '#8E8E93',
    fontWeight: '500'
  },
  valorLadoText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  cajaRecord: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  valorRecordText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  contenedorLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0C0C0E'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTop: '3px solid #39FF14',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  alertaError: {
    backgroundColor: 'rgba(255,69,58,0.1)',
    color: '#FF453A',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid #FF453A',
    textAlign: 'center',
    fontSize: '14px'
  },
  botonVolverFlotante: {
    backgroundColor: '#1A1A1E',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '8px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '16px'
  }
};