// src/screens/DashboardScreen.jsx
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

  // 🛠️ FUNCIÓN PARA VERIFICAR SI UN EVENTO YA PASÓ
  const esFechaFutura = (fechaEvento, horaEvento) => {
    try {
      const ahora = new Date();
      // Asumimos formato YYYY-MM-DD o ISO string.
      const fechaLimpia = fechaEvento.split('T')[0];
      const horaLimpia = horaEvento ? horaEvento.slice(0, 5) : "00:00";
      
      const momentoEvento = new Date(`${fechaLimpia}T${horaLimpia}:00`);
      return momentoEvento > ahora;
    } catch (e) {
      return true; // En caso de error de formateo, no lo ocultamos por seguridad
    }
  };


  const complejos = data?.complejos || [];
  
  // 🔥 FILTRADO EN TIEMPO REAL: Solo partidos y torneos futuros o vigentes
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

  const categorias = [
    { nombre: 'Clases', icono: '🎓', ruta: '/clases' },
    { nombre: 'Torneos', icono: '🏆', ruta: '/torneos' },
    { nombre: 'Ranking', icono: '🏅', ruta: '/ranking' },
    { nombre: 'Tienda', icono: '🛍️', ruta: '/tienda' }
  ];

  return (
    <div style={styles.contenedorPadre}>
      
      {/* CABECERA */}
      <div style={styles.headerPremium}>
        <div>
          <p style={styles.subtituloPremium}>Bienvenido de vuelta,</p>
          <h1 style={styles.tituloBienvenida}>
            {usuario?.nombre || 'Jugador'} <span style={{fontSize: '24px'}}>👋</span>
          </h1>
        </div>
        
        {usuario?.rol === 'admin_complejo' ? (
          <button onClick={() => navigate('/gestion-complejo')} style={styles.botonAdmin}>
            ⚙️ Mi Club
          </button>
        ) : (
          <div style={styles.avatarMiniatura}>
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

      {/* CATEGORÍAS */}
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
                  
                  // Traemos la imagen del creador (usuario que reservó/abrió el partido)
                  const creadorFoto = partido.jugador?.imagenPerfil || partido.usuarioCreador?.imagenPerfil || partido.usuario?.imagenPerfil;
                  const creadorNombre = partido.jugador ? `${partido.jugador.nombre} ${partido.jugador.apellido}` : null;

                  return (
                    <div key={partido.id} style={styles.tarjetaHorizontal}>
                      <div style={styles.tarjetaHorizontalHeader}>
                        <span style={styles.badgeClub}>{partido.cancha?.complejo?.nombre || 'Complejo'}</span>
                        <span style={{ color: '#8E8E93', fontSize: '12px', fontWeight: '500' }}>
                          {partido.fechaFormateada || partido.fecha?.split('T')[0]}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                        {/* 📸 FOTO DINÁMICA DEL CREADOR DEL PARTIDO */}
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
                          <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>{partido.horaInicio?.slice(0,5) || partido.hora} hs</h3>
                          {creadorNombre && (
                            <p style={{ margin: '4px 0 0 0', color: '#8E8E93', fontSize: '12px' }}>
                              Organizado por {creadorNombre}
                            </p>
                          )}
                          <p style={{ margin: '6px 0 0 0', color: estaLleno ? '#ff4d4d' : '#39FF14', fontSize: '13px', fontWeight: '600' }}>
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
                <p style={styles.textoVacio}>No hay partidos disponibles de momento.</p>
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
                torneosActivos.slice(0, 3).map((torneo) => {
                  const portadaTorneo = torneo.imagenPortada || torneo.imagen;

                  return (
                    <div key={torneo.id} style={styles.tarjetaLista} onClick={() => navigate('/torneos')}>
                      {/* 📸 IMAGEN DE PORTADA DEL TORNEO */}
                      {portadaTorneo ? (
                        <img 
                          src={resolverUrlImagen(portadaTorneo)} 
                          alt={torneo.nombre} 
                          style={styles.imagenPortadaTorneo}
                        />
                      ) : (
                        <div style={styles.tarjetaListaIcono}>🏆</div>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '15px' }}>{torneo.nombre}</h4>
                        <p style={{ margin: 0, color: '#8E8E93', fontSize: '12px' }}>Inicia: {torneo.fechaInicio?.split('T')[0]}</p>
                      </div>
                      <div style={{ color: '#39FF14', fontWeight: '600', fontSize: '14px' }}>
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

;

export default DashboardScreen;