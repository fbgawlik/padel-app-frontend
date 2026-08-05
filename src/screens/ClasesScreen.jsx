// src/screens/ClasesScreen.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './ClasesScreen.styles';

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
;

export default ClasesScreen;