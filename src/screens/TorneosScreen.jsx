// src/screens/TorneosScreen.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useQuery } from '@tanstack/react-query';

const TorneosScreen = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');

  // Fetch de torneos
  const { data: torneos = [], isLoading, isError } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const res = await API.get('/torneos');
      return res.data;
    }
  });

  // Dividimos los datos para simular "Populares" (los primeros 3) y "Recomendados" (el resto)
  const torneosDestacados = torneos.slice(0, 3);
  const torneosRecomendados = torneos.filter(t => t.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (isLoading) return (
    <div style={styles.centerContainer}>
      <div style={styles.spinner}></div>
    </div>
  );

  if (isError) return (
    <div style={styles.centerContainer}>
      <p style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Error al cargar los torneos.</p>
    </div>
  );

  return (
    <div style={styles.screenContainer}>
      {/* CABECERA Y BUSCADOR */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.iconButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div style={styles.searchContainer}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '12px' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar torneos..." 
            style={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button style={styles.filterButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </button>
      </div>

      {/* SECCIÓN: DESTACADOS (Scroll Horizontal) */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Destacados</h2>
          <span style={styles.showAll}>Ver todos</span>
        </div>
        
        <div style={styles.horizontalScroll}>
          {torneosDestacados.map(torneo => (
            <div 
              key={torneo.id} 
              style={styles.heroCard}
              onClick={() => navigate(`/torneos/${torneo.id}`)}
            >
              <img 
                src={torneo.complejo?.imagenUrl || 'https://images.unsplash.com/photo-1592656094267-764a4506f368?w=500'} 
                alt={torneo.nombre} 
                style={styles.heroImage} 
              />
              <div style={styles.heroOverlay}>
                <div style={styles.glassPanel}>
                  <h3 style={styles.glassTitle}>{torneo.nombre}</h3>
                  <div style={styles.glassDetails}>
                    <span>📍 {torneo.complejo?.nombre || 'Sede a confirmar'}</span>
                    <span style={styles.priceTag}>
                      ${torneo.precioInscripcion?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN: TODOS LOS TORNEOS (Lista Vertical) */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recomendados</h2>
        </div>

        <div style={styles.verticalList}>
          {torneosRecomendados.length > 0 ? torneosRecomendados.map(torneo => (
            <div 
              key={torneo.id} 
              style={styles.standardCard}
              onClick={() => navigate(`/torneos/${torneo.id}`)}
            >
              <div style={styles.cardImageContainer}>
                <img 
                  src={torneo.complejo?.imagenUrl || 'https://images.unsplash.com/photo-1554068865-24cecd4e34e8?w=500'} 
                  alt={torneo.nombre} 
                  style={styles.cardImage} 
                />
                <button style={styles.likeButton}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
              
              <div style={styles.cardInfo}>
                <h3 style={styles.cardTitle}>{torneo.nombre}</h3>
                <p style={styles.cardLocation}>{torneo.complejo?.nombre || 'Complejo Deportivo'}</p>
                
                <div style={styles.cardFooter}>
                  <div style={styles.footerLeft}>
                    <span style={styles.footerLabel}>Inscripción desde</span>
                    <span style={styles.footerPrice}>${torneo.precioInscripcion?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={styles.badgeRating}>
                    <span style={{color: '#FFF', fontWeight: 'bold', fontSize: '12px'}}>
                      {torneo.categoria || 'Gen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <p style={{ color: '#8E8E93', textAlign: 'center', marginTop: '20px' }}>No se encontraron torneos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS INSPIRADOS EN LA APP DE VIAJES ---
const styles = {
  centerContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' },
  spinner: { width: '40px', height: '40px', border: '4px solid rgba(108, 99, 255, 0.2)', borderTop: '4px solid #6C63FF', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  
  screenContainer: {
    backgroundColor: '#F8F9FA', // Fondo claro limpio
    minHeight: '100vh',
    width: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    paddingBottom: '100px',
  },

  // CABECERA
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 16px',
    gap: '12px',
    marginTop: '10px'
  },
  iconButton: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  searchContainer: {
    flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: '16px', height: '48px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
  },
  searchInput: {
    border: 'none', background: 'transparent', outline: 'none', padding: '0 12px',
    width: '100%', fontSize: '15px', color: '#1A1A1E', fontWeight: '500'
  },
  filterButton: {
    width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#6C63FF', // Morado moderno del video
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)'
  },

  // SECCIONES
  section: { marginTop: '10px', marginBottom: '30px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '16px' },
  sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#1A1A1E', margin: 0 },
  showAll: { fontSize: '14px', fontWeight: '600', color: '#A0A0A5', cursor: 'pointer' },

  // SCROLL HORIZONTAL (Populares)
  horizontalScroll: {
    display: 'flex', overflowX: 'auto', gap: '16px', padding: '0 16px 20px 16px',
    msOverflowStyle: 'none', scrollbarWidth: 'none'
  },
  heroCard: {
    minWidth: '240px', height: '320px', borderRadius: '28px', position: 'relative',
    overflow: 'hidden', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  },
  heroImage: { width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px'
  },
  glassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', borderRadius: '20px', padding: '16px',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  glassTitle: { color: '#FFF', fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' },
  glassDetails: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFF', fontSize: '13px', fontWeight: '600' },
  priceTag: { backgroundColor: '#FFF', color: '#1A1A1E', padding: '4px 8px', borderRadius: '10px', fontWeight: '800' },

  // LISTA VERTICAL (Recomendados)
  verticalList: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 16px' },
  standardCard: {
    backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)', cursor: 'pointer', border: '1px solid #F0F0F0'
  },
  cardImageContainer: { position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  likeButton: {
    position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px',
    borderRadius: '50%', backgroundColor: '#FFFFFF', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer'
  },
  cardInfo: { padding: '0 8px' },
  cardTitle: { fontSize: '18px', fontWeight: '800', color: '#1A1A1E', margin: '0 0 4px 0' },
  cardLocation: { fontSize: '13px', color: '#8E8E93', fontWeight: '500', margin: '0 0 16px 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { display: 'flex', flexDirection: 'column' },
  footerLabel: { fontSize: '11px', color: '#A0A0A5', fontWeight: '600', textTransform: 'uppercase' },
  footerPrice: { fontSize: '20px', fontWeight: '900', color: '#1A1A1E' },
  badgeRating: {
    backgroundColor: '#6C63FF', padding: '6px 12px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(108, 99, 255, 0.4)'
  }
};

export default TorneosScreen;