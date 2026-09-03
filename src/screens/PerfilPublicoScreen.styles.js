import { theme } from '../theme';

export const styles = {
  contenedorBase: {
    width: '100%',
    color: theme.colors.text,
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    paddingBottom: '32px'
  },
  tarjetaContenido: {
    width: '100%',
    maxWidth: '440px',
    padding: '16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  headerNavegacion: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: '16px',
    padding: '4px 0'
  },
  btnVolverBack: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  tituloHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: theme.colors.text
  },
  bloqueMultimedia: {
    width: '100%',
    height: '150px',
    backgroundColor: '#1F1F23',
    position: 'relative',
    borderRadius: '20px',
    overflow: 'visible', // Permite que el avatar sobresalga de la base
    marginBottom: '50px'
  },
  imagenPortadaImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '20px'
  },
  bannerVacio: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1f1f23 0%, #2c2c35 100%)',
    borderRadius: '20px'
  },
  avatarSeccion: {
    position: 'absolute',
    bottom: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '2'
  },
  avatarContenedor: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: '#1C1C1E',
    border: '4px solid #0C0C0E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.6)'
  },
  avatarImagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarLetra: {
    fontSize: '32px',
    color: '#8E8E93',
    fontWeight: '700'
  },
  nombreJugador: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '800',
    color: theme.colors.text, 
    margin: '12px 0 20px 0',
    letterSpacing: '0.2px',
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' // Envuelve el texto en una sutil sombra negra
  },
  filaBadges: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '24px'
  },
  badgeCard: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '12px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  badgeIcono: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    marginBottom: '6px'
  },
  badgeTitulo: {
    fontSize: '11px',
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: '4px'
  },
  badgeValor: {
    fontSize: '13px',
    color: theme.colors.text,
    fontWeight: '800'
  },
  badgeValorFiltrado: {
    fontSize: '11px',
    color: theme.colors.text,
    fontWeight: '800',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%'
  },
  subtituloSeccion: {
    fontSize: '15px',
    fontWeight: '700',
    color: theme.colors.text, // 🔥 Cambiamos de gris a BLANCO para que se lea perfecto
    margin: '0 0 10px 0'
  },
  bloqueInfoDetalle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cajaTextoBio: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '14px',
    boxSizing: 'border-box'
  },
  textoBio: {
    fontSize: '13px',
    color: '#E5E5EA',
    lineHeight: '1.5',
    margin: 0
  },
  cajaTextoLado: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },
  iconoRaqueta: {
    fontSize: '20px'
  },
  labelLadoTitle: {
    fontSize: '11px',
    color: '#8E8E93',
    fontWeight: '500'
  },
  valorLadoText: {
    fontSize: '14px',
    fontWeight: '700',
    color: theme.colors.text
  },
  cajaRecord: {
    backgroundColor: '#141416',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  valorRecordText: {
    fontSize: '13px',
    fontWeight: '700',
    color: theme.colors.text
  },
  contenedorLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTop: '3px solid #BEF264',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  alertaError: {
    backgroundColor: 'rgba(255,69,58,0.1)',
    color: '#FF453A',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid #FF453A',
    textAlign: 'center',
    fontSize: '14px'
  },
  botonVolverFlotante: {
    backgroundColor: '#1A1A1E',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '8px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '16px'
  }
}