import { theme } from '../theme';

export const styles = {
  screenContainer: {
    backgroundColor: theme.colors.background,
    width: '100%',
    color: theme.colors.text,
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
  mainContent: { padding: '24px 20px 48px 20px', maxWidth: '480px', margin: '0 auto' },
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
    color: theme.colors.primary,
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
    borderTopColor: theme.colors.primary,
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
    accentColor: theme.colors.primary
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
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    border: 'none',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: '900',
    boxShadow: '0 8px 20px rgba(57, 255, 20, 0.2)',
    marginTop: '15px'
  },
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(57, 255, 20, 0.1)', borderTopColor: theme.colors.primary, borderRadius: '50%' },
}