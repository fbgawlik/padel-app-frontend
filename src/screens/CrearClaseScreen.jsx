// src/screens/CrearClaseScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

const CrearClaseScreen = () => {
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotification();
  
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModalHora, setMostrarModalHora] = useState(false);

  // Lista de horas rápidas para padel (modificables)
  const horasSugeridas = [
    "08:00", "09:30", "11:00", "16:00", "17:30", "19:00", "20:30", "22:00"
  ];

  const [nuevaClase, setNuevaClase] = useState({
    titulo: '',
    profesorId: '',
    fecha: '',
    hora: '',
    canchaId: '',
    cupoMax: 4,
    precio: '',
    precioCancha: '',
    frecuencia: 'unica'
  });

  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        const res = await API.get('/canchas');
        setCanchas(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error cargando canchas:", err);
      }
    };
    fetchCanchas();
  }, []);

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaClase(prev => ({ ...prev, [name]: value }));
  };

  const seleccionarHoraRapida = (hora) => {
    setNuevaClase(prev => ({ ...prev, hora }));
    setMostrarModalHora(false);
  };

  const gestionarCrearClase = async (e) => {
    e.preventDefault();
    
    if (!nuevaClase.canchaId) {
      mostrarNotificacion("Por favor, seleccioná una cancha para la clase.", 'error');
      return;
    }

    setLoading(true);
    try {
      // Parse de números para evitar enviar strings a la API
      const payload = {
        ...nuevaClase,
        cupoMax: Number(nuevaClase.cupoMax),
        precio: Number(nuevaClase.precio),
        precioCancha: Number(nuevaClase.precioCancha)
      };

      await API.post(`/clases/cancha/${nuevaClase.canchaId}`, payload);
      
      mostrarNotificacion('¡Clase creada exitosamente!', 'success');
      navigate('/clases');
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || 'Error al crear la clase.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.contenedor}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.titulo}>Configurar Clase</h1>
        <p style={styles.subtitulo}>Completá los detalles para publicar una nueva sesión.</p>
      </div>

      <div style={styles.tarjetaFormulario}>
        <form onSubmit={gestionarCrearClase} style={styles.formularioGrid}>
          
          <div style={styles.grupoInputFull}>
            <label style={styles.label}>Título de la Clase</label>
            <input 
              name="titulo" 
              placeholder="Ej: Clase Avanzada de Bandeja" 
              onChange={manejarCambioInput} 
              required 
              style={styles.input} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Profesor ID / Nombre</label>
            <input 
              name="profesorId" 
              placeholder="ID del profesor" 
              onChange={manejarCambioInput} 
              required 
              style={styles.input} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Cancha</label>
            <select name="canchaId" onChange={manejarCambioInput} required style={styles.input}>
              <option value="">Seleccionar...</option>
              {canchas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Selector de Fecha Nativo Estilizado */}
          <div style={styles.grupoInput}>
            <label style={styles.label}>Fecha</label>
            <input 
              type="date" 
              name="fecha" 
              onChange={manejarCambioInput} 
              required 
              style={styles.input} 
            />
          </div>

          {/* Selector de Hora con Modal Emergente Custom */}
          <div style={styles.grupoInput}>
            <label style={styles.label}>Hora</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="time" 
                name="hora" 
                value={nuevaClase.hora}
                onChange={manejarCambioInput} 
                required 
                style={{ ...styles.input, flex: 1 }} 
              />
              <button 
                type="button" 
                onClick={() => setMostrarModalHora(true)}
                style={styles.botonModalHora}
                title="Sugerencias de hora"
              >
                ⏰
              </button>
            </div>
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Cupo Máximo</label>
            <input 
              type="number" 
              name="cupoMax" 
              value={nuevaClase.cupoMax} 
              onChange={manejarCambioInput} 
              style={styles.input} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Frecuencia</label>
            <select name="frecuencia" onChange={manejarCambioInput} style={styles.input}>
              <option value="unica">Clase Única</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Honorarios Profe ($)</label>
            <input 
              type="number" 
              name="precio" 
              placeholder="0.00" 
              onChange={manejarCambioInput} 
              required 
              style={styles.input} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Costo Alquiler Cancha ($)</label>
            <input 
              type="number" 
              name="precioCancha" 
              placeholder="0.00" 
              onChange={manejarCambioInput} 
              required 
              style={styles.input} 
            />
          </div>

          <button type="submit" disabled={loading} style={styles.botonGuardar}>
            {loading ? 'Publicando...' : 'Publicar Clase'}
          </button>
        </form>
      </div>

      {/* ─── MODAL EMERGENTE CUSTOM PARA HORARIOS ─── */}
      {mostrarModalHora && (
        <div style={styles.overlayModal} onClick={() => setMostrarModalHora(false)}>
          <div style={styles.contenidoModal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.tituloModal}>Seleccionar Turno</h3>
            <p style={styles.subtituloModal}>Horarios frecuentes para Padel</p>

            <div style={styles.gridHorarios}>
              {horasSugeridas.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => seleccionarHoraRapida(h)}
                  style={{
                    ...styles.botonHoraGrid,
                    backgroundColor: nuevaClase.hora === h ? '#39FF14' : 'rgba(255, 255, 255, 0.05)',
                    color: nuevaClase.hora === h ? '#000' : '#FFF',
                  }}
                >
                  {h} hs
                </button>
              ))}
            </div>

            <button 
              type="button" 
              style={styles.botonCerrarModal}
              onClick={() => setMostrarModalHora(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  contenedor: { 
    width: '100%', 
    padding: '0 16px', 
    boxSizing: 'border-box' 
  },
  header: {
    marginBottom: '24px',
    textAlign: 'left'
  },
  titulo: { 
    fontSize: '24px', 
    fontWeight: '700', 
    color: '#FFFFFF',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px'
  },
  subtitulo: { 
    fontSize: '14px', 
    color: '#8A8A8E', 
    margin: 0 
  },
  tarjetaFormulario: { 
    backgroundColor: 'rgba(18, 18, 20, 0.85)', 
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '20px', 
    borderRadius: '24px', 
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.4)'
  },
  formularioGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
    gap: '16px' 
  },
  grupoInput: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px', 
    minWidth: 0,
    textAlign: 'left'
  },
  grupoInputFull: {
    gridColumn: '1 / -1',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px',
    textAlign: 'left'
  },
  label: { 
    fontSize: '12px', 
    fontWeight: '600',
    color: '#8A8A8E',
    letterSpacing: '-0.1px'
  },
  input: { 
    padding: '12px 14px', 
    backgroundColor: '#141416', 
    border: '1px solid rgba(255, 255, 255, 0.12)', 
    borderRadius: '14px', 
    color: '#FFFFFF', 
    fontSize: '14px',
    width: '100%', 
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  botonModalHora: {
    padding: '0 12px',
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '14px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  botonGuardar: { 
    gridColumn: '1 / -1', 
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#39FF14', 
    color: '#000000',
    border: 'none', 
    borderRadius: '16px', 
    fontWeight: '700', 
    fontSize: '15px',
    cursor: 'pointer', 
    marginTop: '12px',
    boxShadow: '0 0 15px rgba(57, 255, 20, 0.3)',
    transition: 'transform 0.1s ease'
  },

  /* ESTILOS DEL MODAL EMERGENTE */
  overlayModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2000,
  },
  contenidoModal: {
    backgroundColor: '#121214',
    borderTopLeftRadius: '28px',
    borderTopRightRadius: '28px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '24px',
    width: '100%',
    maxWidth: '480px',
    boxSizing: 'border-box',
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  tituloModal: {
    margin: 0,
    color: '#FFF',
    fontSize: '18px',
    fontWeight: '700'
  },
  subtituloModal: {
    color: '#8A8A8E',
    fontSize: '13px',
    marginBottom: '20px'
  },
  gridHorarios: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  botonHoraGrid: {
    padding: '12px 8px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  botonCerrarModal: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#8A8A8E',
    borderRadius: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default CrearClaseScreen;