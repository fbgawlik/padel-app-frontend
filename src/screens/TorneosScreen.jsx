// src/screens/TorneosScreen.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTorneos } from '../hooks/useTorneos';
import { TorneoCard } from '../components/TorneoCard';
import VisualizadorCuadros from '../components/VisualizadorCuadros'; 
import { AuthContext } from '../context/AuthContext';
import ModalCrearTorneo from '../components/ModalCrearTorneo'; 
import FormInscripcionModal from '../components/FormInscripcionModal'; 

export const TorneosScreen = () => {
  const { torneos, cargando, error } = useTorneos();
  const navigate = useNavigate(); 
  const { usuario } = useContext(AuthContext);
  
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false); 
  const [mostrarModalInscripcion, setMostrarModalInscripcion] = useState(false); 

  const esAdmin = usuario?.rol === 'admin_complejo' || usuario?.rol === 'organizador';

  const manejarVerDetalles = (torneo) => {
    setTorneoSeleccionado(torneo);
    if (torneo.categoria) {
      setCategoriaSeleccionada(torneo.categoria.split(' | ')[0]);
    }
  };

  if (cargando) return <div style={{ color: '#fff', textAlign: 'center' }}>Cargando torneos...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={styles.contenedor}>
      <div style={styles.headerSeccion}>
        <h2 style={styles.titulo}>Torneos Activos - ADN Pádel</h2>
        {esAdmin && (
          <button onClick={() => setMostrarModalCrear(true)} style={styles.btnCrear}>
            ➕ Crear Torneo
          </button>
        )}
      </div>
      
      {torneos.length === 0 ? (
        <div style={styles.sinTorneos}>
          <p>No hay torneos activos en este momento.</p>
          {esAdmin && <p style={{ fontSize: '14px', color: '#8A8A8A', marginTop: '5px' }}>¡Haz clic en "Crear Torneo" para dar de alta el primero!</p>}
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

      {/* MODAL: VER DETALLES / CUADROS */}
      {torneoSeleccionado && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            
            <div style={styles.modalHeader}>
              <h3 style={{ color: '#00ffcc', margin: 0 }}>{torneoSeleccionado.nombre}</h3>
              <button onClick={() => setTorneoSeleccionado(null)} style={styles.btnCerrar}>❌</button>
            </div>

            <div style={styles.selectorContenedor}>
              <label style={{ color: '#8A8A8A', fontSize: '14px' }}>Filtro por Categoría:</label>
              <select 
                value={categoriaSeleccionada} 
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                style={styles.selectDark}
              >
                {torneoSeleccionado.categoria?.split(' | ').map(cat => (
                  <option key={cat.trim()} value={cat.trim()}>{cat.trim()}</option>
                ))}
              </select>
            </div>

            {categoriaSeleccionada ? (
              <VisualizadorCuadros 
                torneoId={torneoSeleccionado.id || torneoSeleccionado._id} 
                torneo={torneoSeleccionado} 
                categoria={categoriaSeleccionada}
                usuario={usuario}
                onUpdateResultado={(partido) => alert(`Lógica para cargar score del partido ${partido.id}`)}
                onAbrirInscripcion={() => setMostrarModalInscripcion(true)} 
              />
            ) : (
              <p style={{color: '#888'}}>Selecciona una categoría para ver los cuadros.</p>
            )}

          </div>
        </div>
      )}

      {/* MODAL: CREAR NUEVO TORNEO */}
      {mostrarModalCrear && (
        <ModalCrearTorneo 
          onClose={() => setMostrarModalCrear(false)} 
          onTorneoCreado={() => window.location.reload()} 
        />
      )}

      {/* MODAL: INSCRIPCIÓN */}
      {mostrarModalInscripcion && (
        <FormInscripcionModal 
          torneoDetalle={torneoSeleccionado} 
          onClose={() => setMostrarModalInscripcion(false)} 
          onInscripcionExitosa={() => window.location.reload()} 
          styles={styles} 
        />
      )}
    </div>
  );
};

// Estilos unificados
const styles = {
  contenedor: { padding: '20px', backgroundColor: '#121212', minHeight: '100vh' },
  headerSeccion: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  titulo: { color: '#00ffcc', textTransform: 'uppercase', margin: 0 },
  btnCrear: { backgroundColor: '#00ff66', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s' },
  sinTorneos: { textAlign: 'center', color: '#8A8A8A', marginTop: '60px', fontSize: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' },
  modalContent: { backgroundColor: '#141414', border: '1px solid rgba(0, 255, 204, 0.3)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '15px' },
  btnCerrar: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', filter: 'grayscale(100%)', transition: 'filter 0.2s' },
  selectorContenedor: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '10px' },
  selectDark: { backgroundColor: '#1A1A1A', color: '#00ffcc', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontWeight: 'bold' },
  
  // Estilos heredados para el FormInscripcionModal
  tarjetaFormulario: { backgroundColor: '#1A1A1A', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  botonPrimario: { backgroundColor: '#00ff66', color: '#000', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  subtituloForm: { color: '#00ffcc', marginBottom: '20px' },
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#8A8A8A', fontSize: '14px', fontWeight: '600' },
  input: { backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: '10px', width: '100%' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }
};