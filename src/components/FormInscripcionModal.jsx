// src/components/FormInscripcionModal.jsx
import React, { useState } from 'react';
import API from '../services/api';

const FormInscripcionModal = ({ torneoDetalle, onClose, onInscripcionExitosa }) => {
  // Generamos los horarios desde las 08:00 hasta las 22:00
  const horariosDisponibles = Array.from({ length: 15 }, (_, i) => {
    const hora = i + 8;
    return `${hora < 10 ? '0' : ''}${hora}:00`;
  });

  const categoriasTorneo = torneoDetalle?.categoria ? torneoDetalle.categoria.split(' | ') : [];

  const [formData, setFormData] = useState({
    categoriaSeleccionada: '',
    jugador1: { nombre: '', dni: '', telefono: '' },
    jugador2: { nombre: '', dni: '', telefono: '' },
    restriccionesHorarias: [] // Guardará los horarios en los que NO pueden jugar
  });

  const [cargando, setCargando] = useState(false);

  const handleJugadorChange = (jugador, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [jugador]: {
        ...prev[jugador],
        [campo]: valor
      }
    }));
  };

  const toggleRestriccionHoraria = (horario) => {
    setFormData((prev) => {
      const seleccionados = prev.restriccionesHorarias.includes(horario)
        ? prev.restriccionesHorarias.filter((h) => h !== horario)
        : [...prev.restriccionesHorarias, horario];
      
      return { ...prev, restriccionesHorarias: seleccionados };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoriaSeleccionada) {
      return alert('⚠️ Por favor, seleccioná la categoría en la que desean inscribirse.');
    }

    // Validación preventiva de UI: Jugadores duplicados
    if (formData.jugador1.dni === formData.jugador2.dni) {
      return alert('⚠️ Los DNI de ambos jugadores no pueden ser iguales.');
    }

    setCargando(true);
    try {
      const payload = {
        torneoId: torneoDetalle.id || torneoDetalle._id,
        categoria: formData.categoriaSeleccionada,
        jugador1: formData.jugador1,
        jugador2: formData.jugador2,
        restricciones: formData.restriccionesHorarias
      };

      await API.post('/inscripciones/nueva', payload);
      alert('✅ ¡Inscripción registrada con éxito!');
      onInscripcionExitosa();
      onClose();
    } catch (error) {
      console.error("Error al inscribir:", error);
      alert(error.response?.data?.error || "Hubo un error al procesar la inscripción");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        
        <div style={styles.header}>
          <h3 style={styles.titulo}>📝 Inscripción al Torneo</h3>
          <p style={styles.subtitulo}>{torneoDetalle.nombre}</p>
          <button onClick={onClose} style={styles.btnCerrar} title="Cerrar">❌</button>
        </div>

        <form style={styles.formContainer}>
          
          {/* SELECCIÓN DE CATEGORÍA */}
          <div style={styles.seccion}>
            <label style={styles.labelTitle}>1. ¿En qué categoría se anotan?</label>
            <div style={styles.chipContainer}>
              {categoriasTorneo.map(cat => {
                const activo = formData.categoriaSeleccionada === cat.trim();
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoriaSeleccionada: cat.trim() })}
                    style={activo ? styles.chipActivo : styles.chipInactivo}
                  >
                    {cat.trim()}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={styles.row}>
            {/* JUGADOR 1 */}
            <div style={styles.jugadorCard}>
              <h4 style={styles.jugadorTitulo}>Jugador 1</h4>
              <div style={styles.grupoInput}>
                <label style={styles.label}>Nombre Completo</label>
                <input required value={formData.jugador1.nombre} onChange={(e) => handleJugadorChange('jugador1', 'nombre', e.target.value)} style={styles.input} placeholder="Ej: Juan Pérez" />
              </div>
              <div style={styles.grupoInput}>
                <label style={styles.label}>DNI</label>
                <input required type="number" value={formData.jugador1.dni} onChange={(e) => handleJugadorChange('jugador1', 'dni', e.target.value)} style={styles.input} placeholder="Sin puntos" />
              </div>
              <div style={styles.grupoInput}>
                <label style={styles.label}>Teléfono</label>
                <input required type="tel" value={formData.jugador1.telefono} onChange={(e) => handleJugadorChange('jugador1', 'telefono', e.target.value)} style={styles.input} placeholder="Código de área + número" />
              </div>
            </div>

            {/* JUGADOR 2 */}
            <div style={styles.jugadorCard}>
              <h4 style={styles.jugadorTitulo}>Jugador 2</h4>
              <div style={styles.grupoInput}>
                <label style={styles.label}>Nombre Completo</label>
                <input required value={formData.jugador2.nombre} onChange={(e) => handleJugadorChange('jugador2', 'nombre', e.target.value)} style={styles.input} placeholder="Ej: Martín Gómez" />
              </div>
              <div style={styles.grupoInput}>
                <label style={styles.label}>DNI</label>
                <input required type="number" value={formData.jugador2.dni} onChange={(e) => handleJugadorChange('jugador2', 'dni', e.target.value)} style={styles.input} placeholder="Sin puntos" />
              </div>
              <div style={styles.grupoInput}>
                <label style={styles.label}>Teléfono</label>
                <input required type="tel" value={formData.jugador2.telefono} onChange={(e) => handleJugadorChange('jugador2', 'telefono', e.target.value)} style={styles.input} placeholder="Código de área + número" />
              </div>
            </div>
          </div>

          {/* RESTRICCIONES HORARIAS */}
          <div style={styles.seccion}>
            <label style={styles.labelTitle}>3. Restricciones Horarias</label>
            <p style={styles.textoAyuda}>Seleccioná los horarios en los que la pareja <strong>NO puede jugar</strong> por motivos de trabajo o fuerza mayor.</p>
            <div style={styles.chipContainer}>
              {horariosDisponibles.map(horario => {
                const restringido = formData.restriccionesHorarias.includes(horario);
                return (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => toggleRestriccionHoraria(horario)}
                    style={restringido ? styles.chipRestringido : styles.chipInactivo}
                  >
                    {horario}
                  </button>
                )
              })}
            </div>
          </div>

        </form>

        <div style={styles.footerAcciones}>
          <button type="button" onClick={onClose} style={styles.btnCancelar}>Cancelar</button>
          <button type="button" onClick={handleSubmit} disabled={cargando} style={styles.btnInscribir}>
            {cargando ? 'Procesando...' : 'Confirmar Inscripción'}
          </button>
        </div>

      </div>
    </div>
  );
};

// Estilos Premium Dark/Neon adaptados
const styles = {
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' },
  modalContent: { backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', width: '100%', maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
  
  header: { position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '24px' },
  titulo: { color: '#39FF14', margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800' },
  subtitulo: { color: '#8E8E93', margin: 0, fontSize: '14px', fontWeight: '600' },
  btnCerrar: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#8E8E93' },
  
  formContainer: { padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' },
  
  seccion: { display: 'flex', flexDirection: 'column', gap: '12px' },
  labelTitle: { color: '#ffffff', fontSize: '16px', fontWeight: '700' },
  textoAyuda: { color: '#8E8E93', fontSize: '13px', margin: '-4px 0 8px 0' },
  
  row: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  jugadorCard: { flex: 1, minWidth: '280px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' },
  jugadorTitulo: { color: '#EAEAEA', margin: 0, fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' },
  
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#8E8E93', fontSize: '13px', fontWeight: '600' },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '12px', outline: 'none', fontSize: '14px', transition: 'border-color 0.2s ease' },
  
  chipContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  chipInactivo: { padding: '10px 18px', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', color: '#8E8E93', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  chipActivo: { padding: '10px 18px', backgroundColor: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.4)', borderRadius: '24px', color: '#39FF14', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' },
  
  // Chip Rojo/Naranja para bloqueos de horario
  chipRestringido: { padding: '10px 18px', backgroundColor: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.5)', borderRadius: '24px', color: '#ff4d4d', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' },
  
  footerAcciones: { display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' },
  btnCancelar: { backgroundColor: 'transparent', color: '#8E8E93', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },
  btnInscribir: { backgroundColor: '#39FF14', color: '#0F0F10', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '15px' }
};