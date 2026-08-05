import { theme } from '../theme';

export const styles = {
  contenedor: { 
    paddingBottom: theme.spacing.bottomNavPadding,
    width: '100%',         // Ajustado para el navegador móvil moderno
    backgroundColor: theme.colors.background, // Fondo general para fundirse con la tarjeta
    color: '#fff', 
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',       // Centra la tarjeta verticalmente
    padding: '20px'             // Padding en todos los lados (importante para móviles)
  },
  tarjetaRegister: {
    backgroundColor: theme.colors.background, 
    width: '100%',
    maxWidth: '420px',
    padding: '32px 24px',       // Un poco más de aire interno
    boxSizing: 'border-box',
    borderRadius: '16px',       // Suaviza los bordes para estilo App
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)' // Sutil sombra para separarlo del fondo
  },
  contenedorLogo: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  logoTexto: {
    color: theme.colors.text,
    fontSize: '34px',
    fontWeight: '900',
    letterSpacing: '1px',
    margin: '0 0 4px 0',
  },
  subtituloLogo: {
    color: theme.colors.primary, 
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: 0,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  filaDoble: {
    display: 'flex',
    gap: '14px',
    // En pantallas MUY chicas (ej. iPhone SE), podrías necesitar que esto sea flex-direction: column. 
    // Como usas estilos en línea, dejémoslo en row pero asegurándonos que los inputs tengan un ancho mínimo de 100%.
  },
  grupoInput: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative' 
  },
  etiqueta: {
    color: '#8E8E93',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '8px',
    textAlign: 'left' // Cambiado a 'left' (o 'center' si lo prefieres, pero left suele ser mejor en móviles)
  },
  input: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    height: '48px',
    padding: '0 16px',
    color: theme.colors.text,
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left', // Cambiado a 'left' para mejorar usabilidad móvil
  },
  customSelectTrigger: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    height: '48px',
    padding: '0 16px',
    color: theme.colors.text,
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  flecha: {
    fontSize: '10px',
    color: '#8E8E93'
  },
  opcionesContenedor: {
    position: 'absolute',
    top: '74px',
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    zIndex: 100,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
  },
  opcionesContenedorMax: {
    position: 'absolute',
    top: '74px',
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    zIndex: 100,
    maxHeight: '200px', 
    overflowY: 'auto',   
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
  },
  opcion: {
    padding: '14px',
    fontSize: '14px',
    textAlign: 'left', // Cambiado a 'left'
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: theme.colors.text,
    transition: 'background-color 0.2s',
  },
  botonRegistrar: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    border: 'none',
    borderRadius: '14px',
    height: '52px',
    fontSize: '16px', // Un poco más grande para el tap
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 4px 20px rgba(57, 255, 20, 0.2)',
  },
  error: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    color: '#ff4d4d',
    border: '1px solid #ff4d4d',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: '20px',
  },
  contenedorLoginRedireccion: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '14px',
  },
  textoSecundario: {
    color: '#8E8E93',
  },
  enlaceLogin: {
    color: theme.colors.primary,
    textDecoration: 'underline',
    fontWeight: '700',
    marginLeft: '5px',
  },
}
