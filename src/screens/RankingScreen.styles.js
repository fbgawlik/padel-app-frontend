import { theme } from '../theme';

export const styles = {
  contenedor: {
    paddingBottom: theme.spacing.bottomNavPadding,
    width: '100%',
    color: theme.colors.text,
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.colors.background
  },
  tarjetaContenido: {
    width: '100%',
    maxWidth: '440px',
    padding: '20px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  tituloHeader: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    margin: '10px 0 20px 0',
    color: theme.colors.text
  },
  contenedorRamas: {
    display: 'flex',
    backgroundColor: '#141416',
    borderRadius: '14px',
    padding: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '16px'
  },
  btnRamaActivo: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    color: '#000000',
    border: 'none',
    borderRadius: '10px',
    height: '40px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnRamaInactivo: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#A0A0A5',
    border: 'none',
    borderRadius: '10px',
    height: '40px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  sliderCategorias: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '12px',
    marginBottom: '14px',
    scrollbarWidth: 'none', 
    WebkitOverflowScrolling: 'touch',
  },
  chipCategoriaActivo: {
    backgroundColor: 'rgba(57, 255, 20, 0.15)',
    color: theme.colors.primary,
    border: '1px solid #39FF14',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '800',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  chipCategoriaInactivo: {
    backgroundColor: '#1A1A1E',
    color: '#A0A0A5',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  listaClasificacion: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '6px'
  },
  filaJugador: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    gap: '12px',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  colPosicion: {
    width: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textoPosicion: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#A0A0A5'
  },
  badgeMedalla: (pos) => ({
    backgroundColor: pos === 1 ? '#D4AF37' : pos === 2 ? '#AAA9AD' : '#CD7F32',
    color: '#000000',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '900',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
  }),
  colFoto: {
    width: '42px',
    height: '42px'
  },
  avatarContenedor: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#1A1A1E',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  inicialAvatar: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#A0A0A5'
  },
  colInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  nombreJugador: {
    fontSize: '15px',
    fontWeight: '700',
    color: theme.colors.text
  },
  subtextoCategoria: {
    fontSize: '12px',
    color: '#A0A0A5',
    fontWeight: '500'
  },
  colPuntos: {
    textAlign: 'right'
  },
  textoPuntos: {
    fontSize: '15px',
    fontWeight: '800',
    color: theme.colors.primary
  },
  contenedorCarga: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 0'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255, 255, 255, 0.08)',
    borderTop: '3px solid #39FF14',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  mensajeEstado: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#A0A0A5',
    fontSize: '14px',
    lineHeight: '20px'
  }
}
