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
  
  const [nuevaClase, setNuevaClase] = useState({
    titulo: '', profesorId: '', fecha: '', hora: '',
    canchaId: '', cupoMax: 4, precio: '', 
    precioCancha: '', // ✅ NUEVO CAMPO
    frecuencia: 'unica' // ✅ NUEVO CAMPO
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

  const manejarCambioArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNuevaClase(prev => ({ ...prev, fotoProfesor: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const gestionarCrearClase = async (e) => {
    e.preventDefault();
    
    // Validación extra: nos aseguramos de que haya elegido una cancha antes de disparar la ruta
    if (!nuevaClase.canchaId) {
      mostrarNotificacion("Por favor, seleccioná una cancha para la clase.", 'error');
      return;
    }

    setLoading(true);
    try {
      // ✅ CAMBIO REST: Ahora apuntamos a la ruta jerárquica /clases/cancha/:id
      await API.post(`/clases/cancha/${nuevaClase.canchaId}`, nuevaClase);
      
      mostrarNotificacion('¡Clase creada exitosamente!', 'success');
      navigate('/clases'); // Redirigimos al catálogo
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || 'Error al crear la clase.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
 return (
    <div style={styles.contenedor}>
      <h1 style={styles.titulo}>Configurar Nueva Clase</h1>
      <p style={styles.subtitulo}>Completá los detalles para publicar una nueva sesión.</p>

      <div style={styles.tarjetaFormulario}>
        <form onSubmit={gestionarCrearClase} style={styles.formularioGrid}>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Título</label>
            <input name="titulo" onChange={manejarCambioInput} required style={styles.input} />
          </div>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Profesor</label>
            <input name="profesorId" onChange={manejarCambioInput} required style={styles.input} />
          </div>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Fecha</label>
            <input type="date" name="fecha" onChange={manejarCambioInput} required style={styles.input} />
          </div>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Hora</label>
            <input type="time" name="hora" onChange={manejarCambioInput} required style={styles.input} />
          </div>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Cancha</label>
            <select name="canchaId" onChange={manejarCambioInput} required style={styles.input}>
              <option value="">Seleccionar...</option>
              {canchas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Cupo Máximo</label>
            <input type="number" name="cupoMax" value={nuevaClase.cupoMax} onChange={manejarCambioInput} style={styles.input} />
          </div>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Precio Enseñanza ($)</label>
            <input type="number" name="precio" placeholder="Honorarios Profe" onChange={manejarCambioInput} required style={styles.input} />
          </div>
          
          {/* ✅ NUEVOS CAMPOS SEGÚN LA IMAGEN */}
          <div style={styles.grupoInput}>
            <label style={styles.label}>Precio Cancha ($)</label>
            <input type="number" name="precioCancha" placeholder="Costo alquiler" onChange={manejarCambioInput} required style={styles.input} />
          </div>
          <div style={styles.grupoInput}>
            <label style={styles.label}>Frecuencia</label>
            <select name="frecuencia" onChange={manejarCambioInput} style={styles.input}>
              <option value="unica">Clase Única</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.botonGuardar}>
            {loading ? 'Publicando...' : 'Publicar Clase'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  contenedor: { padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff' },
  titulo: { fontSize: '28px', marginBottom: '8px' },
  subtitulo: { color: '#8A8A8A', marginBottom: '32px' },
  tarjetaFormulario: { backgroundColor: '#121212', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '100%', boxSizing: 'border-box' },
  formularioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 },
  label: { fontSize: '13px', color: '#8A8A8A' },
  input: { padding: '12px', backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', color: '#fff', width: '100%', boxSizing: 'border-box' },
 botonGuardar: { gridColumn: '1 / -1', width: '100%', padding: '14px', backgroundColor: '#00ff66', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};

export default CrearClaseScreen;