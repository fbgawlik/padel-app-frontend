// src/screens/GestionTorneoScreen.styles.js
import { theme } from '../theme';

export const styles = {
  screenContainer: {
    backgroundColor: theme.colors.background, 
    width: '100%', 
    color: '#FFF', 
    boxSizing: 'border-box',
    paddingBottom: '32px'
  },
  header: { display: 'flex', padding: '20px', gap: '16px', alignItems: 'flex-start', background: 'linear-gradient(180deg, rgba(30,50,40,0.4) 0%, rgba(10,10,11,1) 100%)' },
  backButton: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', outline: 'none' },
  headerInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  logoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  logoText: { color: '#FFF', fontWeight: '800', fontSize: '14px', letterSpacing: '1px' },
  btnPublicar: { backgroundColor: 'transparent', border: '1px solid #BEF264', color: theme.colors.primary, padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: '0.5px' },
  tituloSecundario: { fontSize: '20px', color: '#FFF', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  tituloPrincipal: { fontSize: '26px', color: '#FFF', fontWeight: '900', margin: '4px 0 12px 0', letterSpacing: '-0.5px' },
  organizadorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  organizadorText: { color: '#8E8E93', fontSize: '12px', fontWeight: '600' },
  
  tabsContainer: { display: 'flex', justifyContent: 'space-around', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tabButton: { background: 'transparent', border: 'none', padding: '14px 0', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px' },
  
  mainContent: { padding: '20px' },
  seccionContenido: { display: 'flex', flexDirection: 'column', gap: '16px' },
  
  searchRow: { display: 'flex', gap: '12px', alignItems: 'center' },
  searchContainer: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#161618', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, backgroundColor: 'transparent', border: 'none', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none' },
  counterBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  counterNumber: { fontSize: '14px', fontWeight: '600', color: '#FFF' },
  counterSub: { fontSize: '12px', color: '#8E8E93' },
  
  filtersRow: { display: 'flex', gap: '12px', alignItems: 'center' },
  selectInput: { flex: 1, backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.08)', color: theme.colors.text, padding: '12px', borderRadius: '14px', fontSize: '13px', outline: 'none' },
  
  btnGenerarZonas: { 
    backgroundColor: theme.colors.primary, 
    color: theme.colors.background, 
    border: 'none', 
    padding: '12px 18px', 
    borderRadius: '14px', 
    fontWeight: '800', 
    fontSize: '13px',
    boxShadow: '0 4px 14px rgba(190, 242, 100, 0.25)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },

  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  textoListaVacia: { textAlign: 'center', color: '#8E8E93', padding: '24px 0', fontSize: '13px' },
  
  cardInscripto: { 
    display: 'flex', 
    alignItems: 'center', 
    backgroundColor: 'rgba(22, 22, 24, 0.7)', 
    borderRadius: '20px', 
    padding: '16px', 
    border: '1px solid', 
    gap: '12px',
    transition: 'all 0.2s ease'
  },
  avatarDoble: { display: 'flex', position: 'relative' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2C2C2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '2px solid #161618' },
  infoInscripto: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  nombreInscripto: { margin: 0, fontSize: '14px', fontWeight: '800', color: '#FFF' },
  catInscripto: { fontSize: '12px', color: '#8E8E93' },
  badgePago: { fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px', letterSpacing: '0.5px' },

  actionIcons: { display: 'flex', gap: '8px', alignItems: 'center' },
  iconActionBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, background-color 0.2s ease',
    outline: 'none'
  },

  zoneCard: { backgroundColor: '#141416', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255,255,255,0.07)' },
  zoneHeader: { fontSize: '14px', fontWeight: '800', color: theme.colors.primary, marginBottom: '12px' },
  partidoCard: { backgroundColor: '#1D1D20', borderRadius: '14px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' },
  partidoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '12px', color: '#8E8E93' },
  partidoEquipos: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '12px', color: theme.colors.text, flexWrap: 'wrap' },
  partidoResultado: { fontSize: '13px', color: '#8E8E93', padding: '10px 14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'center' },
  inputResultado: { flex: 1, backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', color: '#FFF', fontSize: '13px', outline: 'none', minWidth: '220px' },

  diasRow: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' },
  diaBtn: { flex: 1, minWidth: '90px', padding: '12px', borderRadius: '16px', border: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' },
  tituloFecha: { fontSize: '18px', fontWeight: '700', margin: '10px 0', color: '#FFF' },
  
  cardResultado: { backgroundColor: 'rgba(22, 22, 24, 0.7)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  resultadoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  textoPista: { color: '#8E8E93', fontSize: '13px', fontWeight: '600' },
  badgeEstado: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' },
  
  enfrentamientoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  parejasCol: { display: 'flex', flexDirection: 'column', gap: '6px' },
  parejaItem: { display: 'flex', flexDirection: 'column' },
  parejaLetra: { fontSize: '14px', fontWeight: '800', color: '#FFF' },
  parejaNombres: { fontSize: '12px', color: '#8E8E93', marginTop: '2px' },
  vsSmall: { fontSize: '10px', color: theme.colors.primary, fontWeight: '800', paddingLeft: '8px' },
  
  setsCol: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' },
  setFila: { display: 'flex', gap: '6px' },
  setCaja: { color: theme.colors.primary, fontSize: '16px', fontWeight: '800', letterSpacing: '2px' },
  
  resultadoFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  textoLiveScore: { fontSize: '13px', color: '#8E8E93' },
  btnPrimario: { backgroundColor: theme.colors.primary, color: theme.colors.background, padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' },

  llavesContainer: { minHeight: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px' },
  mensajePlaceholder: { textAlign: 'center' },

  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(190, 242, 100, 0.1)', borderTopColor: theme.colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' },

  /* ─── ESTILOS PARA EL MODAL DE RESTRICCIONES ─── */
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    backdropFilter: 'blur(8px)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  modalCard: {
    backgroundColor: '#161618',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '12px'
  },
  modalTitle: { margin: 0, fontSize: '16px', fontWeight: '800', color: '#FFF' },
  modalCloseBtn: { background: 'none', border: 'none', color: '#8E8E93', fontSize: '18px', cursor: 'pointer' },
  modalBody: { display: 'flex', flexDirection: 'column', gap: '14px' },
  modalSection: { display: 'flex', flexDirection: 'column', gap: '2px' },
  modalLabel: { fontSize: '12px', color: '#8E8E93', fontWeight: '600' },
  modalValue: { fontSize: '14px', color: '#FFF', fontWeight: '700', margin: 0 },
  modalValueHighlight: {
    fontSize: '13px',
    color: '#FF9F0A',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    padding: '10px 14px',
    borderRadius: '12px',
    marginTop: '4px',
    border: '1px solid rgba(255, 159, 10, 0.2)'
  },
  btnWhatsappModal: {
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    border: '1px solid rgba(37, 211, 102, 0.3)',
    color: '#25D366',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'left',
    cursor: 'pointer'
  },
  btnCerrarModal: {
    backgroundColor: '#BEF264',
    color: '#0A0A0B',
    border: 'none',
    padding: '14px',
    borderRadius: '16px',
    fontWeight: '800',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px'
  }
};