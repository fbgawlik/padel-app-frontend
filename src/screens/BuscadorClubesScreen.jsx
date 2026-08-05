// src/screens/BuscadorClubesScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './BuscadorClubesScreen.styles';

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
      
      <div style={styles.headerContenedor}>
        <h1 style={styles.tituloGrande}>Explorar</h1>
        <p style={styles.subtitulo}>Encuentra tu próximo club para jugar.</p>
        
        <div style={styles.buscadorGlass}>
          <span style={styles.iconoBuscar}>🔍</span>
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
      
      <div style={styles.grillaClubes}>
        {loading ? (
          <div style={styles.estadoVacioSpinner}>
            <div style={styles.spinner}></div>
          </div>
        ) : complejosFiltrados.length === 0 ? (
          <div style={styles.estadoVacio}>
            <p style={styles.textoVacio}>No encontramos clubes con esa búsqueda 😔</p>
          </div>
        ) : (
          complejosFiltrados.map((club) => {
            const urlFoto = resolverUrlImagen(club.imagenUrl);

            return (
              <div key={club.id} style={styles.tarjetaClubNativa} onClick={() => navigate(`/reservar/${club.id}`)}>
                
                <div style={styles.imagenClubContenedor}>
                  {urlFoto ? (
                    <img src={urlFoto} alt={club.nombre} style={styles.imagenImagen} />
                  ) : (
                    <div style={styles.imagenPlaceholder}>🏟️</div>
                  )}
                  
                  <div style={styles.badgeFlotante}>
                    {club.canchas?.length || 0} Canchas
                  </div>
                </div>

                <div style={styles.infoContenedor}>
                  <div style={styles.textoAgrupado}>
                    <h4 style={styles.nombreClub}>{club.nombre}</h4>
                    <p style={styles.direccionClub}>📍 {club.direccion || 'Sin dirección registrada'}</p>
                  </div>
                  
                  <div style={styles.badgeAccion}>
                    <span style={styles.textoBadgeAccion}>Ver Club</span>
                    <span style={styles.flechaBadge}>→</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

;

export default BuscadorClubesScreen;