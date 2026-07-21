// src/screens/ClasesScreen.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ClasesScreen = () => {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext); 
  const { mostrarNotificacion } = useNotification();
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [inscripcionesTerceros, setInscripcionesTerceros] = useState({});

  // Verificamos permisos para mostrar el botón de crear (Asegurando que solo profesores/admins lo vean)
  const esProfesorOAdmin = usuario?.rol === 'profesor' || usuario?.rol === 'admin_complejo';
  const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://padel-api-backend-production.up.railway.app').replace(/\/$/, '');

  const resolverUrlImagen = (ruta) => {
    if (!ruta) return null;
    const valor = String(ruta).trim();
    if (valor.startsWith('http://') || valor.startsWith('https://')) return valor;
    if (valor.includes('localhost:5000')) {
      return valor.replace('http://localhost:5000', BACKEND_URL);
    }
    if (valor.startsWith('/')) return `${BACKEND_URL}${valor}`;
    return `${BACKEND_URL}/${valor}`;
  };

  const cargarClases = async () => {
    try {
      setLoading(true);
      const res = await API.get('/clases');
      setClases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('No se pudieron cargar las clases disponibles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClases();
  }, []);

  const gestionarInscripcion = async (claseId, nombreAlumno = "") => {
    try {
      const res = await API.post(`/clases/${claseId}/inscripciones`, { nombreAlumno });
      mostrarNotificacion(res.data.message || '¡Inscripción confirmada!', 'success');
      setInscripcionesTerceros(prev => ({ ...prev, [claseId]: '' }));
      cargarClases();
    } catch (err) {
      mostrarNotificacion(err.response?.data?.error || 'Error al procesar tu inscripción.', 'error');
    }
  };

  const getSkillTagColor = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case 'avanzado': return { bg: 'rgba(0, 206, 209, 0.1)', color: '#00CED1' }; 
      case 'iniciación': case 'principiante': return { bg: 'rgba(50, 205, 50, 0.1)', color: '#32CD32' }; 
      case 'intermedio': return { bg: 'rgba(255, 215, 0, 0.1)', color: '#FFD700' }; 
      default: return { bg: 'rgba(255,255,255,0.05)', color: '#fff' };
    }
  };

  const filteredClases = useMemo(() => {
    const textoBusqueda = search.trim().toLowerCase();
    return clases.filter((clase) => {
      const texto = `${clase.titulo} ${clase.profesor?.nombre || ''} ${clase.profesor?.apellido || ''}`.toLowerCase();
      return texto.includes(textoBusqueda);
    });
  }, [clases, search]);

  const clasesAgrupadas = useMemo(() => {
    const grupos = new Map();

    filteredClases.forEach((clase) => {
      const key = [
        clase.titulo,
        clase.hora,
        clase.profesorId || clase.profesor?.id || '',
        clase.canchaId || clase.cancha?.id || '',
        clase.precio,
        clase.precioCancha || 0,
      ].join('|');

      const fecha = clase.fecha || '';
      const profesor = clase.profesor || {};
      const existing = grupos.get(key);

      if (!existing) {
        grupos.set(key, {
          ...clase,
          fechas: fecha ? [fecha] : [],
          claseIds: [clase.id],
          tipo: 'Única',
        });
      } else {
        existing.fechas = Array.from(new Set([...existing.fechas, fecha])).sort();
        existing.claseIds.push(clase.id);
        existing.tipo = 'Mensual';
      }
    });

    return Array.from(grupos.values()).map((clase) => ({
      ...clase,
      fechas: clase.fechas.sort(),
      cantidadFechas: clase.fechas.length,
    }));
  }, [filteredClases]);

  if (loading) return (
    <div style={styles.estadoVacio}>
      <div style={styles.spinner}></div>
      <p>Cargando academia de pádel...</p>
    </div>
  );

  return (
    <div style={styles.contenedor}>
      {/* ─── HEADER SECTION (IGUAL A LA IMAGEN) ─── */}
      <div style={styles.headerSeccion}>
        <h1 style={styles.tituloPrincipal}>Tus Clases de Pádel</h1>
        <div style={styles.searchBarWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Buscar clases, instructores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {esProfesorOAdmin && (
        <button 
          onClick={() => navigate('/crear-clase')} 
          style={styles.fabCrearClase}
        >
          <span style={styles.fabIcon}>＋</span>
          Crear Clase
        </button>
      )}

      {error && <div style={styles.alertaError}>{error}</div>}

      {/* LISTADO DE CLASES */}
      {clasesAgrupadas.length === 0 ? (
        <div style={styles.estadoVacioTarjeta}>
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>🎓</span>
          <p>No hay clases que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div style={styles.grillaClases}>
          {clasesAgrupadas.map((clase) => {
            const inscritosCount = clase.inscripciones?.length || 0;
            const cuposDisponibles = clase.cupoMax - inscritosCount;
            const claseLlena = cuposDisponibles <= 0;
            const imagenDocente = resolverUrlImagen(clase.profesor?.imagenPerfil || clase.fotoProfesor || '');
            const profesorNombre = clase.profesor?.nombre ? `${clase.profesor.nombre} ${clase.profesor.apellido}` : (clase.profesorId || 'Staff Técnico');
            const skillTagProps = getSkillTagColor(clase.nivelSkill);
            const totalPrecio = clase.precio + (clase.precioCancha || 0);
            const claseIdForInscripcion = clase.claseIds?.[0] || clase.id;
            const fechaTexto = clase.fechas?.length > 1 ? `${clase.fechas[0]} +${clase.fechas.length - 1}` : clase.fechas?.[0] || clase.fecha;

            return (
              <div key={clase.id} style={styles.tarjetaClase}>
                
                {/* ─── LAYOUT DE TARJETA A 3 COLUMNAS (IGUAL A LA IMAGEN) ─── */}
                <div style={styles.cuerpoTarjetaRediseñado}>
                  
                  {/* Columna 1: Avatar */}
                  <div style={styles.tarjetaColumnaAvatar}>
                    {imagenDocente ? (
                      <img src={imagenDocente} alt="Profesor" style={styles.profesorAvatar} />
                    ) : (
                      <div style={styles.profesorAvatarPlaceholder}>👨‍🏫</div>
                    )}
                  </div>

                  {/* Columna 2: Detalles de la Clase */}
                  <div style={styles.tarjetaColumnaDetalles}>
                    <div style={styles.headerMiniRow}>
                      <h3 style={styles.claseName}>{clase.titulo}</h3>
                      <span style={styles.tipoBadge}>{clase.tipo || 'Única'}</span>
                    </div>
                    <p style={styles.claseDateTime}>{fechaTexto}, {clase.hora} hs</p>
                    <p style={styles.profesorLabel}>Prof. {profesorNombre}</p>
                    
                    {/* Etiqueta de Nivel */}
                    {clase.nivelSkill && (
                      <div style={{ ...styles.skillTag, ...skillTagProps }}>
                        {clase.nivelSkill}
                      </div>
                    )}
                    
                    {/* Input Terceros */}
                    {!claseLlena && (
                      <div style={styles.inputTercerosWrapper}>
                        <label style={styles.inputLabelTerceros}>
                          ¿Inscribir a otra persona?
                        </label>
                        <input 
                          type="text" 
                          placeholder="Nombre completo..."
                          value={inscripcionesTerceros[claseIdForInscripcion] || ''} 
                          onChange={(e) => setInscripcionesTerceros(prev => ({ ...prev, [claseIdForInscripcion]: e.target.value }))}
                          style={styles.inputFormTerceros}
                        />
                      </div>
                    )}
                  </div>

                  {/* Columna 3: Precio y Acción */}
                  <div style={styles.tarjetaColumnaAccion}>
                    <div style={styles.precioGrande}>${totalPrecio}</div>
                    
                    {claseLlena ? (
                      <div style={styles.statusClosed}>Cupos Agotados</div>
                    ) : (
                      <>
                        <div style={styles.plazasText}>Plazas: {inscritosCount}/{clase.cupoMax}</div>
                        <button 
                          disabled={claseLlena}
                          onClick={() => gestionarInscripcion(claseIdForInscripcion, inscripcionesTerceros[claseIdForInscripcion] || "")}
                          style={{
                            ...styles.botonInscribirDestacado,
                            backgroundColor: claseLlena ? '#1A1A1A' : '#00ff66',
                            color: claseLlena ? '#444' : '#000',
                          }}
                        >
                          {claseLlena ? 'Cerrado' : (inscripcionesTerceros[claseIdForInscripcion]?.trim() ? 'Inscribir Otro' : 'Inscribirse')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ESTILOS REDISEÑADOS PARA MATCHEAR LA IMAGEN
const styles = {
  contenedor: { width: '100%', boxSizing: 'border-box', padding: '40px 24px 140px 24px' },
  headerSeccion: { 
    borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px',
    display: 'flex', flexDirection: 'column', gap: '20px'
  },
  tituloPrincipal: { fontSize: '36px', margin: '0 0 8px 0', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  searchBarWrapper: { position: 'relative', width: '100%' },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' },
  searchInput: { 
    width: '100%', boxSizing: 'border-box',
    backgroundColor: '#1A1A1A', color: '#fff', 
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', 
    padding: '14px 14px 14px 48px', outline: 'none', transition: 'border-color 0.2s',
    fontSize: '15px'
  },
  alertaError: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '14px', borderRadius: '10px', marginBottom: '24px', fontWeight: '600' },
  estadoVacioTarjeta: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8A8A8A', backgroundColor: '#121212', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' },
  estadoVacio: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8A8A8A' },
  spinner: { width: '30px', height: '30px', border: '3px solid rgba(0,255,102,0.2)', borderTop: '3px solid #00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  grillaClases: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  tarjetaClase: { 
    backgroundColor: '#121212', borderRadius: '18px', 
    border: '1px solid rgba(255,255,255,0.08)', position: 'relative', 
    display: 'flex', flexDirection: 'column', overflow: 'hidden', 
    transition: 'transform 0.18s, border-color 0.18s',
    cursor: 'default',
    padding: '12px'
  },
  cuerpoTarjetaRediseñado: {
    flex: 1, display: 'flex', gap: '10px', 
    alignItems: 'flex-start'
  },
  headerMiniRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' },
  tipoBadge: { fontSize: '10px', fontWeight: '800', color: '#39FF14', textTransform: 'uppercase', letterSpacing: '0.6px', backgroundColor: 'rgba(57,255,20,0.1)', padding: '4px 8px', borderRadius: '999px' },
  claseName: { fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.3px' },
  claseDateTime: { color: '#EAEAEA', fontSize: '12px', fontWeight: '500', margin: '3px 0' },
  profesorLabel: { color: '#8A8A8A', margin: 0, fontSize: '12px', fontWeight: '600' },
  precioGrande: { fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px', textAlign: 'right' },
  tarjetaColumnaDetalles: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  tarjetaColumnaAccion: { width: '88px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', justifyContent: 'flex-start' },
  tarjetaColumnaAvatar: { width: '50px', height: '50px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' },
  profesorAvatar: { width: '100%', height: '100%', objectFit: 'cover' },
  profesorAvatarPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#191919', color: '#39FF14', fontSize: '24px' },
  skillTag: { display: 'inline-block', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '14px', margin: '6px 0 0 0', alignSelf: 'start' },
  inputTercerosWrapper: { marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.05)' },
  inputLabelTerceros: { fontSize: '12px', color: '#8A8A8A', display: 'block', marginBottom: '6px', fontWeight: '600' },
  inputFormTerceros: { backgroundColor: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', outline: 'none', padding: '8px 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' },
  tarjetaColumnaAccion: { width: '110px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'end', justifyContent: 'start' },
  precioGrande: { fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px', textAlign: 'right' },
  plazasText: { fontSize: '12px', color: '#8A8A8A', fontWeight: '600', textAlign: 'right' },
  botonInscribirDestacado: { 
    border: 'none', padding: '10px 18px', borderRadius: '10px', 
    fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box',
    textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  statusClosed: { fontSize: '12px', fontWeight: '700', padding: '8px 16px', borderRadius: '20px', backgroundColor: 'rgba(255, 51, 51, 0.1)', color: '#ff4d4d', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  fabCrearClase: {
    position: 'fixed', bottom: '24px', right: '24px',
    padding: '16px 20px', borderRadius: '999px',
    backgroundColor: '#39FF14', color: '#0F0F10', border: 'none',
    fontWeight: '800', fontSize: '14px', cursor: 'pointer',
    boxShadow: '0 16px 40px rgba(57, 255, 20, 0.18)',
    display: 'flex', alignItems: 'center', gap: '10px', zIndex: 100
  },
  fabIcon: { fontSize: '18px', lineHeight: 1 }
};

export default ClasesScreen;