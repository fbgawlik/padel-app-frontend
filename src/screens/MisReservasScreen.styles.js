import { theme } from '../theme';

export const styles = {
  pantallaContainer: {
    paddingBottom: theme.spacing.bottomNavPadding,
    padding: '16px 20px',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  headerSeccion: {
    marginBottom: '28px'
  },
  tituloPrincipal: {
    fontSize: '34px',
    fontWeight: '800',
    color: theme.colors.text,
    margin: '0 0 6px 0',
    letterSpacing: '-0.8px'
  },
  subtituloPrincipal: {
    fontSize: '15px',
    color: '#8E8E93',
    margin: 0,
    letterSpacing: '-0.2px',
    lineHeight: '1.4'
  },
  tabsContenedor: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#121214',
    padding: '6px',
    borderRadius: '24px',
    marginBottom: '32px',
    overflowX: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  tabBoton: {
    background: 'none',
    border: 'none',
    color: '#8E8E93',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '18px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    flex: 1,
    textAlign: 'center'
  },
  tabBotonActivo: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: theme.colors.text,
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  grillaTarjetas: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  tarjeta: {
    backgroundColor: '#121214',
    borderRadius: '28px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
  },
  cuerpoTarjeta: {
    padding: '24px 22px'
  },
  badgeEstado: {
    position: 'absolute',
    top: '22px',
    right: '22px',
    backgroundColor: 'rgba(57, 255, 20, 0.08)',
    color: theme.colors.primary,
    border: '1px solid rgba(57, 255, 20, 0.15)',
    padding: '6px 12px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.4px'
  },
  badgeTorneo: {
    position: 'absolute',
    top: '22px',
    right: '22px',
    backgroundColor: 'rgba(255, 159, 10, 0.08)',
    color: '#FF9F0A',
    border: '1px solid rgba(255, 159, 10, 0.15)',
    padding: '6px 12px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.4px'
  },
  tituloTarjeta: {
    fontSize: '19px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0 0 6px 0',
    paddingRight: '110px',
    letterSpacing: '-0.3px'
  },
  subtituloTarjeta: {
    fontSize: '14px',
    color: '#8E8E93',
    margin: '0 0 4px 0',
    letterSpacing: '-0.1px'
  },
  direccionTarjeta: {
    fontSize: '12px',
    color: '#8E8E93',
    margin: 0,
    letterSpacing: '-0.1px'
  },
  divisor: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: '18px 0'
  },
  filaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  datoTexto: {
    fontSize: '13px',
    color: '#8E8E93'
  },
  resaltado: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  cajaExtras: {
    marginTop: '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '14px 16px'
  },
  tituloExtras: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  itemExtra: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    marginBottom: '6px',
    color: theme.colors.text
  },
  nombreExtra: {
    flex: 1,
    color: '#8E8E93'
  },
  badgeTipoExtra: {
    fontSize: '10px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#8E8E93',
    padding: '3px 8px',
    borderRadius: '6px',
    marginRight: '12px',
    fontWeight: '600'
  },
  precioExtra: {
    fontWeight: '700',
    color: theme.colors.text
  },
  contenedorProgreso: {
    marginTop: '20px'
  },
  filaProgresoTexto: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#8E8E93',
    marginBottom: '8px'
  },
  resaltadoProgreso: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  barraProgresoFondo: {
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '99px',
    overflow: 'hidden'
  },
  barraProgresoRelleno: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: '99px',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 12px rgba(57, 255, 20, 0.4)'
  },
  categoriaTexto: {
    fontSize: '14px', 
    color: '#FF9F0A', 
    fontWeight: '600',
    margin: '4px 0 0 0'
  },
  cronogramaFila: {
    marginTop: '10px', 
    fontSize: '12px', 
    color: '#8E8E93'
  },
  contenedorMensaje: {
    height: '75vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textoSincronizando: { 
    color: '#8E8E93', 
    marginTop: '16px',
    fontSize: '15px'
  },
  textoError: { 
    color: '#FF453A', 
    fontWeight: '600',
    fontSize: '15px'
  },
  botonReintentar: {
    marginTop: '20px',
    backgroundColor: '#121214',
    color: theme.colors.text,
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '12px 24px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px'
  },
  estadoVacio: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#121214',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
    borderRadius: '24px'
  },
  textoVacio: {
    color: '#8E8E93',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.4'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(57, 255, 20, 0.1)',
    borderTop: '3px solid #39FF14',
    borderRadius: '50%'
  }
}
