// src/screens/CrearClaseScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { styles } from './CrearClaseScreen.styles';

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
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
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
        const res = await API.get(`/clases/buscar-profesor?busqueda=${encodeURIComponent(busquedaProfesor)}`);
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
                  <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '6px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                    borderColor: nuevaClase.hora === h ? '#39FF14' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: nuevaClase.hora === h ? '0 8px 18px rgba(57, 255, 20, 0.2)' : 'none',
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

export default CrearClaseScreen;