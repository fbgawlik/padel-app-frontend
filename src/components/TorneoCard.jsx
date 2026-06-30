// src/components/TorneoCard.jsx
import React from 'react';

export const TorneoCard = ({ torneo, onVerDetalles, onEditar, esAdmin }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.titulo}>{torneo.nombre}</h3>
        {/* Usamos el verde neón para el estado del torneo */}
        <span style={styles.badge}>{torneo.estado || 'Activo'}</span> 
      </div>
      
      <div style={styles.infoContainer}>
        <p style={styles.textoInfo}>
          <strong style={styles.label}>Fecha:</strong> {torneo.fechaInicio} al {torneo.fechaFin}
        </p>
        <p style={styles.textoInfo}>
          <strong style={styles.label}>Complejo:</strong> {torneo.complejo?.nombre || 'No especificado'}
        </p>
      </div>
      
      <div style={styles.actions}>
        <button onClick={() => onVerDetalles(torneo)} style={styles.btnPrincipal}>
          Ver Cuadros / Detalles
        </button>
        {esAdmin && (
          <button onClick={() => onEditar(torneo)} style={styles.btnAdmin}> 
            Editar
          </button>
        )}
      </div>
    </div>
  );
};

// Estilos actualizados a la estética Premium Dark/Neon
const styles = {
  card: {
    backgroundColor: '#161618',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.03)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '200px' // Mantiene consistencia en el grid
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '10px'
  },
  titulo: {
    margin: 0,
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '1.2'
  },
  badge: { 
    backgroundColor: 'rgba(57, 255, 20, 0.1)', 
    color: '#39FF14', 
    padding: '4px 10px', 
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    border: '1px solid rgba(57, 255, 20, 0.2)',
    whiteSpace: 'nowrap'
  },
  infoContainer: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  textoInfo: {
    margin: 0,
    color: '#EAEAEA',
    fontSize: '14px'
  },
  label: {
    color: '#8E8E93',
    fontWeight: '600'
  },
  actions: { 
    display: 'flex', 
    gap: '12px',
    marginTop: 'auto' 
  },
  btnPrincipal: { 
    flex: 1,
    backgroundColor: '#39FF14', // Acento principal
    color: '#0F0F10', 
    border: 'none',
    padding: '12px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
  },
  btnAdmin: { 
    backgroundColor: 'transparent', 
    color: '#ff4d4d', // Rojo sutil para acciones destructivas/edición
    border: '1px solid rgba(255, 77, 77, 0.3)',
    padding: '12px 16px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }
};