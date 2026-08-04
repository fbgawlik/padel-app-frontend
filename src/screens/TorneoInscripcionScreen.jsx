import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

// Bloques de restricción estándar para torneos de pádel en Resistencia (Viernes a Domingo)
const BLOQUES_HORARIOS = [
  { id: 'VIE_18_20', label: 'Viernes: 18:00 a 20:00' },
  { id: 'VIE_20_22', label: 'Viernes: 20:00 a 22:00' },
  { id: 'VIE_22_00', label: 'Viernes: 22:00 a 00:00' },
  { id: 'SAB_08_12', label: 'Sábado: Mañana (08:00 a 12:00)' },
  { id: 'SAB_12_16', label: 'Sábado: Siesta (12:00 a 16:00)' },
  { id: 'SAB_16_20', label: 'Sábado: Tarde (16:00 a 20:00)' },
  { id: 'SAB_20_00', label: 'Sábado: Noche (20:00 a 00:00)' },
  { id: 'DOM_08_12', label: 'Domingo: Mañana (08:00 a 12:00)' },
];

const TorneoInscripcionScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mostrarNotificacion } = useNotification();

  // 1. Obtener perfil del usuario logueado (Jugador 1)
  const { data: usuarioLogueado } = useQuery({
    queryKey: ['perfilUsuario'],
    queryFn: async () => {
      const res = await API.get('/usuarios/perfil');
      return res.data;
    }
  });

  // 2. Obtener detalles del torneo
  const { data: torneo, isLoading: cargandoTorneo } = useQuery({
    queryKey: ['torneo', id],
    queryFn: async () => {
      const res = await API.get(`/torneos/${id}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });

  // --- Estados del Formulario ---
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [telefono1, setTelefono1] = useState('');
  const [busquedaCompanero, setBusquedaCompanero] = useState('');
  const [companeroSeleccionado, setCompaneroSeleccionado] = useState(null);
  const [telefono2, setTelefono2] = useState('');
  const [restriccionHoraria, setRestriccionHoraria] = useState('');
  const [bloquesSeleccionados, setBloquesSeleccionados] = useState([]);
  const [aceptoReglas, setAceptoReglas] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // Autocompletar datos del usuario logueado al cargar
  useEffect(() => {
    if (usuarioLogueado) {
      setTelefono1(usuarioLogueado.telefono || '');
    }
  }, [usuarioLogueado]);

  // Autocompletar categoría si el torneo solo tiene una
  useEffect(() => {
    if (torneo?.categoria) {
      const categorias = torneo.categoria.split(/[|/]+/).map(c => c.trim());
      if (categorias.length === 1) {
        setCategoriaSeleccionada(categorias[0]);
      }
    }
  }, [torneo]);

  // 3. Query dinámico para buscar compañero en tiempo real (mínimo 3 letras)
  const { data: resultadosBusqueda, isLoading: buscando } = useQuery({
    queryKey: ['buscarCompanero', busquedaCompanero],
    queryFn: async () => {
      if (busquedaCompanero.trim().length < 3) return [];
      try {
        const res = await API.get(`/torneos/buscar-companero?busqueda=${encodeURIComponent(busquedaCompanero)}`);
        return Array.isArray(res.data) ? res.data : [res.data];
      } catch (error) {
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: busquedaCompanero.trim().length >= 3,
  });

  // 4. Mutación para inscribir a la pareja
  const inscripcionMutation = useMutation({
    mutationFn: async (datosInscripcion) => {
      const res = await API.post(`/torneos/${id}/inscripciones`, datosInscripcion);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['torneo', id]);
      mostrarNotificacion('¡Inscripción registrada con éxito! 🎾 Tu pareja ha sido anotada.', 'success');
      navigate(`/torneos/${id}`);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.mensaje || 'Error al procesar la inscripción.';
      setMensajeError(errorMsg);
    }
  });

  // Manejo de selección de bloques horarios
  const toggleBloque = (bloqueId) => {
    if (bloquesSeleccionados.includes(bloqueId)) {
      setBloquesSeleccionados(bloquesSeleccionados.filter(id => id !== bloqueId));
    } else {
      setBloquesSeleccionados([...bloquesSeleccionados, bloqueId]);
    }
  };

  const handleInscribirse = (e) => {
    e.preventDefault();
    setMensajeError('');

    if (!categoriaSeleccionada) {
      setMensajeError('Debes seleccionar una categoría.');
      return;
    }
    if (!telefono1.trim()) {
      setMensajeError('Tu número de teléfono es obligatorio.');
      return;
    }
    if (!companeroSeleccionado) {
      setMensajeError('Debes buscar y seleccionar un compañero.');
      return;
    }
    if (!telefono2.trim()) {
      setMensajeError('El número de teléfono de tu compañero es obligatorio.');
      return;
    }
    if (!aceptoReglas) {
      setMensajeError('Debes aceptar el reglamento del torneo para proceder.');
      return;
    }

    // Adaptamos los datos para que coincidan con la estructura Prisma de tu backend
    const payload = {
      categoria: categoriaSeleccionada,
      jugador1: `${usuarioLogueado?.nombre} ${usuarioLogueado?.apellido}`,
      telefono1: telefono1.trim(),
      jugador2: `${companeroSeleccionado.nombre} ${companeroSeleccionado.apellido}`,
      telefono2: telefono2.trim(),
      jugador2Id: companeroSeleccionado.id, // Para el enlace de relaciones
      restriccionHoraria: restriccionHoraria.trim() || null,
      bloquesRestringidos: JSON.stringify(bloquesSeleccionados) // Serializado como pide tu schema.prisma
    };

    inscripcionMutation.mutate(payload);
  };

  // Separar categorías del string separado por "/" o "|"
  const categoriasDisponibles = torneo?.categoria 
    ? torneo.categoria.split(/[|/]+/).map(c => c.trim()) 
    : [];

  if (cargandoTorneo) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (!torneo) {
    return (
      <div style={styles.centerContainer}>
        <p style={{ color: '#ff4d4d' }}>Torneo no encontrado.</p>
        <button onClick={() => navigate(-1)} style={styles.btnVolver}>Volver</button>
      </div>
    );
  }

  return (
    <div style={styles.screenContainer}>
      
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={styles.logoText}>INSCRIPCIÓN AL TORNEO</span>
      </div>

      {/* CONTENIDO */}
      <div style={styles.mainContent}>
        
        {/* INFO CARD DEL TORNEO */}
        <div style={styles.torneoCard}>
          <h2 style={styles.torneoTitulo}>{torneo.nombre}</h2>
          <p style={styles.torneoDetalle}>Costo de Inscripción (por pareja): <strong style={{color: '#39FF14'}}>${torneo.precioInscripcion || '0'}</strong></p>
        </div>

        <form onSubmit={handleInscribirse} style={styles.form}>
          
          {/* SELECCIÓN DE CATEGORÍA */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Categoría de Inscripción</label>
            <select 
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">-- Selecciona una categoría --</option>
              {categoriasDisponibles.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <h3 style={styles.sectionDivider}>DATOS DE LA PAREJA</h3>

          {/* JUGADOR 1 (Usuario logueado) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Jugador 1 (Tú)</label>
            <input 
              type="text" 
              value={usuarioLogueado ? `${usuarioLogueado.nombre} ${usuarioLogueado.apellido}` : 'Cargando...'} 
              style={{ ...styles.input, opacity: 0.7 }} 
              disabled 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tu Teléfono (Obligatorio)</label>
            <input 
              type="tel" 
              placeholder="Ej: 3624123456" 
              value={telefono1}
              onChange={(e) => setTelefono1(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {/* JUGADOR 2 (Buscador dinámico) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Buscar Jugador 2 (Compañero)</label>
            
            {companeroSeleccionado ? (
              <div style={styles.companeroSeleccionadoCard}>
                <div style={styles.companeroInfo}>
                  <div style={styles.avatar}>🎾</div>
                  <div>
                    <div style={styles.companeroNombre}>{companeroSeleccionado.nombre} {companeroSeleccionado.apellido}</div>
                    <div style={styles.companeroSub}>{companeroSeleccionado.email}</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setCompaneroSeleccionado(null);
                    setTelefono2('');
                  }} 
                  style={styles.btnQuitar}
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Escribe el nombre de tu compañero..." 
                  value={busquedaCompanero}
                  onChange={(e) => setBusquedaCompanero(e.target.value)}
                  style={styles.input}
                />
                
                {buscando && <div style={styles.miniSpinner}></div>}

                {/* Dropdown de resultados de búsqueda */}
                {resultadosBusqueda && resultadosBusqueda.length > 0 && (
                  <div style={styles.dropdown}>
                    {resultadosBusqueda.map((usuario) => (
                      <div 
                        key={usuario.id} 
                        onClick={() => {
                          setCompaneroSeleccionado(usuario);
                          setTelefono2(usuario.telefono || '');
                          setBusquedaCompanero('');
                        }}
                        style={styles.dropdownItem}
                      >
                        👤 <div style={{ marginLeft: '8px' }}>
                          <div style={{ fontWeight: '600' }}>{usuario.nombre} {usuario.apellido}</div>
                          <div style={{ fontSize: '11px', color: '#8E8E93' }}>{usuario.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {busquedaCompanero.trim().length >= 3 && resultadosBusqueda?.length === 0 && !buscando && (
                  <div style={styles.noResults}>No se encontraron jugadores registrados.</div>
                )}
              </div>
            )}
          </div>

          {/* TELÉFONO JUGADOR 2 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Teléfono de tu Compañero (Obligatorio)</label>
            <input 
              type="tel" 
              placeholder="Ej: 3624987654" 
              value={telefono2}
              onChange={(e) => setTelefono2(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <h3 style={styles.sectionDivider}>RESTRICCIÓN DE HORARIOS</h3>
          <p style={styles.sectionSubtext}>Selecciona los bloques en los que <strong>NO</strong> pueden disputar partidos bajo ninguna circunstancia debido a complicaciones laborales o personales.</p>

          {/* GRILLA DE BLOQUES HORARIOS */}
          <div style={styles.bloquesGrid}>
            {BLOQUES_HORARIOS.map((bloque) => {
              const seleccionado = bloquesSeleccionados.includes(bloque.id);
              return (
                <button
                  type="button"
                  key={bloque.id}
                  onClick={() => toggleBloque(bloque.id)}
                  style={{
                    ...styles.bloqueCard,
                    ...(seleccionado ? styles.bloqueCardSeleccionado : {})
                  }}
                >
                  <span style={styles.bloqueCheck}>{seleccionado ? '❌ Restringido' : '✅ Disponible'}</span>
                  <span style={styles.bloqueLabel}>{bloque.label}</span>
                </button>
              );
            })}
          </div>

          {/* NOTA ADICIONAL */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nota o Comentario sobre horarios (Opcional)</label>
            <textarea 
              rows="3" 
              placeholder="Ej: El viernes podemos jugar únicamente después de las 20:30 hs por trabajo de mi compañero."
              value={restriccionHoraria}
              onChange={(e) => setRestriccionHoraria(e.target.value)}
              style={styles.textarea}
            />
          </div>

          {/* ACEPTACIÓN DE REGLAS */}
          <div style={styles.rulesContainer}>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={aceptoReglas}
                onChange={(e) => setAceptoReglas(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.rulesText}>
                Acepto el reglamento oficial de <strong style={{color: '#39FF14'}}>ADN PÁDEL</strong> y me comprometo a cumplir con el fair-play y los horarios asignados del torneo.
              </span>
            </label>
          </div>

          {/* MENSAJES DE ERROR */}
          {mensajeError && (
            <div style={styles.errorContainer}>
              ⚠️ {mensajeError}
            </div>
          )}

          {/* BOTÓN DE CONFIRMACIÓN */}
          <button 
            type="submit" 
            disabled={inscripcionMutation.isPending}
            style={{
              ...styles.btnSubmit,
              opacity: !aceptoReglas || inscripcionMutation.isPending ? 0.5 : 1,
              cursor: !aceptoReglas || inscripcionMutation.isPending ? 'not-allowed' : 'pointer'
            }}
          >
            {inscripcionMutation.isPending ? 'Registrando Pareja...' : 'Confirmar e Inscribirse'}
          </button>
        </form>

      </div>
    </div>
  );
};

// --- ARQUITECTURA DE ESTILOS PREMIUM (ADN PÁDEL STYLE) ---
const styles = {
  screenContainer: {
    backgroundColor: '#0A0A0B',
    width: '100%',
    color: '#FFFFFF',
    boxSizing: 'border-box',
  },
  topBar: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '16px 20px', 
    gap: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  backButton: {
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    cursor: 'pointer', 
    padding: '8px', 
    display: 'flex', 
    borderRadius: '12px'
  },
  logoText: { color: '#FFF', fontWeight: '800', fontSize: '15px', letterSpacing: '1px' },
  mainContent: { padding: '24px 20px 100px 20px', maxWidth: '480px', margin: '0 auto' },
  torneoCard: {
    backgroundColor: 'rgba(22, 22, 24, 0.7)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '24px',
  },
  torneoTitulo: { margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#FFF', textTransform: 'uppercase' },
  torneoDetalle: { margin: 0, color: '#8E8E93', fontSize: '13px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#FFF',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  select: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#FFF',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  textarea: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#FFF',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'none'
  },
  sectionDivider: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#39FF14',
    letterSpacing: '1px',
    margin: '12px 0 4px 0',
    borderBottom: '1px dashed rgba(57, 255, 20, 0.2)',
    paddingBottom: '8px'
  },
  sectionSubtext: { fontSize: '12px', color: '#8E8E93', margin: '0 0 10px 0', lineHeight: '1.4' },
  companeroSeleccionadoCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 20, 0.04)',
    border: '1px solid #39FF14',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  companeroInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { fontSize: '20px' },
  companeroNombre: { fontSize: '13px', fontWeight: '700' },
  companeroSub: { fontSize: '11px', color: '#8E8E93' },
  btnQuitar: {
    backgroundColor: 'rgba(255, 77, 77, 0.15)',
    color: '#ff4d4d',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '700'
  },
  dropdown: {
    position: 'absolute',
    top: '52px',
    left: 0,
    right: 0,
    backgroundColor: '#161618',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    maxHeight: '180px',
    overflowY: 'auto',
    zIndex: 10,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
  },
  noResults: { fontSize: '11px', color: '#ff4d4d', marginTop: '4px' },
  miniSpinner: {
    position: 'absolute',
    right: '16px',
    top: '14px',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(57, 255, 20, 0.1)',
    borderTopColor: '#39FF14',
    borderRadius: '50%',
  },
  bloquesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '10px',
    marginBottom: '10px'
  },
  bloqueCard: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#FFF',
    transition: 'all 0.2s'
  },
  bloqueCardSeleccionado: {
    borderColor: '#ff4d4d',
    backgroundColor: 'rgba(255, 77, 77, 0.05)'
  },
  bloqueCheck: {
    fontSize: '10px',
    fontWeight: '700',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  bloqueLabel: { fontSize: '11px', color: '#8E8E93', lineHeight: '1.3' },
  rulesContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '14px',
    padding: '14px',
    marginTop: '10px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer'
  },
  checkbox: {
    marginTop: '3px',
    cursor: 'pointer',
    accentColor: '#39FF14'
  },
  rulesText: {
    fontSize: '12px',
    color: '#D1D1D6',
    lineHeight: '1.5'
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    color: '#ff4d4d',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },
  btnSubmit: {
    height: '52px',
    backgroundColor: '#39FF14',
    color: '#0A0A0B',
    border: 'none',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: '900',
    boxShadow: '0 8px 20px rgba(57, 255, 20, 0.2)',
    marginTop: '15px'
  },
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0B' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(57, 255, 20, 0.1)', borderTopColor: '#39FF14', borderRadius: '50%' },
};

export default TorneoInscripcionScreen;