// src/screens/CrearClaseScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

const CrearClaseScreen = () => {
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotification();
  
  const [complejos, setComplejos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarModalHora, setMostrarModalHora] = useState(false);
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
  const [mostrarSelectorHora, setMostrarSelectorHora] = useState(false);
  const [busquedaProfesor, setBusquedaProfesor] = useState('');
  const [mostrarResultadosProfesor, setMostrarResultadosProfesor] = useState(false);

  // Lista de horas rápidas para padel (modificables)
  const horasSugeridas = [
    '08:00', '09:30', '11:00', '16:00', '17:30', '19:00', '20:30', '22:00'
  ];

  const [nuevaClase, setNuevaClase] = useState({
    titulo: '',
    profesorId: '',
    profesorLabel: '',
    fecha: '',
    hora: '',
    complejoId: '',
    canchaId: '',
    cupoMax: 4,
    precio: '',
    precioCancha: '',
    frecuencia: 'unica'
  });

  const [calendarioBase, setCalendarioBase] = useState({
    mes: new Date().getMonth(),
    anio: new Date().getFullYear()
  });

  const NOMBRE_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  useEffect(() => {
    const fetchComplejos = async () => {
      try {
        const res = await API.get('/complejos');
        setComplejos(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error cargando complejos:', err);
      }
    };
    fetchComplejos();
  }, []);

  useEffect(() => {
    const fetchCanchas = async () => {
      if (!nuevaClase.complejoId) {
        setCanchas([]);
        setNuevaClase(prev => ({ ...prev, canchaId: '' }));
        return;
      }

      try {
        const res = await API.get(`/complejos/${nuevaClase.complejoId}`);
        setCanchas(Array.isArray(res.data.canchas) ? res.data.canchas : []);
      } catch (err) {
        console.error('Error cargando canchas del complejo:', err);
        setCanchas([]);
      }
    };

    fetchCanchas();
  }, [nuevaClase.complejoId]);

  useEffect(() => {
    if (!busquedaProfesor.trim()) {
      setProfesores([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (busquedaProfesor.trim().length < 3) {
        setProfesores([]);
        return;
      }

      try {
        const res = await API.get(`/torneos/buscar-companero?busqueda=${encodeURIComponent(busquedaProfesor)}`);
        const usuarios = Array.isArray(res.data) ? res.data : [];
        setProfesores(usuarios);
        setMostrarResultadosProfesor(true);
      } catch (err) {
        console.error('Error buscando profesores:', err);
        setProfesores([]);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [busquedaProfesor]);

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;

    if (name === 'profesorSearch') {
      setBusquedaProfesor(value);
      setNuevaClase(prev => ({ ...prev, profesorLabel: value, profesorId: '' }));
      return;
    }

    setNuevaClase(prev => ({ ...prev, [name]: value }));

    if (name === 'complejoId') {
      setNuevaClase(prev => ({ ...prev, canchaId: '' }));
    }
  };

  const manejarCambioFecha = () => {
    setMostrarSelectorFecha(prev => !prev);
    setMostrarSelectorHora(false);
  };

  const manejarCambioHora = () => {
    setMostrarSelectorHora(prev => !prev);
    setMostrarSelectorFecha(false);
  };

  const seleccionarFecha = (dia) => {
    const fecha = new Date(calendarioBase.anio, calendarioBase.mes, dia);
    const fechaISO = fecha.toISOString().split('T')[0];

    setNuevaClase(prev => ({ ...prev, fecha: fechaISO }));
    setMostrarSelectorFecha(false);
  };

  const seleccionarHora = (hora) => {
    setNuevaClase(prev => ({ ...prev, hora }));
    setMostrarSelectorHora(false);
  };

  const handleProfesorSeleccionado = (profesor) => {
    setNuevaClase(prev => ({
      ...prev,
      profesorId: profesor.id,
      profesorLabel: `${profesor.nombre} ${profesor.apellido}`
    }));
    setBusquedaProfesor('');
    setProfesores([]);
    setMostrarResultadosProfesor(false);
  };

  const seleccionarHoraRapida = (hora) => {
    setNuevaClase(prev => ({ ...prev, hora }));
    setMostrarModalHora(false);
  };

  const diasDelMes = useMemo(() => {
    const primerDia = new Date(calendarioBase.anio, calendarioBase.mes, 1).getDay();
    const diasEnMes = new Date(calendarioBase.anio, calendarioBase.mes + 1, 0).getDate();
    const dias = [];

    for (let i = 0; i < primerDia; i += 1) {
      dias.push(null);
    }

    for (let dia = 1; dia <= diasEnMes; dia += 1) {
      dias.push(dia);
    }

    return dias;
  }, [calendarioBase]);

  const fechaSeleccionadaTexto = nuevaClase.fecha
    ? new Date(nuevaClase.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Seleccionar fecha';

  const gestionarCrearClase = async (e) => {
    e.preventDefault();
    
    if (!nuevaClase.complejoId) {
      mostrarNotificacion('Debes seleccionar un complejo.', 'error');
      return;
    }

    if (!nuevaClase.canchaId) {
      mostrarNotificacion('Debes seleccionar una cancha.', 'error');
      return;
    }

    if (!nuevaClase.profesorId) {
      mostrarNotificacion('Debes seleccionar un profesor válido.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        titulo: nuevaClase.titulo,
        fecha: nuevaClase.fecha,
        hora: nuevaClase.hora,
        cupoMax: Number(nuevaClase.cupoMax),
        precio: Number(nuevaClase.precio),
        precioCancha: Number(nuevaClase.precioCancha),
        frecuencia: nuevaClase.frecuencia
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
              value={nuevaClase.titulo}
              onChange={manejarCambioInput} 
              required 
              style={styles.input} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Complejo</label>
            <select
              name="complejoId"
              value={nuevaClase.complejoId}
              onChange={manejarCambioInput}
              required
              style={styles.input}
            >
              <option value="">Seleccionar un complejo...</option>
              {complejos.map(complejo => (
                <option key={complejo.id} value={complejo.id}>
                  {complejo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Cancha</label>
            <select
              name="canchaId"
              value={nuevaClase.canchaId}
              onChange={manejarCambioInput}
              required
              disabled={!nuevaClase.complejoId}
              style={{
                ...styles.input,
                ...(nuevaClase.complejoId ? {} : styles.inputDisabled)
              }}
            >
              <option value="">Seleccionar una cancha...</option>
              {canchas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div style={styles.grupoInputFull}>
            <label style={styles.label}>Profesor</label>
            <div style={styles.autocompleteWrapper}>
              <input
                name="profesorSearch"
                placeholder="Buscar profesor por nombre o teléfono"
                value={nuevaClase.profesorLabel || busquedaProfesor}
                onChange={manejarCambioInput}
                onFocus={() => setMostrarResultadosProfesor(true)}
                required
                style={styles.input}
              />

              {mostrarResultadosProfesor && profesores.length > 0 && (
                <div style={styles.listaSugerencias}>
                  {profesores.map((profesor, index) => (
                    <div
                      key={profesor.id}
                      style={{
                        ...styles.itemSugerencia,
                        ...(index === profesores.length - 1 ? styles.itemSugerenciaUltimo : {})
                      }}
                      onClick={() => handleProfesorSeleccionado(profesor)}
                    >
                      <strong>{profesor.nombre} {profesor.apellido}</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: '#8A8A8E', marginTop: '4px' }}>
                        <span>{profesor.telefono || profesor.email}</span>
                        {profesor.rol && <span style={{ textTransform: 'capitalize' }}>{profesor.rol.replace('_', ' ')}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Fecha</label>
            <div style={styles.inputButtonWrapper}>
              <button
                type="button"
                onClick={manejarCambioFecha}
                style={styles.inputButton}
              >
                <span>{fechaSeleccionadaTexto}</span>
                <span style={styles.inputButtonIcon}>📅</span>
              </button>

              {mostrarSelectorFecha && (
                <div style={styles.selectorPopover}>
                  <div style={styles.selectorHeader}>
                    <button
                      type="button"
                      onClick={() => setCalendarioBase(prev => {
                        const mesAnterior = prev.mes === 0 ? 11 : prev.mes - 1;
                        const anioAnterior = prev.mes === 0 ? prev.anio - 1 : prev.anio;
                        return { mes: mesAnterior, anio: anioAnterior };
                      })}
                      style={styles.selectorNavButton}
                    >
                      ‹
                    </button>
                    <span>{NOMBRE_MESES[calendarioBase.mes]} {calendarioBase.anio}</span>
                    <button
                      type="button"
                      onClick={() => setCalendarioBase(prev => {
                        const mesSiguiente = prev.mes === 11 ? 0 : prev.mes + 1;
                        const anioSiguiente = prev.mes === 11 ? prev.anio + 1 : prev.anio;
                        return { mes: mesSiguiente, anio: anioSiguiente };
                      })}
                      style={styles.selectorNavButton}
                    >
                      ›
                    </button>
                  </div>

                  <div style={styles.selectorGridHeader}>
                    {DIAS_SEMANA.map(dia => (
                      <div key={dia} style={styles.selectorDayLabel}>{dia}</div>
                    ))}
                  </div>

                  <div style={styles.selectorGrid}>
                    {diasDelMes.map((dia, index) => {
                      const esSeleccionado = nuevaClase.fecha && new Date(nuevaClase.fecha).getDate() === dia && new Date(nuevaClase.fecha).getMonth() === calendarioBase.mes && new Date(nuevaClase.fecha).getFullYear() === calendarioBase.anio;
                      return (
                        <button
                          key={`${index}-${dia}`}
                          type="button"
                          disabled={!dia}
                          onClick={() => dia && seleccionarFecha(dia)}
                          style={{
                            ...styles.selectorDay,
                            ...(dia ? {} : styles.selectorDayDisabled),
                            ...(esSeleccionado ? styles.selectorDaySelected : {})
                          }}
                        >
                          {dia || ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.label}>Hora</label>
            <div style={styles.inputButtonWrapper}>
              <button
                type="button"
                onClick={manejarCambioHora}
                style={styles.inputButton}
              >
                <span>{nuevaClase.hora || 'Seleccionar hora'}</span>
                <span style={styles.inputButtonIcon}>⏰</span>
              </button>

              {mostrarSelectorHora && (
                <div style={styles.selectorPopover}>
                  {horasSugeridas.map((hora) => (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => seleccionarHora(hora)}
                      style={{
                        ...styles.selectorOption,
                        ...(nuevaClase.hora === hora ? styles.selectorOptionSelected : {})
                      }}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              )}
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
            <select name="frecuencia" value={nuevaClase.frecuencia} onChange={manejarCambioInput} style={styles.input}>
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
              value={nuevaClase.precio}
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
              value={nuevaClase.precioCancha}
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
  inputButtonWrapper: {
    position: 'relative'
  },
  inputButton: {
    width: '100%',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141416',
    color: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
    outline: 'none',
    fontSize: '14px'
  },
  inputButtonIcon: {
    marginLeft: '10px',
    fontSize: '16px'
  },
  selectorPopover: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    zIndex: 3000,
    backgroundColor: '#121212',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '18px',
    padding: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
    marginTop: '8px'
  },
  selectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    color: '#FFFFFF',
    fontWeight: 600
  },
  selectorNavButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#FFFFFF',
    borderRadius: '10px',
    width: '34px',
    height: '34px',
    cursor: 'pointer',
    fontSize: '18px'
  },
  selectorGridHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px',
    marginBottom: '10px'
  },
  selectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px'
  },
  selectorDayLabel: {
    color: '#8A8A8E',
    fontSize: '12px',
    textAlign: 'center'
  },
  selectorDay: {
    width: '100%',
    minHeight: '38px',
    borderRadius: '12px',
    border: '1px solid transparent',
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '14px'
  },
  selectorDayDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: 'transparent',
    cursor: 'default'
  },
  selectorDaySelected: {
    backgroundColor: '#39FF14',
    color: '#000000',
    borderColor: '#39FF14'
  },
  selectorOption: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    marginBottom: '8px'
  },
  selectorOptionSelected: {
    backgroundColor: '#39FF14',
    color: '#000000',
    borderColor: '#39FF14'
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