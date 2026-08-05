import { theme } from '../theme';

export const styles = {
  contenedor: { 
    paddingBottom: theme.spacing.bottomNavPadding,
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
    color: theme.colors.text,
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
    color: theme.colors.text, 
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
    color: theme.colors.text,
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
  autocompleteWrapper: {
    position: 'relative',
    width: '100%'
  },
  listaSugerencias: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    backgroundColor: '#121212',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
    zIndex: 2500,
    padding: '8px 0',
    maxHeight: '260px',
    overflowY: 'auto'
  },
  itemSugerencia: {
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'transparent',
    color: theme.colors.text,
    transition: 'background-color 0.2s ease'
  },
  itemSugerenciaUltimo: {
    marginBottom: 0
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
    color: theme.colors.text,
    fontWeight: 600
  },
  selectorNavButton: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: theme.colors.text,
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primary,
    color: '#000000',
    borderColor: theme.colors.primary
  },
  selectorOption: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#1A1A1A',
    color: theme.colors.text,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    marginBottom: '8px'
  },
  selectorOptionSelected: {
    backgroundColor: theme.colors.primary,
    color: '#000000',
    borderColor: theme.colors.primary
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
    backgroundColor: theme.colors.primary, 
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
}
