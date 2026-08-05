import { theme } from '../theme';

export const styles = {
  container: {
    paddingBottom: theme.spacing.bottomNavPadding,
    backgroundColor: theme.colors.background,
    color: '#FFF',
    paddingBottom: '120px', 
  },
  header: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  btnVolver: {
    background: 'none',
    border: 'none',
    color: '#8E8E93',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#FFF',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  formContainer: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  tipoTorneoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  tipoTorneoCard: {
    padding: '14px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },
  tipoTorneoCardActive: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderColor: theme.colors.primary
  },
  tipoTorneoCardAmericanoActive: {
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    borderColor: '#FFB300'
  },
  tipoTorneoTitulo: {
    color: '#FFF',
    fontSize: '14px',
    fontWeight: '700'
  },
  tipoTorneoSub: {
    color: '#8E8E93',
    fontSize: '11px',
    fontWeight: '500',
    marginTop: '2px'
  },
  row: {
    display: 'flex',
    gap: '16px',
    width: '100%'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#EAEAEA',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#FFF',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  selectInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(57, 255, 20, 0.3)',
    color: theme.colors.primary,
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  optionStyle: {
    backgroundColor: '#1C1C1E',
    color: '#FFF'
  },
  scrollChips: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollbarWidth: 'none', 
    WebkitOverflowScrolling: 'touch'
  },
  chipInactivo: {
    flex: '0 0 auto',
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    color: '#A0A0A5',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  chipActivo: {
    flex: '0 0 auto',
    padding: '12px 24px',
    backgroundColor: 'rgba(57, 255, 20, 0.12)', 
    border: '1px solid #39FF14',
    borderRadius: '16px',
    color: theme.colors.primary,
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(57, 255, 20, 0.2)'
  },
  chipCupoActivo: {
    flex: '0 0 auto',
    padding: '12px 24px',
    backgroundColor: 'rgba(0, 229, 255, 0.12)', 
    border: '1px solid #00E5FF',
    borderRadius: '16px',
    color: theme.colors.secondaryGlow,
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 229, 255, 0.2)'
  },
  uploadContainer: {
    width: '100%'
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '130px',
    border: '1px dashed rgba(57, 255, 20, 0.3)',
    borderRadius: '16px',
    backgroundColor: 'rgba(57, 255, 20, 0.01)',
    cursor: 'pointer'
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover'
  },
  removeImageButton: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    padding: '8px 14px',
    backgroundColor: 'rgba(0,0,0,0.85)',
    border: 'none',
    borderRadius: '8px',
    color: '#ff4d4d',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  btnSubmit: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    backgroundColor: theme.colors.primary,
    border: 'none',
    color: '#000',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0px 8px 24px rgba(57, 255, 20, 0.3)',
    transition: 'all 0.1s ease'
  },
  btnSubmitDisabled: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    backgroundColor: '#1C1C1E',
    border: 'none',
    color: '#555',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'not-allowed',
    marginTop: '10px',
  },
  toast: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    borderRadius: '16px',
    border: '1px solid',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    width: '90%',
    maxWidth: '400px',
    transition: 'all 0.3s ease'
  },
  toastDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  toastText: {
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.3px',
    lineHeight: '1.4'
  }
}
