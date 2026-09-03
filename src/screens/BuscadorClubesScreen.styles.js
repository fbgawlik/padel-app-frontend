import { theme } from '../theme';

export const styles = {
  contenedor: { 
    padding: '16px 20px 32px 20px', 
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  headerContenedor: {
    marginBottom: '28px'
  },
  tituloGrande: { 
    fontSize: '34px', 
    fontWeight: '800', 
    color: theme.colors.text, 
    margin: '0 0 6px 0',
    letterSpacing: '-0.8px'
  },
  subtitulo: {
    color: '#8E8E93',
    fontSize: '15px',
    margin: '0 0 24px 0',
    letterSpacing: '-0.2px'
  },
  buscadorGlass: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#121214',
    borderRadius: '24px',
    padding: '16px 20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  iconoBuscar: {
    fontSize: '16px',
    opacity: 0.7
  },
  inputNativo: {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text,
    fontSize: '15px',
    width: '100%',
    outline: 'none',
    fontWeight: '500'
  },
  resultadosHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    paddingLeft: '4px'
  },
  tituloSeccion: {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
    letterSpacing: '-0.3px'
  },
  badgeContador: {
    backgroundColor: 'rgba(190, 242, 100, 0.1)',
    color: theme.colors.primary,
    padding: '4px 10px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '700'
  },
  grillaClubes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  tarjetaClubNativa: {
    backgroundColor: '#121214',
    borderRadius: '28px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  },
  imagenClubContenedor: {
    height: '180px',
    width: '100%',
    backgroundColor: '#1A1A1E',
    position: 'relative'
  },
  imagenImagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagenPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    opacity: 0.3
  },
  badgeFlotante: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    backgroundColor: 'rgba(18, 18, 20, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: theme.colors.text,
    padding: '6px 14px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  infoContenedor: {
    padding: '20px 22px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },
  textoAgrupado: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  nombreClub: {
    fontSize: '19px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
    letterSpacing: '-0.4px'
  },
  direccionClub: {
    fontSize: '13px',
    color: '#8E8E93',
    margin: 0,
    letterSpacing: '-0.1px'
  },
  badgeAccion: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(190, 242, 100, 0.08)',
    padding: '8px 14px',
    borderRadius: '99px',
    border: '1px solid rgba(190, 242, 100, 0.15)'
  },
  textoBadgeAccion: {
    color: theme.colors.primary,
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '-0.1px'
  },
  flechaBadge: {
    color: theme.colors.primary,
    fontSize: '12px',
    fontWeight: '700'
  },
  estadoVacio: { 
    display: 'flex', 
    justifyContent: 'center',
    padding: '80px 0'
  },
  textoVacio: {
    color: '#8E8E93',
    fontSize: '15px'
  },
  estadoVacioSpinner: {
    display: 'flex',
    justifyContent: 'center',
    padding: '80px 0'
  },
  spinner: { 
    width: '28px', 
    height: '28px', 
    border: '3px solid rgba(190, 242, 100, 0.1)', 
    borderTop: '3px solid #BEF264', 
    borderRadius: '50%'
  }
}