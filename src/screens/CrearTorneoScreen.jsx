// src/screens/CrearTorneoScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const CrearTorneoScreen = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  // Lista de categorías generada (1ra a 8va + Extras)
  const categoriasDisponibles = [
    '1ra Caballeros', '2da Caballeros', '3ra Caballeros', '4ta Caballeros', '5ta Caballeros', '6ta Caballeros', '7ma Caballeros', '8va Caballeros',
    '1ra Damas', '2da Damas', '3ra Damas', '4ta Damas', '5ta Damas', '6ta Damas', '7ma Damas',
    'Suma 13', 'Mixto'
  ];

  const [formData, setFormData] = useState({
    complejoId: '',
    nombre: '',
    categorias: [],
    fechaInicio: '',
    fechaFin: '',
    precioInscripcion: '',
    cupoMaximo: 12 // Por defecto un múltiplo de 3
  });

  // Manejar selección múltiple de categorías
  const toggleCategoria = (cat) => {
    setFormData((prev) => {
      const seleccionadas = prev.categorias;
      if (seleccionadas.includes(cat)) {
        return { ...prev, categorias: seleccionadas.filter(c => c !== cat) };
      } else {
        return { ...prev, categorias: [...seleccionadas, cat] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de cupo divisible por 3
    if (formData.cupoMaximo % 3 !== 0) {
      alert("El cupo máximo debe ser un múltiplo de 3 (Ej: 9, 12, 15, 18).");
      return;
    }

    if (formData.categorias.length === 0) {
      alert("Debes seleccionar al menos una categoría.");
      return;
    }

    try {
      setCargando(true);
      // Aquí envías los datos a tu backend
      // await API.post('/torneos', formData);
      alert('Torneo creado exitosamente');
      navigate('/torneos'); 
    } catch (error) {
      console.error('Error al crear el torneo:', error);
      alert('Error al crear el torneo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.screenContainer}>
      {/* HEADER */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(-1)} style={styles.iconButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 style={styles.headerTitle}>Registrar Torneo</h1>
        <div style={{width: '24px'}}></div> {/* Spacer para centrar el título */}
      </div>

      <form onSubmit={handleSubmit} style={styles.formContainer}>
        
        {/* COMPLEJO (Podrías mapear tus complejos reales aquí) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Complejo Organizador</label>
          <select 
            style={styles.input} 
            value={formData.complejoId}
            onChange={(e) => setFormData({...formData, complejoId: e.target.value})}
            required
          >
            <option value="" disabled>Seleccioná el complejo...</option>
            <option value="1">Complejo Prueba</option>
            <option value="2">ADN Pádel</option>
          </select>
        </div>

        {/* NOMBRE DEL TORNEO */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nombre del Torneo</label>
          <input 
            type="text" 
            style={styles.input} 
            placeholder="Ej: Copa Invierno 2026"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            required
          />
        </div>

        {/* CATEGORÍAS (Selección Múltiple tipo Chips) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Categorías (Selección múltiple)</label>
          <div style={styles.chipsContainer}>
            {categoriasDisponibles.map(cat => {
              const seleccionado = formData.categorias.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategoria(cat)}
                  style={{
                    ...styles.chip,
                    backgroundColor: seleccionado ? 'rgba(57, 255, 20, 0.1)' : 'transparent',
                    borderColor: seleccionado ? '#39FF14' : 'rgba(255,255,255,0.1)',
                    color: seleccionado ? '#39FF14' : '#A0A0A5',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* FECHAS (Fila de 2 columnas) */}
        <div style={styles.row}>
          <div style={{...styles.inputGroup, flex: 1}}>
            <label style={styles.label}>Fecha Inicio</label>
            <input 
              type="date" 
              style={styles.input} 
              value={formData.fechaInicio}
              onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
              required
            />
          </div>
          <div style={{...styles.inputGroup, flex: 1}}>
            <label style={styles.label}>Fecha Fin</label>
            <input 
              type="date" 
              style={styles.input} 
              value={formData.fechaFin}
              onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
              required
            />
          </div>
        </div>

        {/* PRECIO Y CUPOS (Fila de 2 columnas) */}
        <div style={styles.row}>
          <div style={{...styles.inputGroup, flex: 1}}>
            <label style={styles.label}>Precio x Pareja ($)</label>
            <input 
              type="number" 
              style={styles.input} 
              placeholder="Ej: 15000"
              value={formData.precioInscripcion}
              onChange={(e) => setFormData({...formData, precioInscripcion: e.target.value})}
              required
            />
          </div>
          <div style={{...styles.inputGroup, flex: 1}}>
            <label style={styles.label}>Cupo (Múltiplo de 3)</label>
            <input 
              type="number" 
              style={styles.input} 
              step="3"
              min="3"
              value={formData.cupoMaximo}
              onChange={(e) => setFormData({...formData, cupoMaximo: e.target.value})}
              required
            />
          </div>
        </div>

        {/* BOTÓN SUBMIT */}
        <button 
          type="submit" 
          style={styles.submitButton}
          disabled={cargando}
        >
          {cargando ? 'CREANDO...' : 'GUARDAR TORNEO'}
        </button>

      </form>
    </div>
  );
};

const styles = {
  screenContainer: {
    backgroundColor: '#111111', // Fondo oscuro base
    width: '100%',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    paddingBottom: '40px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#161618',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  iconButton: {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex'
  },
  headerTitle: {
    color: '#39FF14', // Verde Neón
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '0.5px'
  },
  
  formContainer: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  row: {
    display: 'flex',
    gap: '16px',
    width: '100%'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#EAEAEA',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },

  // Estilos de los Chips (Selección Múltiple)
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px'
  },
  chip: {
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  submitButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    backgroundColor: '#39FF14',
    color: '#111', // Letra oscura para contrastar con el fondo neón
    border: 'none',
    fontSize: '16px',
    fontWeight: '800',
    letterSpacing: '1px',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 16px rgba(57, 255, 20, 0.3)'
  }
};

export default CrearTorneoScreen;