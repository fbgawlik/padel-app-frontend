// src/components/ModalCrearTorneo.jsx
import React, { useState } from 'react';
import API from '../services/api';

const ModalCrearTorneo = ({ onClose, onTorneoCreado }) => {
  // Arreglos de categorías separados por rama
  const categoriasDamas = ['1ra Damas', '2da Damas', '3ra Damas', '4ta Damas', '5ta Damas', '6ta Damas', '7ma Damas', '8va Damas'];
  const categoriasCaballeros = ['1ra Caballeros', '2da Caballeros', '3ra Caballeros', '4ta Caballeros', '5ta Caballeros', '6ta Caballeros', '7ma Caballeros', '8va Caballeros'];
  
  // Opciones de cupos (múltiplos de 3, de 12 a 24)
  const opcionesCupos = [12, 15, 18, 21, 24];

  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    categorias: [], 
    cupoParejas: 12, // Cupo por defecto
    precio: '',
    premios: '',
    reglas: 'REGLAS DEL TORNEO:\n\n1. Todas las parejas que no pertenezcan a la categoría correspondiente serán descalificadas sin devolución de la inscripción.\n2. Tolerancia máxima de espera: 15 minutos respecto al horario programado.\n3. El sistema de juego será en formato de zonas y luego llaves eliminatorias.'
  });
  
  const [cargando, setCargando] = useState(false);

  // Manejador de inputs de texto/fechas estándar
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador para los botones de las categorías (Toggle)
  const toggleCategoria = (cat) => {
    setFormData((prev) => {
      const seleccionadas = prev.categorias.includes(cat)
        ? prev.categorias.filter((c) => c !== cat)
        : [...prev.categorias, cat];
      
      // Ordenar alfabéticamente para mantener un orden lógico
      seleccionadas.sort((a, b) => a.localeCompare(b));
      
      return { ...prev, categorias: seleccionadas };
    });
  };

  // Manejador para los botones de cupos
  const seleccionarCupo = (cupo) => {
    setFormData({ ...formData, cupoParejas: cupo });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.categorias.length === 0) {
      return alert('⚠️ Por favor, seleccioná al menos una categoría para el torneo.');
    }

    setCargando(true);
    try {
      const payload = {
        ...formData,
        categoria: formData.categorias.join(' | ') 
      };

      const res = await API.post('/torneos/crear', payload);
      alert('🏆 ¡Torneo creado con éxito!');
      onTorneoCreado(res.data);
      onClose(); 
    } catch (error) {
      console.error("Error al crear torneo:", error);
      alert(error.response?.data?.error || "Hubo un error al crear el torneo");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        {/* Header Fijo */}
        <div style={styles.header}>
          <h3 style={styles.titulo}>➕ Crear Nuevo Torneo</h3>
          <button onClick={onClose} style={styles.btnCerrar} title="Cerrar">❌</button>
        </div>

        {/* Formulario con Scroll */}
        <form style={styles.formContainer}>
          
          <div style={styles.grupoInput}>
            <label style={styles.label}>Nombre del Torneo</label>
            <input required name="nombre" value={formData.nombre} onChange={handleChange} style={styles.input} placeholder="Ej: Copa ADN Pádel - Edición Invierno" />
          </div>

          <div style={styles.row}>
            <div style={styles.grupoInput}>
              <label style={styles.label}>Fecha de Inicio</label>
              <input required type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.grupoInput}>
              <label style={styles.label}>Fecha de Fin</label>
              <input required type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          {/* SELECCIÓN DE CATEGORÍAS (DAMAS Y CABALLEROS) */}
          <div style={styles.grupoInput}>
            <label style={styles.label}>Categorías a Disputar</label>
            
            {/* Sub-sección Damas */}
            <div style={styles.subSeccionCategorias}>
              <span style={styles.subLabel}>👩 Damas</span>
              <div style={styles.badgeContainer}>
                {categoriasDamas.map(cat => {
                  const activo = formData.categorias.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoria(cat)}
                      style={{
                        ...styles.badgeBtn,
                        backgroundColor: activo ? 'rgba(0, 255, 102, 0.15)' : 'transparent',
                        color: activo ? '#00ff66' : '#8A8A8A',
                        border: activo ? '1px solid #00ff66' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {cat.split(' ')[0]} {/* Muestra solo "1ra", "2da", etc. para ahorrar espacio */}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sub-sección Caballeros */}
            <div style={styles.subSeccionCategorias}>
              <span style={styles.subLabel}>👨 Caballeros</span>
              <div style={styles.badgeContainer}>
                {categoriasCaballeros.map(cat => {
                  const activo = formData.categorias.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoria(cat)}
                      style={{
                        ...styles.badgeBtn,
                        backgroundColor: activo ? 'rgba(0, 255, 102, 0.15)' : 'transparent',
                        color: activo ? '#00ff66' : '#8A8A8A',
                        border: activo ? '1px solid #00ff66' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {cat.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
            {formData.categorias.length === 0 && <span style={styles.helpText}>Seleccioná al menos una categoría.</span>}
          </div>

          <div style={styles.row}>
            {/* NUEVA SELECCIÓN DE CUPOS CON BOTONES */}
            <div style={styles.grupoInput}>
              <label style={styles.label}>Cupo de Parejas (Por Categoría)</label>
              <div style={styles.badgeContainer}>
                {opcionesCupos.map(cupo => {
                  const activo = formData.cupoParejas === cupo;
                  return (
                    <button
                      key={cupo}
                      type="button"
                      onClick={() => seleccionarCupo(cupo)}
                      style={{
                        ...styles.badgeBtn,
                        backgroundColor: activo ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                        color: activo ? '#00e5ff' : '#8A8A8A',
                        border: activo ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)',
                        padding: '8px 20px'
                      }}
                    >
                      {cupo}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={styles.grupoInput}>
              <label style={styles.label}>Precio de Inscripción ($)</label>
              <input required type="number" min="0" step="500" name="precio" value={formData.precio} onChange={handleChange} style={styles.input} placeholder="Ej: 15000" />
            </div>
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Premios</label>
            <textarea 
              required 
              name="premios" 
              value={formData.premios} 
              onChange={handleChange} 
              style={{...styles.input, height: '60px', resize: 'vertical'}} 
              placeholder="Ej: Campeones: Paletas + Trofeo. Subcampeones: Indumentaria + Medalla."
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Reglas y Condiciones</label>
            <textarea 
              required 
              name="reglas" 
              value={formData.reglas} 
              onChange={handleChange} 
              style={{...styles.input, height: '120px', resize: 'vertical'}} 
            />
          </div>

        </form>

        {/* Footer con Botones Fijos */}
        <div style={styles.footerAcciones}>
          <button type="button" onClick={onClose} style={styles.btnCancelar}>Cancelar</button>
          <button type="button" onClick={handleSubmit} disabled={cargando} style={styles.btnCrear}>
            {cargando ? 'Creando...' : 'Guardar Torneo'}
          </button>
        </div>

      </div>
    </div>
  );
};

// Estilos actualizados
const styles = {
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' },
  modalContent: { backgroundColor: '#141414', border: '1px solid rgba(0, 255, 102, 0.3)', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,255,102,0.1)' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' },
  titulo: { color: '#00ff66', margin: 0, fontSize: '20px', fontWeight: '800', textTransform: 'uppercase' },
  btnCerrar: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', filter: 'grayscale(100%)', transition: 'transform 0.2s' },
  
  formContainer: { padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' },
  
  row: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '220px' },
  label: { color: '#EAEAEA', fontSize: '13px', fontWeight: '600' },
  input: { backgroundColor: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '10px', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s' },
  helpText: { fontSize: '11px', color: '#666', marginTop: '2px' },
  
  subSeccionCategorias: { backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' },
  subLabel: { display: 'block', color: '#8A8A8A', fontSize: '12px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' },
  badgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  badgeBtn: { padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' },
  
  footerAcciones: { display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' },
  btnCancelar: { backgroundColor: 'transparent', color: '#8A8A8A', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' },
  btnCrear: { backgroundColor: '#00ff66', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.2s' }
};

export default ModalCrearTorneo;