// src/screens/ClasesScreen.styles.js
import { theme } from '../theme';

export const styles = {
  contenedor: { width: '100%', boxSizing: 'border-box', padding: '32px 20px 24px 20px' },
  headerSeccion: { 
    borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px',
    display: 'flex', flexDirection: 'column', gap: '20px'
  },
  tituloPrincipal: { fontSize: '30px', margin: '0 0 8px 0', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  searchBarWrapper: { position: 'relative', width: '100%' },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' },
  searchInput: { 
    width: '100%', boxSizing: 'border-box',
    backgroundColor: '#1A1A1A', color: '#fff', 
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', 
    padding: '14px 14px 14px 48px', outline: 'none', transition: 'border-color 0.2s',
    fontSize: '15px'
  },
  alertaError: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '14px', borderRadius: '10px', marginBottom: '24px', fontWeight: '600' },
  estadoVacioTarjeta: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8A8A8A', backgroundColor: '#121212', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' },
  estadoVacio: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#8A8A8A' },
  spinner: { width: '30px', height: '30px', border: '3px solid rgba(0,255,102,0.2)', borderTop: '3px solid #00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  /* 🛠️ FIX CRÍTICO: antes eran 2 columnas de ~220px y la card interna (avatar +
     detalles + precio/acción) quedaba aplastada sin mostrar la información.
     Una sola columna garantiza legibilidad en móvil (el padding del nav lo
     maneja el Layout, no cada pantalla). */
  grillaClases: { display: 'flex', flexDirection: 'column', gap: '14px' },
  tarjetaClase: { 
    backgroundColor: '#121212', borderRadius: '18px', 
    border: '1px solid rgba(255,255,255,0.08)', position: 'relative', 
    display: 'flex', flexDirection: 'column', overflow: 'hidden', 
    transition: 'transform 0.18s, border-color 0.18s',
    cursor: 'default',
    padding: '12px'
  },
  cuerpoTarjetaRediseñado: {
    flex: 1, display: 'flex', gap: '10px', 
    alignItems: 'flex-start'
  },
  headerMiniRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' },
  tipoBadge: { fontSize: '10px', fontWeight: '800', color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: '0.6px', backgroundColor: 'rgba(57,255,20,0.1)', padding: '4px 8px', borderRadius: '999px' },
  claseName: { fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.3px' },
  claseDateTime: { color: '#EAEAEA', fontSize: '12px', fontWeight: '500', margin: '3px 0' },
  profesorLabel: { color: '#8A8A8A', margin: 0, fontSize: '12px', fontWeight: '600' },
  tarjetaColumnaDetalles: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 },
  tarjetaColumnaAvatar: { width: '50px', height: '50px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)' },
  profesorAvatar: { width: '100%', height: '100%', objectFit: 'cover' },
  profesorAvatarPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#191919', color: theme.colors.primary, fontSize: '24px' },
  inputTercerosWrapper: { marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.05)' },
  inputLabelTerceros: { fontSize: '12px', color: '#8A8A8A', display: 'block', marginBottom: '6px', fontWeight: '600' },
  inputFormTerceros: { backgroundColor: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', outline: 'none', padding: '8px 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' },
  /* Columna de precio y botón (definida una sola vez: antes estaba triplicada) */
  tarjetaColumnaAccion: { width: '118px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch', justifyContent: 'flex-start' },
  precioGrande: { fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px', textAlign: 'right' },
  plazasText: { fontSize: '12px', color: '#8A8A8A', fontWeight: '600', textAlign: 'right' },
  skillTag: { display: 'inline-block', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '14px', margin: '6px 0 0 0', alignSelf: 'start' },
  botonInscribirDestacado: { 
    border: 'none', padding: '10px 6px', borderRadius: '10px', 
    fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box',
    textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: '1.25',
    whiteSpace: 'normal', wordBreak: 'break-word'
  },
  statusClosed: { fontSize: '11px', fontWeight: '700', padding: '8px 6px', borderRadius: '10px', backgroundColor: 'rgba(255, 51, 51, 0.1)', color: '#ff4d4d', textAlign: 'center', width: '100%', boxSizing: 'border-box', lineHeight: '1.25' },
  fabCrearClase: {
    position: 'fixed', bottom: '88px', right: '24px',
    padding: '16px 20px', borderRadius: '999px',
    backgroundColor: theme.colors.primary, color: '#0F0F10', border: 'none',
    fontWeight: '800', fontSize: '14px', cursor: 'pointer',
    boxShadow: '0 16px 40px rgba(57, 255, 20, 0.18)',
    display: 'flex', alignItems: 'center', gap: '10px', zIndex: 200
  },
  fabIcon: { fontSize: '18px', lineHeight: 1 }
}