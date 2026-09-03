import { theme } from '../theme';

export const styles = {
  contenedor: { 
    padding: '16px 20px 32px 20px', 
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  headerNavegacion: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center'
  },
  botonVolver: { 
    backgroundColor: '#121214', 
    color: theme.colors.text, 
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    cursor: 'pointer', 
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  headerClub: { 
    marginBottom: '32px' 
  },
  tituloClub: { 
    fontSize: '30px', 
    margin: '0 0 6px 0', 
    fontWeight: '800', 
    color: theme.colors.text, 
    letterSpacing: '-0.8px' 
  },
  infoClub: { 
    color: '#8E8E93', 
    fontSize: '14px', 
    margin: 0,
    letterSpacing: '-0.2px'
  },
  seccionContenedor: { 
    marginBottom: '28px' 
  },
  encabezadoPaso: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px'
  },
  numeroBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#8E8E93',
    fontSize: '11px',
    fontWeight: '700',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtituloSeccion: { 
    fontSize: '16px', 
    color: theme.colors.text, 
    margin: 0, 
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  ayudaTexto: { 
    color: '#8E8E93', 
    fontSize: '13px', 
    margin: '-4px 0 16px 0',
    lineHeight: '1.4'
  },
  scrollHorizontal: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    paddingBottom: '8px',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  pildoraCancha: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 20px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  iconoPildora: {
    fontSize: '15px'
  },
  textoPildora: {
    fontWeight: '600',
    letterSpacing: '-0.2px'
  },
  tarjetaFecha: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60px',
    height: '80px',
    borderRadius: '22px',
    cursor: 'pointer',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  nombreDiaTexto: { 
    fontSize: '10px', 
    fontWeight: '700', 
    letterSpacing: '0.6px' 
  },
  numeroDiaTexto: { 
    fontSize: '20px', 
    fontWeight: '800',
    letterSpacing: '-0.5px' 
  },
  grillaHorarios: {
    display: 'flex',
    overflowX: 'auto',
    gap: '10px',
    paddingBottom: '8px',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  botonSlot: {
    minWidth: '90px',
    padding: '14px 12px',
    borderRadius: '18px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  slotDisponible: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255,255,255,0.06)',
    color: theme.colors.text
  },
  slotSeleccionado: {
    backgroundColor: 'rgba(190, 242, 100, 0.08)',
    borderColor: theme.colors.primary,
    color: theme.colors.primary,
    boxShadow: '0 8px 20px rgba(190, 242, 100, 0.12)'
  },
  slotOcupado: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.04)',
    color: '#3A3A3C',
    cursor: 'not-allowed'
  },
  slotPasado: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderColor: 'rgba(255,255,255,0.02)',
    color: '#57575A',
    cursor: 'not-allowed',
    opacity: 0.75
  },
  slotHoraTexto: { 
    fontSize: '15px', 
    fontWeight: '700',
    letterSpacing: '-0.2px'
  },
  textoOcupadoLabel: { 
    fontSize: '9px', 
    fontWeight: '700', 
    color: '#FF453A',
    textTransform: 'uppercase',
    letterSpacing: '0.2px'
  },
  tarjetaPartidoAbierto: { 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121214', 
    borderRadius: '24px', 
    padding: '18px 22px', 
    border: '1px solid rgba(255,255,255,0.04)',
    marginBottom: '24px',
    gap: '16px'
  },
  textoPartidoAbierto: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '4px', 
    flex: 1 
  },
  tituloPartidoAbierto: { 
    color: theme.colors.text, 
    fontSize: '15px', 
    fontWeight: '700',
    letterSpacing: '-0.2px'
  },
  descPartidoAbierto: { 
    color: '#8E8E93', 
    fontSize: '12px', 
    lineHeight: '1.4' 
  },
  switchContenedor: {
    display: 'flex',
    alignItems: 'center'
  },
  checkboxPremium: { 
    width: '22px', 
    height: '22px', 
    accentColor: theme.colors.primary, 
    cursor: 'pointer' 
  },
  bloqueBotonPrincipal: { 
    margin: '24px 0 40px 0' 
  },
  botonReservar: { 
    width: '100%', 
    padding: '18px', 
    border: 'none', 
    borderRadius: '24px', 
    fontWeight: '850', 
    fontSize: '15px', 
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px'
  },
  seccionTiendaWrapper: { 
    borderTop: '1px solid rgba(255,255,255,0.06)', 
    paddingTop: '28px',
    paddingBottom: '20px'
  },
  iconoTiendaSeccion: {
    fontSize: '16px'
  },
  ayudaTextoTienda: {
    color: '#8E8E93', 
    fontSize: '13px', 
    margin: '-4px 0 20px 0'
  },
  grillaTienda: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  tarjetaProducto: { 
    backgroundColor: '#121214', 
    borderRadius: '22px', 
    border: '1px solid rgba(255,255,255,0.04)', 
    padding: '14px 16px' 
  },
  infoProductoHorizontal: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px' 
  },
  iconoTienda: { 
    width: '46px', 
    height: '46px', 
    borderRadius: '14px', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '22px' 
  },
  cuerpoProducto: { 
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-start'
  },
  nombreProducto: { 
    color: theme.colors.text, 
    fontSize: '15px', 
    fontWeight: '700', 
    margin: 0,
    letterSpacing: '-0.2px'
  },
  badgeTipo: { 
    fontSize: '10px', 
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  accionesProducto: { 
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px'
  },
  precioProducto: { 
    color: theme.colors.text, 
    fontSize: '16px', 
    fontWeight: '800', 
    margin: 0,
    letterSpacing: '-0.3px'
  },
  botonAccionTienda: { 
    border: 'none', 
    padding: '8px 14px', 
    borderRadius: '12px', 
    fontWeight: '700', 
    fontSize: '12px', 
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  textoVacio: { 
    color: '#8E8E93', 
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px 0'
  },
  textoCargando: {
    color: '#8E8E93', 
    fontSize: '15px',
    marginTop: '12px'
  },
  textoError: {
    color: '#FF453A',
    fontSize: '15px',
    fontWeight: '600'
  },
  estadoVacioSpinner: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '120px 24px' 
  },
  estadoVacio: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '120px 24px' 
  },
  spinner: { 
    width: '32px', 
    height: '32px', 
    border: '3px solid rgba(190, 242, 100, 0.1)', 
    borderTop: '3px solid #BEF264', 
    borderRadius: '50%'
  }
}