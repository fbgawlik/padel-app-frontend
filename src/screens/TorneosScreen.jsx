// src/screens/TorneosScreen.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTorneos } from '../hooks/useTorneos';
import { TorneoCard } from '../components/TorneoCard';
import { AuthContext } from '../context/AuthContext';
import ModalCrearTorneo from '../components/ModalCrearTorneo'; 
import FormInscripcionModal from '../components/FormInscripcionModal'; 

export const TorneosScreen = () => {
  const { torneos, cargando, error } = useTorneos();
  const navigate = useNavigate(); 
  const { usuario } = useContext(AuthContext);
  
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false); 
  const [mostrarModalInscripcion, setMostrarModalInscripcion] = useState(false); 

  const esAdmin = usuario?.rol === 'admin_complejo' || usuario?.rol === 'organizador';

  // AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Ahora navegamos a la URL de la nueva pantalla
  const manejarVerDetalles = (torneo) => {
    const id = torneo.id || torneo._id;
    navigate(`/dashboard/torneo/${id}`);
  };

  if (cargando) return (
    <div style={styles.contenedorPadre}>
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={styles.contenedorPadre}>
      <div style={styles.alerta}><span>⚠️ {error}</span></div>
    </div>
  );

  return (
    <div style={styles.contenedorPadre}>
      <div style={styles.headerPremium}>
        <div>
          <p style={styles.subtituloPremium}>Circuito Oficial</p>
          <h1 style={styles.tituloBienvenida}>Torneos Activos 🏆</h1>
        </div>
        {esAdmin && (
          <button onClick={() => setMostrarModalCrear(true)} style={styles.botonCrear}>
            <span style={{ fontSize: '18px' }}>+</span> Nuevo Torneo
          </button>
        )}
      </div>
      
      {torneos.length === 0 ? (
        <div style={styles.emptyStateContenedor}>
          <div style={styles.emptyStateIcono}>🏆</div>
          <h3 style={styles.emptyStateTitulo}>Sin torneos a la vista</h3>
          <p style={styles.emptyStateSubtitulo}>
            Actualmente no hay competencias programadas en el circuito.
          </p>
          {esAdmin && (
            <button onClick={() => setMostrarModalCrear(true)} style={styles.botonCrearLlamativo}>
              Dar de alta el primer torneo
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {torneos.map((torneo) => (
            <TorneoCard 
              key={torneo.id || torneo._id} 
              torneo={torneo} 
              esAdmin={esAdmin}
              onVerDetalles={manejarVerDetalles} 
              onEditar={(t) => navigate(`/torneos/editar/${t.id || t._id}`)} 
            />
          ))}
        </div>
      )}

      {/* MODAL: CREAR NUEVO TORNEO */}
      {mostrarModalCrear && (
        <ModalCrearTorneo 
          onClose={() => setMostrarModalCrear(false)} 
          onTorneoCreado={() => window.location.reload()} 
        />
      )}

      {/* MODAL: INSCRIPCIÓN (Lo conservamos por si lo utilizas globalmente en esta vista) */}
      {mostrarModalInscripcion && (
        <FormInscripcionModal 
          onClose={() => setMostrarModalInscripcion(false)} 
          onInscripcionExitosa={() => window.location.reload()} 
        />
      )}
    </div>
  );
};

const styles = {
  // SOLUCIÓN AL PADDING: Unificamos el padding (Arriba, Derecha, Abajo(110px para la nav), Izquierda)
  contenedorPadre: { 
    padding: '24px 16px 110px 16px', 
    backgroundColor: '#0F0F10', 
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
  },
  
  headerPremium: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  subtituloPremium: { 
    fontSize: '13px', 
    color: '#8E8E93', 
    margin: '0 0 4px 0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  tituloBienvenida: { 
    fontSize: '28px', 
    fontWeight: '800', 
    color: '#ffffff', 
    margin: 0,
    letterSpacing: '-0.5px'
  },
  botonCrear: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    color: '#39FF14',
    border: '1px solid rgba(57, 255, 20, 0.3)',
    padding: '10px 16px',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
    gap: '20px' 
  },

  emptyStateContenedor: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#161618',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  emptyStateIcono: {
    width: '80px',
    height: '80px',
    borderRadius: '40px',
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    marginBottom: '20px',
    opacity: 0.8
  },
  emptyStateTitulo: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 8px 0'
  },
  emptyStateSubtitulo: {
    color: '#8E8E93',
    fontSize: '14px',
    margin: '0 0 24px 0',
    maxWidth: '300px'
  },
  botonCrearLlamativo: {
    backgroundColor: '#39FF14',
    color: '#0F0F10',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer'
  },

  loadingContainer: { display: 'flex', justifyContent: 'center', padding: '60px' },
  spinner: { width: '40px', height: '40px', border: '4px solid rgba(57, 255, 20, 0.2)', borderTop: '4px solid #39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  alerta: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '14px', fontWeight: '600', textAlign: 'center' }
};