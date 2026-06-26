// src/screens/BuscadorClubesScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

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
      <div style={styles.headerClub}>
        <h1 style={styles.tituloClub}>Reserva de Turnos</h1>
        <p style={styles.infoClub}>Buscá tu complejo deportivo para conocer la disponibilidad de canchas.</p>
      </div>

      {/* BUSCADOR PREMIUM */}
      <div style={styles.contenedorBuscador}>
        <span style={styles.iconoLupa}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="Escribí el nombre o dirección del club..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          style={styles.inputBuscador}
        />
      </div>

      {/* HEADER DE RESULTADOS */}
      <div style={styles.resultadosHeader}>
        <h3 style={styles.subtitulo}>Complejos Encontrados</h3>
        {!loading && <span style={styles.badgeResultados}>{complejosFiltrados.length}</span>}
      </div>
      
      {/* GRILLA DE CLUBES */}
      <div style={styles.grillaBusquedaComplejos}>
        {loading ? (
          <div style={styles.estadoVacio}>
            <div style={styles.spinner}></div>
            <p>Buscando complejos...</p>
          </div>
        ) : complejosFiltrados.length === 0 ? (
          <div style={styles.estadoVacio}>
            <p>No se encontraron complejos con esa búsqueda.</p>
          </div>
        ) : (
          complejosFiltrados.map((club) => (
            <div key={club.id} style={styles.tarjetaClubBusqueda} onClick={() => navigate(`/reservar/${club.id}`)}>
              <div style={styles.avatarClub}>
                🏢
              </div>
              <div style={styles.infoClubContainer}>
                <h4 style={styles.nombreClub}>{club.nombre}</h4>
                <p style={styles.direccionClub}>📍 {club.direccion}</p>
              </div>
              <button style={styles.botonSeleccionarClub}>
                Reservar
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '6px', transition: 'transform 0.2s'}} className="flecha-btn">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  contenedor: { 
    width: '100%', 
    boxSizing: 'border-box'
  },
  headerClub: { 
    borderBottom: '1px solid rgba(255,255,255,0.05)', 
    paddingBottom: '24px', 
    marginBottom: '32px' 
  },
  tituloClub: { 
    fontSize: '32px', 
    margin: '0 0 8px 0', 
    fontWeight: '800', 
    color: '#fff', 
    letterSpacing: '-0.5px' 
  },
  infoClub: { 
    color: '#8A8A8A', 
    margin: 0, 
    fontSize: '15px', 
    fontWeight: '400' 
  },
  
  contenedorBuscador: { 
    display: 'flex', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    border: '1px solid rgba(255,255,255,0.06)', 
    borderRadius: '14px', 
    padding: '14px 20px', 
    marginBottom: '40px', 
    maxWidth: '600px',
    transition: 'border-color 0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  iconoLupa: { 
    marginRight: '14px', 
    color: '#666',
    display: 'flex',
    alignItems: 'center'
  },
  inputBuscador: { 
    backgroundColor: 'transparent', 
    border: 'none', 
    color: '#fff', 
    fontSize: '16px', 
    outline: 'none', 
    width: '100%',
    fontWeight: '500'
  },
  inputBuscadorPlaceholder: {
    color: '#555'
  },
  
  resultadosHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  subtitulo: { 
    fontSize: '18px', 
    color: '#fff', 
    fontWeight: '700',
    margin: 0
  },
  badgeResultados: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#EAEAEA',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },

  grillaBusquedaComplejos: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px', 
    maxWidth: '800px' 
  },
  tarjetaClubBusqueda: { 
    display: 'flex', 
    alignItems: 'center', 
    backgroundColor: '#121212', 
    border: '1px solid rgba(255,255,255,0.03)', 
    borderRadius: '16px', 
    padding: '20px', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease', 
    gap: '20px' 
  },
  avatarClub: { 
    fontSize: '24px', 
    backgroundColor: '#1A1A1A', 
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.02)'
  },
  infoClubContainer: { 
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  nombreClub: { 
    margin: 0, 
    color: '#fff', 
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  direccionClub: { 
    margin: 0, 
    color: '#8A8A8A', 
    fontSize: '14px' 
  },
  botonSeleccionarClub: { 
    backgroundColor: 'rgba(0, 255, 102, 0.08)', 
    border: 'none', 
    color: '#00ff66', 
    fontWeight: '700', 
    fontSize: '14px', 
    cursor: 'pointer',
    padding: '10px 18px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  
  estadoVacio: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '60px 20px', 
    color: '#666', 
    backgroundColor: '#121212', 
    borderRadius: '16px', 
    border: '1px dashed rgba(255,255,255,0.1)',
    maxWidth: '800px'
  },
  spinner: { 
    width: '24px', 
    height: '24px', 
    border: '3px solid rgba(0,255,102,0.2)', 
    borderTop: '3px solid #00ff66', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite', 
    marginBottom: '16px' 
  }
};

export default BuscadorClubesScreen;