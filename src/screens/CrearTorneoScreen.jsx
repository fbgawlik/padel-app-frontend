// src/screens/CrearTorneoScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const CrearTorneoScreen = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  // Categorías basadas en tu configuración previa
  const categoriasDamas = ['1ra Damas', '2da Damas', '3ra Damas', '4ta Damas', '5ta Damas', '6ta Damas', '7ma Damas'];
  const categoriasCaballeros = ['1ra Caballeros', '2da Caballeros', '3ra Caballeros', '4ta Caballeros', '5ta Caballeros', '6ta Caballeros', '7ma Caballeros'];
  const opcionesCupos = [12, 15, 18, 21, 24];

  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    categorias: [],
    cupoParejas: 12,
    precio: '',
    premios: '',
    imagenPortada: '', // 👈 NUEVO CAMPO
    reglas: 'REGLAS DEL TORNEO:\n\n1. Parejas mal categorizadas serán descalificadas...\n'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategoria = (cat) => {
    setFormData((prev) => {
      const seleccionadas = prev.categorias.includes(cat)
        ? prev.categorias.filter((c) => c !== cat)
        : [...prev.categorias, cat];
      return { ...prev, categorias: seleccionadas };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.categorias.length === 0) {
      return alert('⚠️ Por favor, seleccioná al menos una categoría.');
    }

    setCargando(true);
    try {
      const payload = { ...formData, categoria: formData.categorias.join(' | ') };
       await API.post('/torneos/crear', payload);
      alert('🏆 ¡Torneo creado con éxito!');
      navigate('/torneos');
    } catch (error) {
      console.error("Error al crear torneo:", error);
      alert("Hubo un error al crear el torneo");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.screenContainer}>
      
      {/* ─── ENCABEZADO TIPO APP MODERNA ─── */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 style={styles.headerTitle}>Crear Torneo</h1>
        <div style={{width: '40px'}}></div> {/* Spacer */}
      </div>

      <form onSubmit={handleSubmit} style={styles.formScroll}>
        
        {/* TARJETA 1: Información Principal */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Información General</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre del Torneo</label>
            <input 
              required name="nombre" value={formData.nombre} onChange={handleChange} 
              style={styles.input} placeholder="Ej: Copa de Invierno 2026" 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>URL de la Imagen de Portada</label>
            <input 
              type="url"
              name="imagenPortada" 
              value={formData.imagenPortada} 
              onChange={handleChange} 
              style={styles.input} 
              placeholder="Ej: https://misitio.com/poster-torneo.jpg" 
            />
            {/* Vista previa miniatura (opcional, le da un toque premium) */}
            {formData.imagenPortada && (
              <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', height: '120px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={formData.imagenPortada} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Fecha Inicio</label>
              <input required type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Fecha Fin</label>
              <input required type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} style={styles.input} />
            </div>
          </div>
        </div>

        {/* TARJETA 2: SCROLL HORIZONTAL DE CATEGORÍAS (Inspirado en el video) */}
        <div style={styles.cardTransparent}>
          <h2 style={styles.sectionTitle}>Categorías Caballeros</h2>
          <div style={styles.horizontalScroll}>
            {categoriasCaballeros.map(cat => {
              const activo = formData.categorias.includes(cat);
              return (
                <button
                  key={cat} type="button" onClick={() => toggleCategoria(cat)}
                  style={activo ? styles.chipActivo : styles.chipInactivo}
                >
                  {cat.split(' ')[0]}
                </button>
              )
            })}
          </div>

          <h2 style={{...styles.sectionTitle, marginTop: '20px'}}>Categorías Damas</h2>
          <div style={styles.horizontalScroll}>
            {categoriasDamas.map(cat => {
              const activo = formData.categorias.includes(cat);
              return (
                <button
                  key={cat} type="button" onClick={() => toggleCategoria(cat)}
                  style={activo ? styles.chipActivo : styles.chipInactivo}
                >
                  {cat.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>

        {/* TARJETA 3: Configuración de Cupos y Precio */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Cupos y Precio</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Cupo por Categoría (Parejas)</label>
            <div style={styles.horizontalScroll}>
              {opcionesCupos.map(cupo => (
                <button
                  key={cupo} type="button" onClick={() => setFormData({...formData, cupoParejas: cupo})}
                  style={formData.cupoParejas === cupo ? styles.chipCupoActivo : styles.chipInactivo}
                >
                  {cupo} Parejas
                </button>
              ))}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Precio de Inscripción ($)</label>
            <input 
              required type="number" min="0" step="500" name="precio" value={formData.precio} onChange={handleChange} 
              style={styles.input} placeholder="Ej: 15000" 
            />
          </div>
        </div>

        {/* TARJETA 4: Detalles Extras (estilo "Amenities" del video) */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Reglas y Premios</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Premios</label>
            <textarea 
              required name="premios" value={formData.premios} onChange={handleChange} 
              style={{...styles.input, height: '80px', resize: 'vertical'}} 
              placeholder="Ej: Paletas, indumentaria, trofeos..."
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Reglamento</label>
            <textarea 
              required name="reglas" value={formData.reglas} onChange={handleChange} 
              style={{...styles.input, height: '120px', resize: 'vertical'}} 
            />
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN FLOTANTE AL FINAL */}
        <button 
          type="submit" 
          disabled={cargando} 
          style={styles.submitAction}
        >
          {cargando ? 'PROCESANDO...' : 'PUBLICAR TORNEO'}
        </button>

      </form>
    </div>
  );
};

const styles = {
  // Transparente para heredar el fondo del Layout que ya tiene el Ambient Glow
  screenContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px 20px 20px',
    position: 'sticky',
    top: 0,
    backgroundColor: 'transparent', // Se mezcla con el Layout
    zIndex: 10,
  },
  backButton: {
    width: '40px', height: '40px', borderRadius: '20px',
    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    backdropFilter: 'blur(10px)'
  },
  headerTitle: {
    color: '#FFF', fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '0.5px'
  },

  // Espacio para evitar que el BottomNavigation tape el botón de guardar
  formScroll: {
    padding: '0 20px 40px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  // Estilo de tarjetas limpias tipo iOS / App de viajes
  card: {
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  cardTransparent: { // Usado para que los chips horizontales respiren mejor
    display: 'flex',
    flexDirection: 'column',
  },

  sectionTitle: {
    color: '#FFF', fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.2px'
  },

  row: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '45%' },
  
  label: { color: '#A0A0A5', fontSize: '13px', fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: '#FFF',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '16px',
    borderRadius: '16px',
    outline: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'border-color 0.2s ease',
  },

  // El secreto del diseño móvil: Contenedores con scroll horizontal nativo
  horizontalScroll: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    paddingBottom: '8px', // Espacio para la sombra/scroll
    scrollbarWidth: 'none', // Oculta barra en Firefox
    msOverflowStyle: 'none', // Oculta barra en IE/Edge
  },
  
  chipInactivo: {
    flex: '0 0 auto', // Evita que se encojan
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    color: '#A0A0A5',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  chipActivo: {
    flex: '0 0 auto',
    padding: '12px 24px',
    backgroundColor: 'rgba(57, 255, 20, 0.12)', // Verde neón suave
    border: '1px solid #39FF14',
    borderRadius: '16px',
    color: '#39FF14',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(57, 255, 20, 0.2)'
  },
  chipCupoActivo: {
    flex: '0 0 auto',
    padding: '12px 24px',
    backgroundColor: 'rgba(0, 229, 255, 0.12)', // Cian neón suave para diferenciar
    border: '1px solid #00E5FF',
    borderRadius: '16px',
    color: '#00E5FF',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 229, 255, 0.2)'
  },

  submitAction: {
    width: '100%',
    padding: '18px',
    marginTop: '10px',
    backgroundColor: '#39FF14',
    color: '#0A0A0B',
    border: 'none',
    borderRadius: '20px', // Bien redondeado como en la app de viajes
    fontSize: '16px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(57, 255, 20, 0.3)',
    transition: 'transform 0.1s ease',
  }
};

export default CrearTorneoScreen;