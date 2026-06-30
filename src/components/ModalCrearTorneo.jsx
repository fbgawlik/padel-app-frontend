// src/components/ModalCrearTorneo.jsx
import React, { useState } from 'react';
import API from '../services/api';

const ModalCrearTorneo = ({ onClose, onTorneoCreado }) => {
  const categoriasDamas = ['1ra Damas', '2da Damas', '3ra Damas', '4ta Damas', '5ta Damas', '6ta Damas', '7ma Damas', '8va Damas'];
  const categoriasCaballeros = ['1ra Caballeros', '2da Caballeros', '3ra Caballeros', '4ta Caballeros', '5ta Caballeros', '6ta Caballeros', '7ma Caballeros', '8va Caballeros'];
  
  const opcionesCupos = [12, 15, 18, 21, 24];

  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    categorias: [], 
    cupoParejas: 12, 
    precio: '',
    premios: '',
    reglas: 'REGLAS DEL TORNEO:\n\n1. Todas las parejas que no pertenezcan a la categoría correspondiente serán descalificadas sin devolución de la inscripción.\n2. Tolerancia máxima de espera: 15 minutos respecto al horario programado.\n3. El sistema de juego será en formato de zonas y luego llaves eliminatorias.'
  });
  
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategoria = (cat) => {
    setFormData((prev) => {
      const seleccionadas = prev.categorias.includes(cat)
        ? prev.categorias.filter((c) => c !== cat)
        : [...prev.categorias, cat];
      
      seleccionadas.sort((a, b) => a.localeCompare(b));
      return { ...prev, categorias: seleccionadas };
    });
  };

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
      const payload = { ...formData, categoria: formData.categorias.join(' | ') };
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
        
        <div style={styles.header}>
          <h3 style={styles.titulo}>➕ Crear Nuevo Torneo</h3>
          <button onClick={onClose} style={styles.btnCerrar} title="Cerrar">❌</button>
        </div>

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

          <div style={styles.grupoInput}>
            <label style={styles.label}>Categorías a Disputar</label>
            
            <div style={styles.subSeccionCategorias}>
              <span style={styles.subLabel}>👩 Damas</span>
              <div style={styles.chipContainer}>
                {categoriasDamas.map(cat => {
                  const activo = formData.categorias.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoria(cat)}
                      style={activo ? styles.chipActivo : styles.chipInactivo}
                    >
                      {cat.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={styles.subSeccionCategorias}>
              <span style={styles.subLabel}>👨 Caballeros</span>
              <div style={styles.chipContainer}>
                {categoriasCaballeros.map(cat => {
                  const activo = formData.categorias.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategoria(cat)}
                      style={activo ? styles.chipActivo : styles.chipInactivo}
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
            <div style={styles.grupoInput}>
              <label style={styles.label}>Cupo de Parejas (Por Categoría)</label>
              <div style={styles.chipContainer}>
                {opcionesCupos.map(cupo => {
                  const activo = formData.cupoParejas === cupo;
                  // Usamos un azul/celeste neón para diferenciar los cupos de las categorías
                  const chipCupoActivo = {
                    ...styles.chipActivo,
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    color: '#00e5ff',
                    borderColor: 'rgba(0, 229, 255, 0.4)'
                  };
                  return (
                    <button
                      key={cupo}
                      type="button"
                      onClick={() => seleccionarCupo(cupo)}
                      style={activo ? chipCupoActivo : styles.chipInactivo}
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
              placeholder="Ej: Campeones: Paletas + Trofeo..."
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

// Estilos Premium Dark/Neon adaptados para el Modal
const styles = {
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' },
  modalContent: { backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', width: '100%', maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
  
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '24px' },
  titulo: { color: '#39FF14', margin: 0, fontSize: '20px', fontWeight: '800' },
  btnCerrar: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#8E8E93' },
  
  formContainer: { padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  
  row: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '220px' },
  label: { color: '#EAEAEA', fontSize: '14px', fontWeight: '600' },
  
  // Input Moderno
  input: { 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    color: '#ffffff', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    padding: '16px', 
    borderRadius: '14px', 
    outline: 'none', 
    fontSize: '15px', 
    transition: 'border-color 0.2s ease' 
  },
  helpText: { fontSize: '12px', color: '#ff4d4d', marginTop: '4px', fontWeight: '500' },
  
  subSeccionCategorias: { backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' },
  subLabel: { display: 'block', color: '#8E8E93', fontSize: '12px', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' },
  
  // Estructura Choice Chips
  chipContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  chipInactivo: { 
    padding: '10px 20px', 
    backgroundColor: 'transparent', 
    border: '1px solid rgba(255, 255, 255, 0.15)', 
    borderRadius: '24px', 
    color: '#8E8E93', 
    fontSize: '14px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease' 
  },
  chipActivo: { 
    padding: '10px 20px', 
    backgroundColor: 'rgba(57, 255, 20, 0.1)', 
    border: '1px solid rgba(57, 255, 20, 0.4)', 
    borderRadius: '24px', 
    color: '#39FF14', 
    fontSize: '14px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease' 
  },
  
  footerAcciones: { display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' },
  btnCancelar: { backgroundColor: 'transparent', color: '#8E8E93', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },
  btnCrear: { backgroundColor: '#39FF14', color: '#0F0F10', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }
};