// src/components/FormInscripcionModal.jsx
import React, { useState } from 'react';
import API from '../services/api'; // ✅ CORREGIDO: Ruta corregida para la carpeta src/components/

const FormInscripcionModal = ({ torneoDetalle, onClose, onInscripcionExitosa, styles }) => {
  // Fallbacks de estilos para asegurar compatibilidad visual al 100%
  const estiloRestricciones = styles.bloqueRestricciones || { marginTop: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' };
  const estiloBotonSiNo = styles.botonSiNo || { padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', backgroundColor: 'transparent', border: '1px solid' };
  const estiloSecundario = styles.botonSecundarioModal || { backgroundColor: 'transparent', color: '#8A8A8A', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };

  // 1. Estados locales exclusivos de la inscripción
  const [formInscripcion, setFormInscripcion] = useState({
    jugador1: '',
    telefono1: '',
    jugador2: '',
    telefono2: '',
    categoriaSelected: '',
    restriccionHoraria: ''
  });
  const [tieneRestriccion, setTieneRestriccion] = useState(false);
  const [opcionesHorarias, setOpcionesHorarias] = useState([]);
  const [detalleHorarioLibre, setDetalleHorarioLibre] = useState('');

  // 2. Manejadores de inputs
  const manejarCambioInscripcion = (e) => {
    setFormInscripcion({ ...formInscripcion, [e.target.name]: e.target.value });
  };

  const toggleOpcionHoraria = (opcion) => {
    setOpcionesHorarias((prev) => {
      const nuevas = prev.includes(opcion) ? prev.filter((o) => o !== opcion) : [...prev, opcion];
      const parteCheckboxes = nuevas.join(', ');
      const stringFinal = [parteCheckboxes, detalleHorarioLibre].filter(Boolean).join(' - Obs: ');
      setFormInscripcion((f) => ({ ...f, restriccionHoraria: stringFinal }));
      return nuevas;
    });
  };

  const manejarCambioTextoLibre = (e) => {
    const valor = e.target.value;
    setDetalleHorarioLibre(valor);
    const parteCheckboxes = opcionesHorarias.join(', ');
    const stringFinal = [parteCheckboxes, valor].filter(Boolean).join(' - Obs: ');
    setFormInscripcion((f) => ({ ...f, restriccionHoraria: stringFinal }));
  };

  // 3. Lógica de envío al Backend
  const ejecutarInscripcion = async (e) => {
    e.preventDefault();

    if (!formInscripcion.categoriaSelected) {
      return alert("Por favor, selecciona una categoría.");
    }

    const cantInscriptos = torneoDetalle.inscripciones?.filter(
      (i) => i.categoria === formInscripcion.categoriaSelected
    ).length || 0;
    const cupoMaximo = torneoDetalle.cupoParejas || 16;

    if (cantInscriptos >= cupoMaximo) {
      return alert("Lamentablemente esta categoría se completó hace instantes. Elegí otra o contactá al club.");
    }

    const j1Form = formInscripcion.jugador1.trim().toLowerCase();
    const j2Form = formInscripcion.jugador2.trim().toLowerCase();

    // Validación preventiva en el Front (Duplicados)
    const yaSeEncuentraInscripto = torneoDetalle.inscripciones?.find((insc) => {
      const j1Lista = insc.jugador1.trim().toLowerCase();
      const j2Lista = insc.jugador2.trim().toLowerCase();
      return j1Lista === j1Form || j2Lista === j1Form || j1Lista === j2Form || j2Lista === j2Form;
    });

    if (yaSeEncuentraInscripto) {
      return alert("🚨 ¡Error de duplicación! Uno o ambos jugadores ya están registrados en este torneo.");
    }

    try {
      await API.post(`/torneos/${torneoDetalle.id}/inscripciones`, {
        categoriaSelected: formInscripcion.categoriaSelected,
        jugador1: formInscripcion.jugador1,
        telefono1: formInscripcion.telefono1,
        jugador2: formInscripcion.jugador2,
        telefono2: formInscripcion.telefono2,
        restriccionHoraria: formInscripcion.restriccionHoraria
      });

      alert(`¡Inscripción exitosa en ${formInscripcion.categoriaSelected}!`);
      onInscripcionExitosa(); 
      onClose(); 
    } catch (error) {
      console.error("Error al inscribir:", error);
      const mensajeError = error.response?.data?.error || "Ocurrió un error al inscribir la pareja.";
      alert(mensajeError);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.tarjetaFormulario, maxWidth: '600px', width: '90%', margin: 'auto', position: 'relative' }}>
        <h3 style={styles.subtituloForm}>Inscripción: {torneoDetalle.nombre}</h3>
        
        <form onSubmit={ejecutarInscripcion}>
          {/* SELECCIÓN DE CATEGORÍA */}
          <div style={styles.grupoInput}>
            <label style={styles.label}>Categoría a Anotarse</label>
            <select
              required
              name="categoriaSelected"
              value={formInscripcion.categoriaSelected}
              onChange={manejarCambioInscripcion}
              style={styles.input}
            >
              <option value="">Selecciona una categoría...</option>
              {torneoDetalle.categoria?.split(' | ').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* DATOS JUGADOR 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', marginTop: '12px' }}>
            <div style={styles.grupoInput}>
              <label style={styles.label}>Jugador 1 (Tú)</label>
              <input required name="jugador1" value={formInscripcion.jugador1} onChange={manejarCambioInscripcion} style={styles.input} placeholder="Nombre completo" />
            </div>
            <div style={styles.grupoInput}>
              <label style={styles.label}>Teléfono</label>
              <input required name="telefono1" value={formInscripcion.telefono1} onChange={manejarCambioInscripcion} style={styles.input} placeholder="Ej: 3624112233" />
            </div>
          </div>

          {/* DATOS JUGADOR 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={styles.grupoInput}>
              <label style={styles.label}>Jugador 2 (Compañero/a)</label>
              <input required name="jugador2" value={formInscripcion.jugador2} onChange={manejarCambioInscripcion} style={styles.input} placeholder="Nombre completo" />
            </div>
            <div style={styles.grupoInput}>
              <label style={styles.label}>Teléfono Compañero</label>
              <input required name="telefono2" value={formInscripcion.telefono2} onChange={manejarCambioInscripcion} style={styles.input} placeholder="Nro de celular" />
            </div>
          </div>

          {/* BLOQUE RESTRICCIONES HORARIAS */}
          <div style={estiloRestricciones}>
            <label style={{ ...styles.label, fontWeight: '700', display: 'block', marginBottom: '12px', color: '#EAEAEA' }}>
              ¿Tienen restricciones horarias?
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setTieneRestriccion(true)}
                style={{
                  ...estiloBotonSiNo,
                  borderColor: tieneRestriccion ? 'rgba(255, 51, 51, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  color: tieneRestriccion ? '#ff4d4d' : '#8A8A8A'
                }}
              >
                Sí, hay restricciones
              </button>
              <button
                type="button"
                onClick={() => {
                  setTieneRestriccion(false);
                  setOpcionesHorarias([]);
                  setFormInscripcion(prev => ({ ...prev, restriccionHoraria: '' }));
                }}
                style={{
                  ...estiloBotonSiNo,
                  borderColor: !tieneRestriccion ? 'rgba(0, 255, 102, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  color: !tieneRestriccion ? '#00ff66' : '#8A8A8A'
                }}
              >
                No, libre
              </button>
            </div>

            {tieneRestriccion && (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {['Viernes Noche', 'Sábado Mañana', 'Sábado Tarde', 'Domingo Mañana'].map((opc) => {
                    const check = opcionesHorarias.includes(opc);
                    return (
                      <button
                        key={opc}
                        type="button"
                        onClick={() => toggleOpcionHoraria(opc)}
                        style={{
                          ...styles.badgeCategoriaForm,
                          backgroundColor: check ? 'rgba(255, 77, 77, 0.1)' : 'transparent',
                          color: check ? '#ff4d4d' : '#8A8A8A',
                          border: check ? '1px solid rgba(255, 77, 77, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {opc}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Detalle adicional (Ej: No puedo de 14 a 16hs)"
                  value={detalleHorarioLibre}
                  onChange={manejarCambioTextoLibre}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          {/* ACCIONES DEL FORMULARIO */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={estiloSecundario}>
              Cancelar
            </button>
            <button type="submit" style={styles.botonPrimario}>
              Confirmar Inscripción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormInscripcionModal;