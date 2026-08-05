import { theme } from '../theme';

export const styles = {
  contenedorPadre: { 
    paddingBottom: theme.spacing.bottomNavPadding,
    padding: '24px 16px', 
    backgroundColor: 'transparent', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
  },
  headerPremium: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px' 
  },
  subtituloPremium: { 
    fontSize: '13px', 
    color: '#8E8E93', 
    margin: '0 0 4px 0',
    fontWeight: '500'
  },
  tituloBienvenida: { 
    fontSize: '24px', 
    fontWeight: '800', 
    color: theme.colors.text, 
    margin: 0,
    letterSpacing: '-0.5px'
  },
  avatarMiniatura: {
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    backgroundColor: '#1A1A1A',
    border: '1px solid rgba(57, 255, 20, 0.3)',
    color: theme.colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    overflow: 'hidden'
  },
  botonAdmin: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    color: theme.colors.primary,
    border: '1px solid rgba(57, 255, 20, 0.2)',
    padding: '8px 12px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer'
  },
  scrollHorizontalContenedor: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    paddingBottom: '12px',
    marginBottom: '24px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none', 
  },
  pildoraCategoria: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    color: '#fff',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  seccionContenedor: { marginBottom: '32px' },
  seccionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px' 
  },
  seccionTitulo: { 
    fontSize: '18px', 
    fontWeight: '700', 
    color: '#fff', 
    margin: 0 
  },
  verTodosText: {
    color: theme.colors.primary,
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tarjetaHorizontal: {
    minWidth: '260px',
    maxWidth: '260px',
    backgroundColor: '#161618',
    borderRadius: '24px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.03)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  },
  tarjetaHorizontalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badgeClub: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#EAEAEA',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  iconoLlamativo: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  imagenCreadorPartido: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  botonAccionPrimario: {
    width: '100%',
    padding: '12px',
    borderRadius: '14px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    marginTop: '8px',
    cursor: 'pointer'
  },
  tarjetaLista: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#161618',
    padding: '16px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.03)',
    cursor: 'pointer'
  },
  tarjetaListaIcono: {
    fontSize: '24px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imagenPortadaTorneo: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  textoVacio: { color: '#8E8E93', fontSize: '14px', margin: '8px 0' },
  loadingContainer: { display: 'flex', justifyContent: 'center', padding: '40px' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(57, 255, 20, 0.2)', borderTop: '3px solid #39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  alerta: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', fontWeight: '600' },
}
