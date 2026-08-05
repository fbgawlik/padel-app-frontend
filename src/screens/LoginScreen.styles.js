import { theme } from '../theme';

export const styles = {
 contenedor: { 
    paddingBottom: theme.spacing.bottomNavPadding,
  display: 'flex',
  justifyContent: 'center', // Centra la tarjeta horizontalmente
  alignItems: 'center',     // Centra la tarjeta verticalmente      // Ajustado para el navegador móvil moderno
  padding: '20px', 
  color: '#fff', 
  fontFamily: 'sans-serif',
  boxSizing: 'border-box',
  backgroundColor: theme.colors.background // Fondo oscuro para que combine con el diseño premium
},
  tarjetaLogin: {
    backgroundColor: theme.colors.cardBg,
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  contenedorLogo: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  logoTexto: {
    color: theme.colors.text,
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: '0 0 5px 0',
  },
  subtituloLogo: {
    color: theme.colors.primary, // Verde pista eléctrico vibrante
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '3px',
    margin: 0,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grupoInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  etiqueta: {
    color: '#aaaaaa',
    fontSize: '13px',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 16px',
    color: theme.colors.text,
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  botonIngresar: {
    backgroundColor: theme.colors.primary,
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    marginTop: '10px',
  },
  error: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    color: '#ff3b30',
    border: '1px solid #ff3b30',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  contenedorRegistro: {
    marginTop: '25px',
    textAlign: 'center',
    fontSize: '14px',
  },
  textoSecundario: {
    color: '#aaaaaa',
  },
  enlaceRegistro: {
    color: theme.colors.primary,
    textDecoration: 'none',
    fontWeight: '700',
    marginLeft: '5px',
    transition: 'color 0.2s'
  },
}
