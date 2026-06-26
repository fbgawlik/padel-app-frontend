// src/components/TorneoCard.jsx
import React from 'react';

export const TorneoCard = ({ torneo, onVerDetalles, esAdmin }) => {
  return (
    <div className="torneo-card" style={styles.card}>
      <div style={styles.header}>
        <h3>{torneo.nombre}</h3>
        <span style={styles.badge}>{torneo.estado}</span>
      </div>
      
      <p><strong>Fecha:</strong> {torneo.fechaInicio} al {torneo.fechaFin}</p>
      <p><strong>Complejo:</strong> {torneo.complejo?.nombre || 'No especificado'}</p>
      
     <div style={styles.actions}>
        <button onClick={() => onVerDetalles(torneo)} style={styles.btnPrincipal}>
          Ver Cuadros / Detalles
        </button>
        {esAdmin && (
          <button onClick={() => onEditar(torneo)} style={styles.btnAdmin}> {/* ✅ Ejecuta la prop */}
            Editar
          </button>
        )}
      </div>
    </div>
  );
};

// Puedes mover aquí los estilos específicos de la tarjeta que tenías en TorneosScreen
const styles = {
  card: { /* tus estilos oscuros y neón aquí */ },
  header: { display: 'flex', justifyContent: 'space-between' },
  badge: { backgroundColor: '#00ffcc', color: '#000', padding: '2px 8px', borderRadius: '4px' },
  actions: { marginTop: '15px', display: 'flex', gap: '10px' },
  btnPrincipal: { cursor: 'pointer' },
  btnAdmin: { backgroundColor: '#ff3366', color: '#fff' }
};