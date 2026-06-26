// src/screens/ClasesScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ClasesScreen = () => {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext); 
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      alert(res.data.message || '¡Inscripción confirmada!');
      setInscripcionesTerceros(prev => ({ ...prev, [claseId]: '' }));
      cargarClases();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al procesar tu inscripción.');
    }
  };

  if (loading) return (
    <div style={styles.estadoVacio}>
      <div style={styles.spinner}></div>
      <p>Cargando academia de pádel...</p>
    </div>
  );

  return (
    <div style={styles.contenedor}>
      <div style={styles.headerSeccion}>
        <div>
          <h1 style={styles.tituloSeccion}>Clases de Pádel</h1>
          <p style={styles.descSeccion}>Anotate en clases particulares o grupales para subir tu nivel de juego.</p>
        </div>
        
        {/* Botón protegido por rol que navega a la nueva ruta */}
        {esProfesorOAdmin && (
          <button 
            onClick={() => navigate('/crear-clase')} 
            style={styles.botonCrear}
          >
            ＋ Crear Nueva Clase
          </button>
        )}
      </div>

      {error && <div style={styles.alertaError}>{error}</div>}

      {/* LISTADO DE CLASES */}
      {clases.length === 0 ? (
        <div style={styles.estadoVacioTarjeta}>
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>🎓</span>
          <p>No hay clases programadas en este momento.</p>
        </div>
      ) : (
        <div style={styles.grillaClases}>
          {clases.map((clase) => {
            const inscritosCount = clase.inscripciones?.length || 0;
            const cuposDisponibles = clase.cupoMax - inscritosCount;
            const claseLlena = cuposDisponibles <= 0;

            return (
              <div key={clase.id} style={styles.tarjetaClase}>
                
                {/* Badge de Precios */}
                <div style={styles.badgePrecio}>
                  <div style={{fontSize: '13px', fontWeight: '800'}}>
                    ${clase.precio} <span style={{fontSize: '10px', color: '#aaa', fontWeight: '400'}}>Prof.</span>
                  </div>
                  <div style={{fontSize: '11px', color: '#00ff66', fontWeight: '700', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2px', paddingTop: '2px'}}>
                    +${clase.precioCancha || 0} <span style={{fontSize: '9px', color: '#aaa', fontWeight: '400'}}>Cancha</span>
                  </div>
                </div>

                <div style={styles.cuerpoTarjeta}>
                  <h3 style={styles.claseName}>{clase.titulo}</h3>
                  
                  {/* Info del Profesor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 16px 0' }}>
                    {clase.fotoProfesor ? (
                      <img src={clase.fotoProfesor} alt="Profesor" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>👨‍🏫</div>
                    )}
                    <p style={{ color: '#8A8A8A', fontSize: '14px', margin: 0, fontWeight: '500' }}>
                      Prof. {clase.profesor?.nombre || clase.profesorId || 'Staff Técnico'}
                    </p>
                  </div>
                  
                  <div style={styles.divisor}></div>

                  {/* Detalles con SVGs */}
                  <div style={styles.contenedorDetalles}>
                    <div style={styles.filaDetalle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span style={styles.textoDetalle}>{clase.fecha}</span>
                    </div>
                    <div style={styles.filaDetalle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      <span style={styles.textoDetalle}>{clase.hora} hs</span>
                    </div>
                    <div style={styles.filaDetalle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1M4 4h16M5 21V10m14 11V10M9 21V14a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v7"></path></svg>
                      <span style={styles.textoDetalle}>Club: {clase.cancha?.complejo?.nombre || 'Club Asignado'}</span>
                    </div>
                    <div style={styles.filaDetalle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                      <span style={styles.textoDetalle}>Cancha: {clase.cancha?.nombre || 'Asignada'}</span>
                    </div>
                  </div>

                  {/* Input Terceros */}
                  {!claseLlena && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.05)' }}>
                      <label style={{ fontSize: '12px', color: '#8A8A8A', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                        ¿Inscribir a otra persona? (Hijo / Amigo)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Nombre completo del tercero"
                        value={inscripcionesTerceros[clase.id] || ''} 
                        onChange={(e) => setInscripcionesTerceros(prev => ({ ...prev, [clase.id]: e.target.value }))}
                        style={{
                          ...styles.inputForm,
                          padding: '8px 12px',
                          fontSize: '13px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Tarjeta */}
                <div style={styles.footerTarjeta}>
                  <div style={{
                    ...styles.badgeCupos,
                    backgroundColor: claseLlena ? 'rgba(255, 51, 51, 0.1)' : 'rgba(0, 255, 102, 0.08)',
                    color: claseLlena ? '#ff4d4d' : '#00ff66'
                  }}>
                    {claseLlena ? 'Cupos Agotados' : `${cuposDisponibles} de ${clase.cupoMax} lugares libres`}
                  </div>

                  <button 
                    disabled={claseLlena}
                    onClick={() => gestionarInscripcion(clase.id, inscripcionesTerceros[clase.id] || "")}
                    style={{
                      ...styles.botonInscribir,
                      backgroundColor: claseLlena ? '#1A1A1A' : '#00ff66',
                      color: claseLlena ? '#444' : '#000',
                      cursor: claseLlena ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {claseLlena ? 'Cerrado' : (inscripcionesTerceros[clase.id]?.trim() ? 'Inscribir Otro' : 'Inscribirme')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Estilos limpios (Se eliminaron los estilos exclusivos del formulario viejo)
const styles = {
  contenedor: { width: '100%', boxSizing: 'border-box', padding: '40px' },
  headerSeccion: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px',
    flexWrap: 'wrap', gap: '20px'
  },
  tituloSeccion: { fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  descSeccion: { color: '#8A8A8A', margin: 0, fontSize: '15px' },
  botonCrear: { 
    padding: '10px 20px', backgroundColor: 'rgba(0, 255, 102, 0.1)', color: '#00ff66', 
    border: '1px solid rgba(0, 255, 102, 0.2)', borderRadius: '10px', fontWeight: '700', 
    fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' 
  },
  alertaError: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '14px', borderRadius: '10px', marginBottom: '24px', fontWeight: '600' },
  inputForm: { backgroundColor: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', outline: 'none', transition: 'border-color 0.2s' },
  grillaClases: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  tarjetaClase: { backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s' },
  badgePrecio: { position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '12px', textAlign: 'right' },
  cuerpoTarjeta: { padding: '24px 24px 16px 24px', flex: 1 },
  claseName: { fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0', letterSpacing: '-0.3px', paddingRight: '100px' },
  divisor: { height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '16px' },
  contenedorDetalles: { display: 'flex', flexDirection: 'column', gap: '10px' },
  filaDetalle: { display: 'flex', alignItems: 'center', gap: '10px' },
  textoDetalle: { color: '#EAEAEA', fontSize: '14px', fontWeight: '500' },
  footerTarjeta: { padding: '16px 24px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.02)' },
  badgeCupos: { fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '20px' },
  botonInscribir: { border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', transition: 'all 0.2s' },
  estadoVacioTarjeta: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8A8A8A', backgroundColor: '#121212', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' },
  estadoVacio: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8A8A8A' },
  spinner: { width: '30px', height: '30px', border: '3px solid rgba(0,255,102,0.2)', borderTop: '3px solid #00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }
};

export default ClasesScreen;