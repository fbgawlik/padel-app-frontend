// src/theme/index.js
// ───────────────────────────────────────────────────────────
// ADN PÁDEL · Sistema de diseño (refactor v2)
// Paleta dark refinada: lima como único acento + esmeralda
// para degradados. Se eliminó el cian intruso que rompía la
// coherencia visual en la tab "Cronograma".
// ───────────────────────────────────────────────────────────
export const theme = {
  colors: {
    // Acento principal — lima refinado (antes #39FF14 neón crudo).
    primary: '#BEF264',
    // Variante profunda para degradados/bordes.
    primaryDeep: '#84CC16',
    // Brillo semitransparente para sombras y rings.
    primaryGlow: 'rgba(190, 242, 100, 0.55)',
    primarySoft: 'rgba(190, 242, 100, 0.12)',

    // Secundario — esmeralda (reemplaza al cian #00E5FF que
    // rompía la coherencia cromática de la app).
    secondaryGlow: '#34D399',
    secondarySoft: 'rgba(52, 211, 153, 0.12)',

    // Superficies — negros con sutil tinte verde.
    background: '#0B0F0D',
    surface: '#141A17',
    surfaceAlt: '#101512',
    elevated: '#1A211D',
    cardBg: 'rgba(20, 26, 23, 0.82)',

    // Texto.
    text: '#FFFFFF',
    textSecondary: '#A7B0A9',
    textMuted: '#7A847E',

    // Estado.
    danger: '#FF453A',
    dangerSoft: 'rgba(255, 69, 58, 0.12)',
    warning: '#FBBF24',
    success: '#34D399',

    // Bordes.
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.14)',
  },
  spacing: {
    bottomNavPadding: '120px',
    screenPadding: '16px',
  },
  borderRadius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '24px',
    card: '20px',
    button: '32px',
    pill: '999px',
  },
  shadows: {
    card: '0 8px 24px rgba(0, 0, 0, 0.25)',
    nav: '0px 12px 40px rgba(0, 0, 0, 0.6)',
    primary: '0 8px 24px -6px rgba(190, 242, 100, 0.45)',
    primaryGlow: '0 0 0 1px rgba(190, 242, 100, 0.35), 0 8px 30px -8px rgba(190, 242, 100, 0.45)',
  },
  transitions: {
    fast: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    base: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};
