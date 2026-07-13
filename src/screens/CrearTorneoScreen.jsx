// src/screens/CrearTorneoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQueryClient } from '@tanstack/react-query'; 

const CrearTorneoScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); 
  const [cargando, setCargando] = useState(false);
  const [listaComplejos, setListaComplejos] = useState([]); 

  const categoriasDamas = ['1ra Damas', '2da Damas', '3ra Damas', '4ta Damas', '5ta Damas', '6ta Damas', '7ma Damas', '8va Damas'];
  const categoriasCaballeros = ['1ra Caballeros', '2da Caballeros', '3ra Caballeros', '4ta Caballeros', '5ta Caballeros', '6ta Caballeros', '7ma Caballeros', '8va Caballeros'];
  const opcionesCupos = [12, 15, 18, 21, 24, 27, 30];

  const [formData, setFormData] = useState({
    complejoId: '', 
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    categorias: [],
    cupoParejas: 12,
    precio: '',
    premios: '',
    imagenArchivo: null, // 🔥 AHORA GUARDAMOS EL ARCHIVO FÍSICO AQUÍ
    reglas: 'REGLAS DEL TORNEO:\n\n1. Parejas mal categorizadas serán descalificadas sin derecho a reclamo.\n2. Tolerancia máxima de espera: 15 minutos.\n3. Formato de juego: Fase de zonas y llaves eliminatorias.'
  });

  useEffect(() => {
    const obtenerComplejos = async () => {
      try {
        const res = await API.get('/complejos');
        if (res.data && res.data.length > 0) {
          setListaComplejos(res.data);
          setFormData(prev => ({ ...prev, complejoId: res.data[0].id }));
        }
      } catch (error) {
        console.error('Error al traer los complejos del backend:', error);
      }
    };
    obtenerComplejos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 NUEVA FUNCIÓN PARA MANEJAR LA CARGA DE LA IMAGEN
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imagenArchivo: e.target.files[0] });
    }
  };

  const toggleCategoria = (cat) => {
    setFormData((prev) => {
      const seleccionadas = prev.categorias;
      if (seleccionadas.includes(cat)) {
        return { ...prev, categorias: seleccionadas.filter((c) => c !== cat) };
      } else {
        return { ...prev, categorias: [...seleccionadas, cat] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.complejoId) {
      alert('Por favor, selecciona un complejo para este torneo.');
      return;
    }

    try {
      setCargando(true);

      // 🔥 MAGIA AQUÍ: Usamos FormData para poder enviar archivos e información mezclada
      const datosParaEnviar = new FormData();
      datosParaEnviar.append('nombre', formData.nombre);
      datosParaEnviar.append('fechaInicio', formData.fechaInicio);
      datosParaEnviar.append('fechaFin', formData.fechaFin);
      datosParaEnviar.append('categoria', formData.categorias.join(' | ')); 
      datosParaEnviar.append('precioInscripcion', formData.precio || 0);
      datosParaEnviar.append('cupoMaximo', formData.cupoParejas || 12);
      datosParaEnviar.append('premios', formData.premios);
      datosParaEnviar.append('reglas', formData.reglas);
      datosParaEnviar.append('complejoId', formData.complejoId);

      // Si el usuario seleccionó una imagen, la adjuntamos
      if (formData.imagenArchivo) {
        datosParaEnviar.append('imagenPortada', formData.imagenArchivo);
      }

      // Petición real al servidor backend. Axios detecta el FormData y ajusta los headers automáticamente
      await API.post('/torneos/crear', datosParaEnviar);

      queryClient.invalidateQueries({ queryKey: ['torneos'] });

      alert('¡Torneo registrado y publicado con éxito! 🎉');
      navigate('/torneos');
    } catch (error) {
      console.error('Error completo recibido del backend:', error.response?.data || error.message);
      alert('Hubo un error al intentar crear el torneo. Revisa la consola.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER MINIMALISTA */}
      <header style={styles.header}>
        <button onClick={() => navigate('/torneos')} style={styles.btnVolver}>
          ← Volver a Torneos
        </button>
        <h1 style={styles.headerTitle}>Nuevo Torneo</h1>
      </header>

      <form onSubmit={handleSubmit} style={styles.formContainer}>
        
        {/* COMPLEJO / CLUB */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Complejo / Club Anfitrión</label>
          <select
            name="complejoId"
            value={formData.complejoId}
            onChange={handleChange}
            style={styles.selectInput}
            required
          >
            {listaComplejos.length === 0 ? (
              <option value="">Cargando complejos...</option>
            ) : (
              listaComplejos.map((comp) => (
                <option key={comp.id} value={comp.id} style={styles.optionStyle}>
                  {comp.nombre}
                </option>
              ))
            )}
          </select>
        </div>

        {/* NOMBRE DEL TORNEO */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nombre del Torneo</label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Copa Challenger ADN Pádel"
            value={formData.nombre}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        {/* FECHAS */}
        <div style={styles.row}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label style={styles.label}>Fecha Inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label style={styles.label}>Fecha Fin</label>
            <input
              type="date"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        {/* CATEGORÍAS CABALLEROS */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Categorías Caballeros</label>
          <div style={styles.scrollChips}>
            {categoriasCaballeros.map((cat) => {
              const activo = formData.categorias.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategoria(cat)}
                  style={activo ? styles.chipActivo : styles.chipInactivo}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* CATEGORÍAS DAMAS */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Categorías Damas</label>
          <div style={styles.scrollChips}>
            {categoriasDamas.map((cat) => {
              const activo = formData.categorias.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategoria(cat)}
                  style={activo ? styles.chipActivo : styles.chipInactivo}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* CUPO MÁXIMO */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Cupo Máximo (Parejas)</label>
          <div style={styles.scrollChips}>
            {opcionesCupos.map((cupo) => {
              const activo = formData.cupoParejas === cupo;
              return (
                <button
                  type="button"
                  key={cupo}
                  onClick={() => setFormData({ ...formData, cupoParejas: cupo })}
                  style={activo ? styles.chipCupoActivo : styles.chipInactivo}
                >
                  {cupo} Parejas
                </button>
              );
            })}
          </div>
        </div>

        {/* PRECIO */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Precio de Inscripción (Por Pareja)</label>
          <input
            type="number"
            name="precio"
            placeholder="Ej: 15000"
            value={formData.precio}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        {/* 🔥 IMAGEN DE PORTADA (ACTUALIZADO A FILE) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Flyer / Imagen de Portada (Opcional)</label>
          <input
            type="file"
            name="imagenPortada"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.input}
          />
        </div>

        {/* PREMIOS */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Premios</label>
          <textarea
            name="premios"
            placeholder="Ej: Paletas de alta gama, indumentaria, trofeos..."
            value={formData.premios}
            onChange={handleChange}
            style={{ ...styles.input, height: '80px', resize: 'none' }}
            required
          />
        </div>

        {/* REGLAS */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Reglas e Información adicional</label>
          <textarea
            name="reglas"
            value={formData.reglas}
            onChange={handleChange}
            style={{ ...styles.input, height: '140px', resize: 'vertical', fontFamily: 'sans-serif' }}
            required
          />
        </div>

        {/* BOTÓN ACCIÓN */}
        <button type="submit" disabled={cargando} style={styles.btnSubmit}>
          {cargando ? 'Publicando torneo...' : 'Publicar Torneo de Pádel'}
        </button>
      </form>
    </div>
  );
};

// ─── ESTILOS PREMIUM (MODERN NEON CYBERPUNK) ───
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0A0A0B',
    color: '#FFF',
    paddingBottom: '120px', 
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  btnVolver: {
    background: 'none',
    border: 'none',
    color: '#8E8E93',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#FFF',
    margin: 0,
    letterSpacing: '-0.5px'
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
  },
  selectInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(57, 255, 20, 0.3)',
    color: '#39FF14',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  optionStyle: {
    backgroundColor: '#1C1C1E',
    color: '#FFF'
  },
  scrollChips: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollbarWidth: 'none', 
    WebkitOverflowScrolling: 'touch'
  },
  chipInactivo: {
    flex: '0 0 auto',
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
    backgroundColor: 'rgba(57, 255, 20, 0.12)', 
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
    backgroundColor: 'rgba(0, 229, 255, 0.12)', 
    border: '1px solid #00E5FF',
    borderRadius: '16px',
    color: '#00E5FF',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 229, 255, 0.2)'
  },
  btnSubmit: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    backgroundColor: '#39FF14',
    border: 'none',
    color: '#000',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0px 8px 24px rgba(57, 255, 20, 0.3)',
    transition: 'transform 0.1s ease'
  }
};

export default CrearTorneoScreen;