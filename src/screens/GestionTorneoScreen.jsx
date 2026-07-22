// src/screens/GestionTorneoScreen.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';

const GestionTorneoScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Pestañas: 'inscriptos', 'llaves', 'resultados'
  const [pestanaActiva, setPestanaActiva] = useState('resultados');
  const [busqueda, setBusqueda] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState('7ago');

  // Fetch básico del torneo (usa el endpoint de torneos que incluye las inscripciones)
  const { data: torneo, isLoading, isError, error } = useQuery({
    queryKey: ['torneoGestion', id],
    queryFn: async () => {
      const res = await API.get(`/torneos/${id}`);
      return res.data || { nombre: 'Edición Origen', inscripciones: [] };
    }
  });

  // --- RESULTADOS (mock por ahora; inscriptos vendrán desde la API) ---
  const resultadosMock = [
    { id: 1, hora: '10:30 AM', pista: 'Pista Central', estado: 'EN VIVO', pareja1: 'G. Garcia / M. Rossi', pareja2: 'J. Perez / F. Diaz', cat: '3ra.', sets1: [6, 6, 3], sets2: [2, 4, 1] },
    { id: 2, hora: '09:00 AM', pista: 'Pista 2', estado: 'FINALIZADO', pareja1: 'A. Fernandez / E. Sanchez', pareja2: 'P. Martinez / K. Silva', cat: '4ta.', sets1: [6, 6], sets2: [1, 2], ganador: 1 },
  ];
  // -----------------------------------------------------------------

  if (isLoading) return <div style={styles.centerContainer}><div style={styles.spinner}></div></div>;
  if (isError) return <div style={styles.centerContainer}><div style={{color:'#fff'}}>Error cargando torneo: {error?.message || 'Error desconocido'}</div></div>;

  return (
    <div style={styles.screenContainer}>
      
      {/* ─── ENCABEZADO Y TÍTULOS ─── */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div style={styles.headerInfo}>
          <div style={styles.logoRow}>
            <span style={styles.logoText}>ADN PADEL</span>
            {pestanaActiva === 'resultados' && (
               <button style={styles.btnPublicar}>PUBLICAR RESULTADOS</button>
            )}
          </div>
          <h1 style={styles.tituloSecundario}>GESTIÓN DE TORNEO:</h1>
          <h2 style={styles.tituloPrincipal}>{torneo?.nombre?.toUpperCase()}</h2>
          <div style={styles.organizadorRow}>
            <span style={styles.iconoAvatar}>👤</span>
            <span style={styles.organizadorText}>PEPE (ORGANIZADOR)</span>
          </div>
        </div>
      </div>

      {/* ─── PESTAÑAS ─── */}
      <div style={styles.tabsContainer}>
        {[
          { id: 'inscriptos', label: 'INSCRIPTOS' },
          { id: 'llaves', label: 'LLAVES' },
          { id: 'resultados', label: 'RESULTADOS' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id)}
            style={{
              ...styles.tabButton,
              color: pestanaActiva === tab.id ? '#39FF14' : '#8E8E93',
              borderBottom: pestanaActiva === tab.id ? '3px solid #39FF14' : '3px solid transparent'
            }}
          >
            {pestanaActiva === tab.id ? `[ ${tab.label} ]` : tab.label}
          </button>
        ))}
      </div>

      {/* ─── CONTENIDO DINÁMICO ─── */}
      <div style={styles.mainContent}>

        {/* VISTA 1: INSCRIPTOS */}
        {pestanaActiva === 'inscriptos' && (
          <div style={styles.seccionContenido}>
            <div style={styles.searchRow}>
              <div style={styles.searchContainer}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" style={{marginLeft: '12px'}}>
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar inscriptos..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <div style={styles.counterBox}>
                <span style={styles.counterNumber}>{(torneo?.inscripciones?.length || 0) * 2} Inscriptos</span>
                <span style={styles.counterSub}>({torneo?.inscripciones?.length || 0} Parejas)</span>
              </div>
            </div>

            <div style={styles.filtersRow}>
              <select style={styles.selectInput}><option>Categoría: Todas</option></select>
              <select style={styles.selectInput}><option>Género: Todos</option></select>
            </div>

            <div style={styles.listContainer}>
              {(torneo?.inscripciones || []).map(insc => (
                <div key={insc.id} style={{...styles.cardInscripto, borderColor: '#39FF14'}}>
                  <div style={styles.avatarDoble}>
                    <div style={{...styles.avatar, zIndex: 2}}>👤</div>
                    <div style={{...styles.avatar, zIndex: 1, marginLeft: '-10px'}}>👤</div>
                  </div>
                  <div style={styles.infoInscripto}>
                    <h4 style={styles.nombreInscripto}>{`${insc.jugador1} / ${insc.jugador2}`}</h4>
                    <span style={styles.catInscripto}>Categoría: {insc.categoria}</span>
                    <span style={{...styles.estadoInscripto, color: '#39FF14'}}>
                      Confirmado
                    </span>
                  </div>
                  <div style={styles.actionIcons}>
                    <button style={styles.iconBtn}>💬</button>
                    <button style={styles.iconBtn}>👁️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 2: LLAVES */}
        {pestanaActiva === 'llaves' && (
          <div style={styles.seccionContenido}>
            <div style={styles.filtersRow}>
               <select style={styles.selectInput}><option>Categoría: 3ra Masc.</option></select>
               <select style={styles.selectInput}><option>Género: Todos</option></select>
            </div>
            {/* Visualizador de llaves simplificado */}
            <div style={styles.llavesContainer}>
               <div style={styles.mensajePlaceholder}>
                 <span style={{fontSize: '32px'}}>🏆</span>
                 <p>Cuadro de eliminación directa en desarrollo.</p>
                 <button style={styles.btnGenerarCuadro}>
                   ✨ GENERAR O ACTUALIZAR CUADROS
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* VISTA 3: RESULTADOS */}
        {pestanaActiva === 'resultados' && (
          <div style={styles.seccionContenido}>
            {/* Selector de días */}
            <div style={styles.diasRow}>
              {[
                { id: '7ago', text1: 'VIE', text2: '7 AGO' },
                { id: '8ago', text1: 'SAB', text2: '8 AGO' },
                { id: '9ago', text1: 'DOM', text2: '9 AGO' }
              ].map(dia => (
                <button 
                  key={dia.id} onClick={() => setDiaSeleccionado(dia.id)}
                  style={{
                    ...styles.diaBtn,
                    backgroundColor: diaSeleccionado === dia.id ? 'rgba(57, 255, 20, 0.1)' : 'rgba(22, 22, 24, 0.8)',
                    borderColor: diaSeleccionado === dia.id ? '#39FF14' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <span style={{color: diaSeleccionado === dia.id ? '#39FF14' : '#8E8E93', fontWeight: '700', fontSize: '13px'}}>{dia.text1}</span>
                  <span style={{color: '#FFF', fontWeight: '800', fontSize: '16px'}}>{dia.text2}</span>
                </button>
              ))}
            </div>

            <h3 style={styles.tituloFecha}>Resultados del viernes, 7 de agosto</h3>

            <div style={styles.listContainer}>
              {resultadosMock.map(partido => (
                <div key={partido.id} style={styles.cardResultado}>
                  <div style={styles.resultadoHeader}>
                     <span style={styles.textoPista}>{partido.pista} - {partido.hora}</span>
                     <span style={{...styles.badgeEstado, color: partido.estado === 'EN VIVO' ? '#FF3B30' : '#E5C200'}}>
                       {partido.estado === 'EN VIVO' && <span style={styles.puntoRojo}></span>}
                       {partido.estado === 'FINALIZADO' ? 'FINALIZADO 🏆' : partido.estado}
                     </span>
                  </div>

                  <div style={styles.enfrentamientoRow}>
                    <div style={styles.parejasCol}>
                      <div style={styles.parejaItem}>
                        <span style={styles.parejaLetra}>Pareja A</span>
                        <span style={styles.parejaNombres}>{partido.pareja1}</span>
                      </div>
                      <div style={styles.vsSmall}>vs</div>
                      <div style={styles.parejaItem}>
                        <span style={styles.parejaLetra}>Pareja B</span>
                        <span style={styles.parejaNombres}>{partido.pareja2}</span>
                      </div>
                    </div>
                    
                    <div style={styles.setsCol}>
                      <div style={styles.setFila}>
                        {partido.sets1.map((s, i) => <span key={i} style={styles.setCaja}>[{s}]</span>)}
                      </div>
                      <div style={styles.setFila}>
                        {partido.sets2.map((s, i) => <span key={i} style={styles.setCaja}>[{s}]</span>)}
                      </div>
                    </div>
                  </div>

                  <div style={styles.resultadoFooter}>
                    <span style={styles.textoLiveScore}>Categoría: {partido.cat}</span>
                    <button style={partido.estado === 'FINALIZADO' ? styles.btnSecundario : styles.btnPrimario}>
                      {partido.estado === 'FINALIZADO' ? 'VER DETALLES' : '✎ EDITAR PUNTUACIÓN'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTÓN FLOTANTE ESTILO WHATSAPP (Solo activo en Inscriptos o Resultados según necesites) */}
      <button style={styles.fabButton}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      
    </div>
  );
};

// --- ESTILOS VISUALES PREMIUM ---
const styles = {
  screenContainer: {
    backgroundColor: '#0A0A0B', minHeight: '100vh', width: '100%', 
    color: '#FFF', paddingBottom: '120px', boxSizing: 'border-box'
  },
  header: { display: 'flex', padding: '20px', gap: '16px', alignItems: 'flex-start', background: 'linear-gradient(180deg, rgba(30,50,40,0.4) 0%, rgba(10,10,11,1) 100%)' },
  backButton: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', outline: 'none' },
  headerInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  logoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  logoText: { color: '#FFF', fontWeight: '800', fontSize: '14px', letterSpacing: '1px' },
  btnPublicar: { backgroundColor: 'transparent', border: '1px solid #39FF14', color: '#39FF14', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800' },
  tituloSecundario: { fontSize: '20px', color: '#FFF', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  tituloPrincipal: { fontSize: '26px', color: '#FFF', fontWeight: '900', margin: '4px 0 12px 0', letterSpacing: '-0.5px' },
  organizadorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  iconoAvatar: { fontSize: '16px' },
  organizadorText: { color: '#8E8E93', fontSize: '12px', fontWeight: '600' },
  
  tabsContainer: { display: 'flex', justifyContent: 'space-around', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tabButton: { background: 'transparent', border: 'none', padding: '14px 0', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px' },
  
  mainContent: { padding: '20px' },
  seccionContenido: { display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' },
  
  searchRow: { display: 'flex', gap: '12px', alignItems: 'center' },
  searchContainer: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#161618', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, backgroundColor: 'transparent', border: 'none', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none' },
  counterBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  counterNumber: { fontSize: '14px', fontWeight: '600', color: '#FFF' },
  counterSub: { fontSize: '12px', color: '#8E8E93' },
  
  filtersRow: { display: 'flex', gap: '12px' },
  selectInput: { flex: 1, backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8E93', padding: '12px', borderRadius: '14px', fontSize: '13px', outline: 'none' },
  
  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  
  cardInscripto: { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(22, 22, 24, 0.7)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', gap: '12px' },
  avatarDoble: { display: 'flex', position: 'relative' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '2px solid #161618' },
  infoInscripto: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  nombreInscripto: { margin: 0, fontSize: '14px', fontWeight: '800', color: '#FFF' },
  catInscripto: { fontSize: '12px', color: '#8E8E93' },
  estadoInscripto: { fontSize: '11px', fontWeight: '700' },
  actionIcons: { display: 'flex', gap: '8px' },
  iconBtn: { background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', outline: 'none' },
  
  diasRow: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' },
  diaBtn: { flex: 1, minWidth: '90px', padding: '12px', borderRadius: '16px', border: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' },
  tituloFecha: { fontSize: '18px', fontWeight: '700', margin: '10px 0', color: '#FFF' },
  
  cardResultado: { backgroundColor: 'rgba(22, 22, 24, 0.7)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  resultadoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  textoPista: { color: '#8E8E93', fontSize: '13px', fontWeight: '600' },
  badgeEstado: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' },
  puntoRojo: { width: '8px', height: '8px', backgroundColor: '#FF3B30', borderRadius: '50%', boxShadow: '0 0 6px #FF3B30' },
  
  enfrentamientoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  parejasCol: { display: 'flex', flexDirection: 'column', gap: '6px' },
  parejaItem: { display: 'flex', flexDirection: 'column' },
  parejaLetra: { fontSize: '14px', fontWeight: '800', color: '#FFF' },
  parejaNombres: { fontSize: '12px', color: '#8E8E93', marginTop: '2px' },
  vsSmall: { fontSize: '10px', color: '#39FF14', fontWeight: '800', paddingLeft: '8px' },
  
  setsCol: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' },
  setFila: { display: 'flex', gap: '6px' },
  setCaja: { color: '#39FF14', fontSize: '16px', fontWeight: '800', letterSpacing: '2px' },
  
  resultadoFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  textoLiveScore: { fontSize: '13px', color: '#8E8E93' },
  btnPrimario: { backgroundColor: '#39FF14', color: '#0A0A0B', padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' },
  btnSecundario: { backgroundColor: 'transparent', color: '#39FF14', border: '1px solid #39FF14', padding: '8px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' },

  llavesContainer: { minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px' },
  mensajePlaceholder: { textAlign: 'center', color: '#8E8E93' },
  btnGenerarCuadro: { marginTop: '16px', backgroundColor: '#39FF14', color: '#0A0A0B', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(57, 255, 20, 0.3)' },

  fabButton: { position: 'fixed', bottom: '104px', right: '24px', width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#39FF14', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 4px 16px rgba(57, 255, 20, 0.4)', cursor: 'pointer', zIndex: 99 },
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(57, 255, 20, 0.1)', borderTopColor: '#39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default GestionTorneoScreen;