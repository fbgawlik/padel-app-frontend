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
      alert(res.data.message); // Próximamente lo cambiaremos por un Toast flotante
      refetch(); 
    } catch (err) {
      alert(err.response?.data?.error || "Error al unirse al partido.");
    }
  };

  // Categorías rápidas (reemplazan al viejo menú lateral)
  const categorias = [
    { nombre: 'Clases', icono: '🎓', ruta: '/clases' },
    { nombre: 'Torneos', icono: '🏆', ruta: '/torneos' },
    { nombre: 'Ranking', icono: '🏅', ruta: '/ranking' },
    { nombre: 'Tienda', icono: '🛍️', ruta: '/tienda' }
  ];

  return (
    <div style={styles.contenedorPadre}>
      
      {/* CABECERA: Saludo minimalista */}
      <div style={styles.headerPremium}>
        <div>
          <p style={styles.subtituloPremium}>Bienvenido de vuelta,</p>
          <h1 style={styles.tituloBienvenida}>
            {usuario?.nombre || 'Jugador'} <span style={{fontSize: '24px'}}>👋</span>
          </h1>
        </div>
        
        {/* Avatar o botón de cierre rápido si es admin */}
        {usuario?.rol === 'admin_complejo' ? (
          <button onClick={() => navigate('/gestion-complejo')} style={styles.botonAdmin}>
            ⚙️ Mi Club
          </button>
        ) : (
          <div style={styles.avatarMiniatura}>
            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>

      {/* PÍLDORAS DESLIZABLES (Categorías) */}
      <div style={styles.scrollHorizontalContenedor}>
        {categorias.map((cat, index) => (
          <button key={index} style={styles.pildoraCategoria} onClick={() => navigate(cat.ruta)}>
            <span style={{ fontSize: '18px' }}>{cat.icono}</span>
            <span style={{ fontWeight: '600' }}>{cat.nombre}</span>
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
          {/* SECCIÓN: PARTIDOS ABIERTOS (Deslizable horizontalmente) */}
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

                  return (
                    <div key={partido.id} style={styles.tarjetaHorizontal}>
                      <div style={styles.tarjetaHorizontalHeader}>
                        <span style={styles.badgeClub}>{partido.cancha?.complejo?.nombre || 'Complejo'}</span>
                        <span style={{ color: '#8E8E93', fontSize: '12px', fontWeight: '500' }}>
                          {partido.fechaFormateada || partido.fecha}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                        <div style={styles.iconoLlamativo}>🎾</div>
                        <div>
                          <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{partido.horaInicio?.slice(0,5) || partido.hora} hs</h3>
                          <p style={{ margin: 0, color: estaLleno ? '#ff4d4d' : '#39FF14', fontSize: '13px', fontWeight: '600' }}>
                            {estaLleno ? 'Partido Lleno' : `Faltan ${lugaresLibres} jugador${lugaresLibres > 1 ? 'es' : ''}`}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleUnirsePartido(partido.id)}
                        disabled={estaLleno}
                        style={{
                          ...styles.botonAccionPrimario,
                          backgroundColor: estaLleno ? 'rgba(255,255,255,0.05)' : '#39FF14',
                          color: estaLleno ? '#555' : '#0F0F10',
                        }}>
                        {estaLleno ? 'Cerrado' : 'Anotarme al partido'}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p style={styles.textoVacio}>No hay partidos abiertos hoy.</p>
              )}
            </div>
          </div>

          {/* SECCIÓN: TORNEOS DESTACADOS */}
          <div style={styles.seccionContenedor}>
            <div style={styles.seccionHeader}>
              <h2 style={styles.seccionTitulo}>Torneos Destacados</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {torneosActivos.length > 0 ? (
                torneosActivos.slice(0, 3).map((torneo) => (
                  <div key={torneo.id} style={styles.tarjetaLista} onClick={() => navigate('/torneos')}>
                    <div style={styles.tarjetaListaIcono}>🏆</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '15px' }}>{torneo.nombre}</h4>
                      <p style={{ margin: 0, color: '#8E8E93', fontSize: '12px' }}>Inicia: {torneo.fechaInicio}</p>
                    </div>
                    <div style={{ color: '#39FF14', fontWeight: '600', fontSize: '14px' }}>
                      ${torneo.precioInscripcion}
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.textoVacio}>No hay torneos próximos.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  contenedorPadre: { 
    padding: '24px 16px', 
    backgroundColor: 'transparent', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
  },
  headerPremium: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px' 
  },
  subtituloPremium: { 
    fontSize: '13px', 
    color: '#8E8E93', 
    margin: '0 0 4px 0',
    fontWeight: '500'
  },
  tituloBienvenida: { 
    fontSize: '24px', 
    fontWeight: '800', 
    color: '#ffffff', 
    margin: 0,
    letterSpacing: '-0.5px'
  },
  avatarMiniatura: {
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    backgroundColor: '#1A1A1A',
    border: '1px solid rgba(57, 255, 20, 0.3)',
    color: '#39FF14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px'
  },
  botonAdmin: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    color: '#39FF14',
    border: '1px solid rgba(57, 255, 20, 0.2)',
    padding: '8px 12px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px'
  },
  
  // Píldoras Deslizables (Scroll horizontal)
  scrollHorizontalContenedor: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    paddingBottom: '12px',
    marginBottom: '24px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none', // Oculta barra en Firefox
  },
  pildoraCategoria: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    color: '#fff',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },

  seccionContenedor: { marginBottom: '32px' },
  seccionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px' 
  },
  seccionTitulo: { 
    fontSize: '18px', 
    fontWeight: '700', 
    color: '#fff', 
    margin: 0 
  },
  verTodosText: {
    color: '#39FF14',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Tarjetas iOS (Partidos Abiertos)
  tarjetaHorizontal: {
    minWidth: '260px',
    maxWidth: '260px',
    backgroundColor: '#161618',
    borderRadius: '24px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.03)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  },
  tarjetaHorizontalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badgeClub: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#EAEAEA',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  iconoLlamativo: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  botonAccionPrimario: {
    width: '100%',
    padding: '12px',
    borderRadius: '14px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    marginTop: '8px'
  },

  // Tarjetas en Lista (Torneos)
  tarjetaLista: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#161618',
    padding: '16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  tarjetaListaIcono: {
    fontSize: '24px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  textoVacio: { color: '#8E8E93', fontSize: '14px' },
  loadingContainer: { display: 'flex', justifyContent: 'center', padding: '40px' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(57, 255, 20, 0.2)', borderTop: '3px solid #39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  alerta: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', fontWeight: '600' },
};

export default DashboardScreen;