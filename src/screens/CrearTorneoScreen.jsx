// src/screens/CrearTorneoScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQueryClient } from '@tanstack/react-query'; 
import { styles } from './CrearTorneoScreen.styles';

const REGLAS_TRADICIONAL = `REGLAS DEL TORNEO (FORMATO TRADICIONAL):

1. Fase inicial de zonas (round robin) y fase final a llaves eliminatorias directas.
2. Tolerancia máxima de espera: 15 minutos respecto al horario programado.
3. Parejas descalificadas sin reembolso en caso de categoría inadecuada.`;

const REGLAS_AMERICANO = `REGLAS DEL TORNEO AMERICANO ⚡:

1. Formato de juego rápido por tiempo o a número fijo de juegos/puntos (ej. 21 puntos o tie-break).
2. Rotación de parejas/rivales según la modalidad del torneo.
3. Tolerancia de espera: 10 minutos estricta para mantener el cronograma.`;

const CrearTorneoScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); 
  const [cargando, setCargando] = useState(false);
  const [listaComplejos, setListaComplejos] = useState([]); 

  // 🔔 ESTADO DE LAS NOTIFICACIONES PERSONALIZADAS (Estilo Toast)
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'success' });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast({ visible: false, mensaje: '', tipo: 'success' });
    }, 4000);
  };

  const categoriasDamas = ['1ra Damas', '2da Damas', '3ra Damas', '4ta Damas', '5ta Damas', '6ta Damas', '7ma Damas', '8va Damas'];
  const categoriasCaballeros = ['1ra Caballeros', '2da Caballeros', '3ra Caballeros', '4ta Caballeros', '5ta Caballeros', '6ta Caballeros', '7ma Caballeros', '8va Caballeros'];
  const opcionesCupos = [9, 12, 15,18, 21, 24, 27, 30, 33];

  const [formData, setFormData] = useState({
    tipoTorneo: 'TRADICIONAL', // 'TRADICIONAL' | 'AMERICANO'
    complejoId: '', 
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    categorias: [],
    cupoParejas: 16,
    precio: '',
    premios: '',
    reglas: REGLAS_TRADICIONAL,
    imagenArchivo: null, 
    imagenPreview: null 
  });

  // Obtener la lista de clubes del backend
  useEffect(() => {
    const obtenerComplejos = async () => {
      try {
        const res = await API.get('/complejos');
        if (res.data && res.data.length > 0) {
          setListaComplejos(res.data);
          setFormData(prev => ({ ...prev, complejoId: res.data[0].id }));
        }
      } catch (error) {
        console.error('Error al traer los complejos:', error);
        mostrarAlerta('No se pudieron cargar los complejos deportivos.', 'error');
      }
    };
    obtenerComplejos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Selector de Tipo de Torneo (Tradicional vs Americano)
  const handleCambioTipoTorneo = (tipo) => {
    setFormData((prev) => ({
      ...prev,
      tipoTorneo: tipo,
      reglas: tipo === 'AMERICANO' ? REGLAS_AMERICANO : REGLAS_TRADICIONAL
    }));
  };

  // Manejar preview e imagen física
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ 
        ...formData, 
        imagenArchivo: file,
        imagenPreview: URL.createObjectURL(file)
      });
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
      mostrarAlerta('Por favor, selecciona un complejo para el torneo.', 'error');
      return;
    }

    if (formData.categorias.length === 0) {
      mostrarAlerta('Debes seleccionar al menos una categoría.', 'error');
      return;
    }

    if (!formData.nombre.trim()) {
      mostrarAlerta('El torneo debe tener un nombre válido.', 'error');
      return;
    }

    if (formData.fechaInicio && formData.fechaFin && formData.fechaFin < formData.fechaInicio) {
      mostrarAlerta('La fecha de fin debe ser igual o posterior a la fecha de inicio.', 'error');
      return;
    }

    try {
      setCargando(true);

      const datosParaEnviar = new FormData();
      
      // Si es americano y el nombre no trae la palabra, le agregamos el prefijo para identificación directa
      let nombreTorneoFinal = formData.nombre.trim();
      if (formData.tipoTorneo === 'AMERICANO' && !nombreTorneoFinal.toLowerCase().includes('americano')) {
        nombreTorneoFinal = `${nombreTorneoFinal} (Americano)`;
      }

      datosParaEnviar.append('nombre', nombreTorneoFinal);
      datosParaEnviar.append('fechaInicio', formData.fechaInicio);
      datosParaEnviar.append('fechaFin', formData.fechaFin);
      
      // Categorías concatenadas
      const stringCategorias = formData.categorias.join(' | ');
      datosParaEnviar.append('categoria', stringCategorias); 

      // Parseos numéricos obligatorios
      const precioFloat = parseFloat(formData.precio);
      const cupoInt = parseInt(formData.cupoParejas, 10);

      datosParaEnviar.append('precioInscripcion', isNaN(precioFloat) ? 0 : precioFloat);
      datosParaEnviar.append('cupoParejas', isNaN(cupoInt) ? 16 : cupoInt);
      
      datosParaEnviar.append('premios', formData.premios.trim());
      
      // Adjuntamos flag de formato dentro del texto de reglas
      const reglasFinales = `[FORMATO: ${formData.tipoTorneo}]\n\n${formData.reglas.trim()}`;
      datosParaEnviar.append('reglas', reglasFinales);
      datosParaEnviar.append('complejoId', formData.complejoId);

      if (formData.imagenArchivo) {
        datosParaEnviar.append('imagenPortada', formData.imagenArchivo);
      }

      // Solicitud al Backend
      await API.post('/torneos/crear', datosParaEnviar);

      queryClient.invalidateQueries({ queryKey: ['torneos'] });

      mostrarAlerta('¡Torneo registrado y publicado con éxito! 🎉', 'success');
      
      setTimeout(() => {
        navigate('/torneos');
      }, 2000);

    } catch (error) {
      console.error('Error completo recibido del backend:', error.response?.data || error.message);
      const backendMsg = error.response?.data?.error || 'Hubo un error al intentar crear el torneo.';
      mostrarAlerta(backendMsg, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 🔔 BANNER DE NOTIFICACIÓN PERSONALIZADO */}
      {toast.visible && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.tipo === 'success' ? '#1c3d23' : '#3d1c1c',
          borderColor: toast.tipo === 'success' ? '#BEF264' : '#ff4d4d',
        }}>
          <div style={{...styles.toastDot, backgroundColor: toast.tipo === 'success' ? '#BEF264' : '#ff4d4d'}} />
          <span style={{...styles.toastText, color: toast.tipo === 'success' ? '#BEF264' : '#ff4d4d'}}>{toast.mensaje}</span>
        </div>
      )}

      {/* HEADER */}
      <header style={styles.header}>
        <button onClick={() => navigate('/torneos')} style={styles.btnVolver}>
          ← Volver a Torneos
        </button>
        <h1 style={styles.headerTitle}>Nuevo Torneo</h1>
      </header>

      <form onSubmit={handleSubmit} style={styles.formContainer}>

        {/* SELECTOR DE FORMATO DE TORNEO */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Formato / Dinámica de Juego</label>
          <div style={styles.tipoTorneoGrid}>
            <button
              type="button"
              onClick={() => handleCambioTipoTorneo('TRADICIONAL')}
              style={{
                ...styles.tipoTorneoCard,
                ...(formData.tipoTorneo === 'TRADICIONAL' ? styles.tipoTorneoCardActive : {})
              }}
            >
              <span style={{ fontSize: '20px' }}>🏆</span>
              <div>
                <div style={styles.tipoTorneoTitulo}>Tradicional</div>
                <div style={styles.tipoTorneoSub}>Fase de Zonas + Eliminatoria</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCambioTipoTorneo('AMERICANO')}
              style={{
                ...styles.tipoTorneoCard,
                ...(formData.tipoTorneo === 'AMERICANO' ? styles.tipoTorneoCardAmericanoActive : {})
              }}
            >
              <span style={{ fontSize: '20px' }}>⚡</span>
              <div>
                <div style={styles.tipoTorneoTitulo}>Americano Express</div>
                <div style={styles.tipoTorneoSub}>Todos vs Todos / Dinámico</div>
              </div>
            </button>
          </div>
        </div>

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
            placeholder={formData.tipoTorneo === 'AMERICANO' ? "Ej: Americano Nocturno 6ta Categoría" : "Ej: Copa Challenger ADN Pádel"}
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
          <label style={styles.label}>Cupo Máximo por Categoría</label>
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

        {/* IMAGEN DE PORTADA CON PREVIEW */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Flyer / Imagen de Portada</label>
          <div style={styles.uploadContainer}>
            {formData.imagenPreview ? (
              <div style={styles.previewContainer}>
                <img src={formData.imagenPreview} alt="Flyer Preview" style={styles.previewImage} />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, imagenArchivo: null, imagenPreview: null }))}
                  style={styles.removeImageButton}
                >
                  Cambiar imagen
                </button>
              </div>
            ) : (
              <label style={styles.dropzone}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BEF264" strokeWidth="2" style={{ marginBottom: '8px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span style={{ fontSize: '13px', color: '#8E8E93', fontWeight: '600' }}>Subir Flyer del Torneo</span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
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
          <label style={styles.label}>Reglas y condiciones</label>
          <textarea
            name="reglas"
            placeholder="Describe las reglas, horarios, penalties y condiciones del torneo"
            value={formData.reglas}
            onChange={handleChange}
            style={{ ...styles.input, height: '120px', resize: 'vertical' }}
            required
          />
        </div>

        {/* BOTÓN ACCIÓN */}
        <button type="submit" disabled={cargando} style={cargando ? styles.btnSubmitDisabled : styles.btnSubmit}>
          {cargando ? 'Publicando torneo...' : `Publicar Torneo (${formData.tipoTorneo === 'AMERICANO' ? 'Americano ⚡' : 'Tradicional 🏆'})`}
        </button>
      </form>
    </div>
  );
};

export default CrearTorneoScreen;