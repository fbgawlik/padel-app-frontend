// src/screens/PerfilPublicoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './PerfilPublicoScreen.styles';

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
        const respuesta = await API.get(`/usuarios/${id}`); 
        setJugador(respuesta.data); 
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo cargar el perfil del jugador');
      } finally {
        setCargando(false);
      }
    };

    fetchJugador();
  }, [id]);


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
;
export default PerfilPublicoScreen;