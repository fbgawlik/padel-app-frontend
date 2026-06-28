// src/screens/BuscadorClubesScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const BACKEND_URL = 'https://padel-api-backend-production.up.railway.app';

const BuscadorClubesScreen = () => {
  const navigate = useNavigate();
  const [listaComplejos, setListaComplejos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplejos = async () => {
      try {
        const res = await API.get('/complejos');
        setListaComplejos(res.data);
      } catch (err) {
        console.error("Error al cargar complejos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplejos();
  }, []);

  const complejosFiltrados = listaComplejos.filter(club => 
    club.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    club.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.contenedor}>
      
      {/* HEADER DE EXPLORACIÓN */}
      <div style={styles.headerContenedor}>
        <h1 style={styles.tituloGrande}>Explorar</h1>
        <p style={styles.subtitulo}>Encuentra tu próximo club para jugar.</p>
        
        {/* BARRA DE BÚSQUEDA TIPO iOS */}
        <div style={styles.buscadorGlass}>
          <span style={{ fontSize: '18px', color: '#8E8E93' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre o zona..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            style={styles.inputNativo}
          />
        </div>
      </div>

      <div style={styles.resultadosHeader}>
        <h3 style={styles.tituloSeccion}>Clubes Disponibles</h3>
        {!loading && <span style={styles.badgeContador}>{complejosFiltrados.length}</span>}
      </div>
      
      {/* LISTA DE CLUBES */}
      <div style={styles.grillaClubes}>
        {loading ? (
          <div style={styles.estadoVacio}>
            <div style={styles.spinner}></div>
          </div>
        ) : complejosFiltrados.length === 0 ? (
          <div style={styles.estadoVacio}>
            <p>No encontramos clubes con esa búsqueda 😔</p>
          </div>
        ) : (
          complejosFiltrados.map((club) => {
            const urlFoto = club.imagenUrl 
              ? (club.imagenUrl.startsWith('http') ? club.imagenUrl : `${BACKEND_URL}${club.imagenUrl}`)
              : null;

            return (
              <div key={club.id} style={styles.tarjetaClubNativa} onClick={() => navigate(`/reservar/${club.id}`)}>
                
                {/* Imagen del club grande arriba */}
                <div style={styles.imagenClubContenedor}>
                  {urlFoto ? (
                    <img src={urlFoto} alt={club.nombre} style={styles.imagenImagen} />
                  ) : (
                    <div style={styles.imagenPlaceholder}>🏟️</div>
                  )}
                  {/* Badge de cantidad de canchas flotante */}
                  <div style={styles.badgeFlotante}>
                    {club.canchas?.length || 0} Canchas
                  </div>
                </div>

                <div style={styles.infoContenedor}>
                  <div>
                    <h4 style={styles.nombreClub}>{club.nombre}</h4>
                    <p style={styles.direccionClub}>📍 {club.direccion || 'Sin dirección registrada'}</p>
                  </div>
                  
                  <button style={styles.botonReservaRapida}>
                    Ver turnos
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  contenedor: { 
    padding: '24px 16px', 
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  headerContenedor: {
    marginBottom: '24px'
  },
  tituloGrande: { 
    fontSize: '32px', 
    fontWeight: '800', 
    color: '#fff', 
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px'
  },
  subtitulo: {
    color: '#8E8E93',
    fontSize: '15px',
    margin: '0 0 20px 0'
  },
  
  // Buscador
  buscadorGlass: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#161618',
    borderRadius: '20px',
    padding: '14px 20px',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  inputNativo: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    width: '100%',
    outline: 'none',
    fontWeight: '500'
  },

  resultadosHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  tituloSeccion: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    margin: 0
  },
  badgeContador: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    color: '#39FF14',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700'
  },

  grillaClubes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  
  // Tarjetas de Clubes
  tarjetaClubNativa: {
    backgroundColor: '#161618',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    cursor: 'pointer'
  },
  imagenClubContenedor: {
    height: '160px',
    width: '100%',
    backgroundColor: '#111',
    position: 'relative'
  },
  imagenImagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagenPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    opacity: 0.5
  },
  badgeFlotante: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  infoContenedor: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },
  nombreClub: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px'
  },
  direccionClub: {
    fontSize: '13px',
    color: '#8E8E93',
    margin: 0
  },
  botonReservaRapida: {
    backgroundColor: '#39FF14',
    color: '#0F0F10',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '13px',
    whiteSpace: 'nowrap'
  },

  estadoVacio: { 
    display: 'flex', 
    justifyContent: 'center',
    padding: '60px 0',
    color: '#8E8E93'
  },
  spinner: { 
    width: '32px', 
    height: '32px', 
    border: '3px solid rgba(57, 255, 20, 0.2)', 
    borderTop: '3px solid #39FF14', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite'
  }
};

export default BuscadorClubesScreen;