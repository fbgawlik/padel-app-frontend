// src/screens/VerificarCuentaScreen.styles.js
import { theme } from '../theme';

export const styles = {
  contenedor: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100dvh',
    padding: '24px 20px',
    boxSizing: 'border-box',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: theme.colors.background,
  },
  tarjeta: {
    backgroundColor: theme.colors.cardBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px 28px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    boxSizing: 'border-box',
  },
  contenedorLogo: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoTexto: {
    color: theme.colors.text,
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: '0 0 5px 0',
  },
  subtituloLogo: {
    color: theme.colors.primary,
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '3px',
    margin: 0,
  },
  descripcion: {
    color: '#A0A0A5',
    fontSize: '14px',
    lineHeight: '1.6',
    textAlign: 'center',
    margin: '0 0 24px 0',
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
    color: '#A0A0A5',
    fontSize: '13px',
    fontWeight: '600',
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
    transition: 'border-color 0.2s',
  },

  /* ─── CASILLEROS OTP ─── */
  contenedorOtp: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  otpInput: {
    width: '100%',
    maxWidth: '52px',
    height: '56px',
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    color: theme.colors.text,
    fontSize: '22px',
    fontWeight: '800',
    textAlign: 'center',
    outline: 'none',
    caretColor: theme.colors.primary,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    flex: 1,
  },
  otpInputLleno: {
    borderColor: 'rgba(190, 242, 100, 0.45)',
    backgroundColor: 'rgba(190, 242, 100, 0.04)',
  },
  otpInputError: {
    borderColor: 'rgba(255, 77, 77, 0.5)',
  },

  /* ─── CAJA MODO DEV ─── */
  cajaDev: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    border: '1px dashed rgba(0, 229, 255, 0.35)',
    borderRadius: '12px',
    padding: '12px 14px',
  },
  tituloDev: {
    color: '#34D399',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  textoDev: {
    color: '#E5E5EA',
    fontSize: '13px',
  },
  codigoDev: {
    color: '#34D399',
    fontSize: '15px',
    letterSpacing: '2px',
  },
  notaDev: {
    color: '#8E8E93',
    fontSize: '11px',
    lineHeight: '1.4',
  },

  /* ─── BOTONES ─── */
  botonVerificar: {
    backgroundColor: theme.colors.primary,
    color: '#0A0A0B',
    border: 'none',
    borderRadius: '14px',
    height: '52px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 4px 20px rgba(190, 242, 100, 0.25)',
    transition: 'all 0.2s ease',
  },
  botonDeshabilitado: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.25)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },

  /* ─── REENVÍO ─── */
  contenedorReenvio: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '13px',
  },
  countdown: {
    color: '#8E8E93',
    fontWeight: '600',
  },
  enlaceReenvio: {
    background: 'none',
    border: 'none',
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  },
  enlaceReenvioDeshabilitado: {
    background: 'none',
    border: 'none',
    color: '#8E8E93',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'wait',
    padding: 0,
  },

  /* ─── ÉXITO ─── */
  exitoGrande: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    backgroundColor: 'rgba(190, 242, 100, 0.1)',
    border: '2px solid rgba(190, 242, 100, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px auto 20px auto',
    animation: 'pulseExito 1.2s ease infinite',
  },
  iconoExito: {
    color: theme.colors.primary,
    fontSize: '40px',
    fontWeight: '900',
  },
  textoExito: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.6',
    margin: 0,
  },
  textoSecundario: {
    color: '#8E8E93',
    fontSize: '13px',
    fontWeight: '500',
  },

  /* ─── ERRORES ─── */
  error: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    color: '#ff3b30',
    border: '1px solid rgba(255, 59, 48, 0.4)',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '4px',
    lineHeight: '1.4',
    fontWeight: '600',
  },

  /* ─── VOLVER ─── */
  contenedorVolver: {
    marginTop: '20px',
    textAlign: 'center',
  },
  enlaceVolver: {
    color: '#A0A0A5',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
};