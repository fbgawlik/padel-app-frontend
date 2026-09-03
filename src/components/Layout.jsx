// src/components/Layout.jsx
// ───────────────────────────────────────────────────────────
// Refactor v2: ambient glow con tokens del theme (lima +
// esmeralda), sin hex hardcodeados.
// ───────────────────────────────────────────────────────────
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { theme } from '../theme';

const Layout = () => {
  return (
    <div style={styles.appContainer}>
      {/* ─── LUCES DE AMBIENTE (GLOWS) ─── */}
      <div style={styles.glowTopLeft} />
      <div style={styles.glowBottomRight} />

      <main style={styles.mainContent}>
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
};

const styles = {
  appContainer: {
    backgroundColor: theme.colors.background,
    minHeight: '100dvh',
    width: '100%',
    color: theme.colors.text,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
    overflowX: 'hidden',
  },
  glowTopLeft: {
    position: 'absolute',
    top: '-150px',
    left: 'calc(50% - 300px)',
    width: '300px',
    height: '300px',
    backgroundColor: theme.colors.primary,
    borderRadius: '50%',
    opacity: '0.07',
    filter: 'blur(90px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: '100px',
    right: 'calc(50% - 250px)',
    width: '250px',
    height: '250px',
    backgroundColor: theme.colors.secondaryGlow,
    borderRadius: '50%',
    opacity: '0.05',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  mainContent: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    flex: 1,
    paddingBottom: '112px',
    paddingTop: '8px',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 2,
  },
};

export default Layout;
