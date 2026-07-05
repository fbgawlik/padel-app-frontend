// src/screens/TorneosScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';

const TorneosScreen = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('Todos'); 

  const { data: torneos = [], isLoading, isError } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const res = await API.get('/torneos');
      return res.data;
    }
  });

  // Filtro básico (puedes expandirlo luego con la lógica de fechas)
  const torneosFiltrados = torneos.filter(torneo => {
    if (filtro === 'Todos') return true;
    return true; 
  });

  return (
    <div style={styles.contenedorPadre}>
      {/* CABECERA */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M19 12H5M12 19l-7-7 7-7"/>
           </svg>
        </button>
        <h1 style={styles.titulo}>Torneos</h1>
        <div style={{ width: '24px' }} />
      </div>

      {/* FILTROS */}
      <div style={styles.filtrosContenedor}>
        {['Todos', 'Proximos', 'En Curso'].map((opcion) => (
          <button
            key={opcion}
            onClick={() => setFiltro(opcion)}
            style={{
              ...styles.pildoraFiltro,
              ...(filtro === opcion ? styles.pildoraActiva : {})
            }}
          >
            {opcion}
          </button>
        ))}
      </div>

      {/* ESTADOS DE CARGA Y ERROR */}
      {isLoading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      )}
      {isError && !isLoading && (
        <div style={styles.alerta}><span>⚠️ Error al cargar los torneos.</span></div>
      )}

      {/* LISTA DE TORNEOS */}
      {!isLoading && !isError && (
        <div style={styles.listaTorneos}>
          {torneosFiltrados.length > 0 ? (
            torneosFiltrados.map((torneo) => {
              // Calculamos los cupos en base a las inscripciones reales
              const anotados = torneo.inscripciones?.length || 0;
              const cupoMaximo = torneo.cupoParejas || 16;
              const cuposLlenos = anotados >= cupoMaximo;

              return (
                <div 
                  key={torneo.id} 
                  style={styles.tarjetaTorneo} 
                  onClick={() => navigate(`/torneos/${torneo.id}`)}
                >
                  <div style={{
                    ...styles.imagenTorneo,
                    // Si el complejo tiene imagen, la usamos. Si no, usamos una genérica de Resistencia o padel.
                    backgroundImage: `url("${torneo.complejo?.imagenUrl || 'https://images.unsplash.com/photo-1592656094267-764a4506f368?w=500'}")`
                  }}>
                    <div style={styles.overlayImagen}>
                      <span style={styles.badgePrecio}>
                        ${torneo.precioInscripcion ? torneo.precioInscripcion.toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.infoTorneo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={styles.nombreTorneo}>{torneo.nombre}</h3>
                      <span style={{
                        ...styles.badgeEstado,
                        backgroundColor: cuposLlenos ? 'rgba(255, 51, 51, 0.1)' : 'rgba(57, 255, 20, 0.1)',
                        color: cuposLlenos ? '#ff4d4d' : '#39FF14'
                      }}>
                        {cuposLlenos ? 'COMPLETO' : 'ABIERTO'}
                      </span>
                    </div>
                    
                    {/* Badge de Categorías */}
                    <div style={styles.badgeCategoria}>
                      🎾 {torneo.categoria || 'Categoría General'}
                    </div>
                    
                    <div style={styles.detallesRow}>
                      <span style={styles.detalleItem}>
                        <span style={styles.iconoDetalle}>🗓️</span> {torneo.fechaInicio}
                      </span>
                      <span style={styles.detalleItem}>
                        <span style={styles.iconoDetalle}>📍</span> {torneo.complejo?.nombre || 'Sede a confirmar'}
                      </span>
                      <span style={styles.detalleItem}>
                        <span style={styles.iconoDetalle}>👥</span> {anotados} / {cupoMaximo} Parejas
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
             <p style={styles.textoVacio}>No hay torneos disponibles en este momento.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ... (Los estilos se mantienen iguales al mensaje anterior, con un par de agregados)
const styles = {
  contenedorPadre: { padding: '24px 16px', backgroundColor: 'transparent', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', paddingBottom: '100px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  backButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' },
  titulo: { color: '#ffffff', fontSize: '20px', fontWeight: '800', margin: 0 },
  filtrosContenedor: { display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' },
  pildoraFiltro: { padding: '8px 16px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#8E8E93', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  pildoraActiva: { backgroundColor: 'rgba(57, 255, 20, 0.1)', borderColor: '#39FF14', color: '#39FF14' },
  listaTorneos: { display: 'flex', flexDirection: 'column', gap: '16px' },
  tarjetaTorneo: { backgroundColor: '#161618', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease' },
  imagenTorneo: { height: '140px', width: '100%', backgroundColor: '#2A2A2D', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  overlayImagen: { position: 'absolute', top: '12px', right: '12px' },
  badgePrecio: { backgroundColor: '#39FF14', color: '#0F0F10', padding: '6px 12px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', boxShadow: '0 4px 12px rgba(57, 255, 20, 0.3)' },
  infoTorneo: { padding: '16px' },
  nombreTorneo: { margin: '0 0 8px 0', color: '#fff', fontSize: '18px', fontWeight: '700' },
  badgeEstado: { padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' },
  badgeCategoria: { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.05)', color: '#EAEAEA', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' },
  detallesRow: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' },
  detalleItem: { color: '#8E8E93', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },
  iconoDetalle: { fontSize: '14px' },
  loadingContainer: { display: 'flex', justifyContent: 'center', padding: '40px' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(57, 255, 20, 0.2)', borderTop: '3px solid #39FF14', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  alerta: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '16px', borderRadius: '12px', fontWeight: '600' },
  textoVacio: { color: '#8E8E93', fontSize: '14px', textAlign: 'center', marginTop: '40px' }
};

export default TorneosScreen;