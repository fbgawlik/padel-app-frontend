// src/screens/TiendaScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

const TiendaScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotification();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complejo, setComplejo] = useState(null);

  useEffect(() => {
    const cargarComplejoYProductos = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get(`/complejos/${id}`);
        setComplejo(res.data);
      } catch (err) {
        console.error("Error al cargar la tienda:", err);
        setError("Ocurrió un error al cargar la información de la tienda.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      cargarComplejoYProductos();
    } else {
      setError("No se especificó un complejo válido.");
      setLoading(false);
    }
  }, [id]);

  const gestionarCompraProducto = async (producto) => {
    if (producto.stock <= 0) {
      mostrarNotificacion("Producto agotado.", 'error');
      return;
    }
    const accion = producto.esAlquiler ? 'alquilar' : 'comprar';
    if (!window.confirm(`¿Confirmar ${accion} de "${producto.nombre}"?`)) return;

    try {
      await API.post(`/productos/${id}/ventas`, { cantidad: 2 });
      setComplejo(prev => ({
        ...prev,
        productos: prev.productos.map(p => 
          p.id === producto.id ? { ...p, stock: p.stock - 1 } : p
        )
      }));
      
      mostrarNotificacion("¡Operación exitosa!", 'success');
    } catch (error) {
      console.error("Error al procesar la transacción:", error);
      mostrarNotificacion("Error al procesar la operación.", 'error');
    }
  };

  if (loading) return (
    <div style={styles.estadoVacio}>
      <div style={styles.spinner}></div>
      <p>Abriendo la tienda...</p>
    </div>
  );

  if (error) return (
    <div style={styles.estadoVacio}>
      <p style={{ color: '#ff4d4d' }}>{error}</p>
    </div>
  );

  if (!complejo) return (
    <div style={styles.estadoVacio}>
      <p>Complejo no encontrado.</p>
    </div>
  );

  return (
    <div style={styles.contenedor}>
      <button onClick={() => navigate(-1)} style={styles.botonVolver}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver
      </button>

      <div style={styles.headerClub}>
        <h1 style={styles.tituloClub}>Cantina y Tienda</h1>
        <p style={styles.infoClub}>
          <strong style={{color: '#fff'}}>{complejo.nombre}</strong> | Encontrá todo lo que necesitás para tu partido.
        </p>
      </div>

      {(!complejo.productos || complejo.productos.length === 0) ? (
        <div style={styles.estadoVacio}>
          <span style={{ fontSize: '40px', marginBottom: '16px' }}>🛍️</span>
          <p>Este complejo aún no tiene productos registrados en su tienda.</p>
        </div>
      ) : (
        <div style={styles.grillaProductos}>
          {complejo.productos.map(p => {
            const agotado = p.stock <= 0;
            return (
              <div key={p.id} style={{
                ...styles.tarjetaProducto,
                opacity: agotado ? 0.7 : 1 // Las tarjetas agotadas se ven un poco apagadas
              }}>
                {/* Etiqueta superior */}
                <div style={styles.headerTarjetaProducto}>
                  <span style={{
                    ...styles.badgeTipo,
                    backgroundColor: p.esAlquiler ? 'rgba(0, 204, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: p.esAlquiler ? '#00ccff' : '#aaa'
                  }}>
                    {p.esAlquiler ? '🔄 ALQUILER' : '🛒 VENTA'}
                  </span>
                </div>

                {/* Espacio para la imagen */}
                <div style={styles.imagenPlaceholder}>
                  {p.esAlquiler ? '🎾' : '🥤'}
                </div>
                
                <div style={styles.infoProductoContainer}>
                  <h3 style={styles.nombreProducto}>{p.nombre}</h3>
                  <div style={styles.precioProducto}>${p.precio}</div>
                  
                  <div style={styles.stockContenedor}>
                    <span style={{
                      ...styles.badgeStock,
                      backgroundColor: agotado ? 'rgba(255, 51, 51, 0.1)' : 'rgba(0, 255, 102, 0.1)',
                      color: agotado ? '#ff4d4d' : '#00ff66',
                    }}>
                      {agotado ? 'Agotado' : `${p.stock} en stock`}
                    </span>
                  </div>
                </div>

                <button 
                  disabled={agotado}
                  onClick={() => gestionarCompraProducto(p)}
                  style={{
                    ...styles.botonAccion,
                    backgroundColor: agotado ? '#1A1A1A' : 'rgba(0, 255, 102, 0.1)',
                    color: agotado ? '#555' : '#00ff66',
                    cursor: agotado ? 'not-allowed' : 'pointer',
                    border: agotado ? '1px solid transparent' : '1px solid rgba(0, 255, 102, 0.3)'
                  }}
                >
                  {agotado ? 'Sin stock' : (p.esAlquiler ? 'Alquilar ahora' : 'Comprar ahora')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  contenedor: { width: '100%', boxSizing: 'border-box' },
  botonVolver: { 
    display: 'flex', alignItems: 'center', backgroundColor: 'transparent', 
    color: '#8A8A8A', border: 'none', cursor: 'pointer', marginBottom: '24px', 
    fontSize: '14px', fontWeight: '600', padding: 0, transition: 'color 0.2s' 
  },
  headerClub: { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px' },
  tituloClub: { fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' },
  infoClub: { color: '#8A8A8A', fontSize: '15px', margin: 0 },
  
  grillaProductos: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  
  tarjetaProducto: { 
    backgroundColor: '#121212', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', 
    display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s'
  },
  headerTarjetaProducto: { padding: '16px 16px 0 16px', display: 'flex', justifyContent: 'flex-end' },
  badgeTipo: { fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.5px' },
  
  imagenPlaceholder: { 
    height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    fontSize: '48px', opacity: 0.8
  },
  
  infoProductoContainer: { padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 },
  nombreProducto: { color: '#fff', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '-0.3px' },
  precioProducto: { color: '#EAEAEA', fontSize: '20px', fontWeight: '800', marginBottom: '16px' },
  
  stockContenedor: { marginTop: 'auto', marginBottom: '20px' },
  badgeStock: { fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  
  botonAccion: { 
    width: '100%', padding: '16px', border: 'none', fontWeight: '700', fontSize: '14px', 
    transition: 'all 0.2s', marginTop: 'auto' 
  },
  
  estadoVacio: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
    padding: '80px 20px', color: '#8A8A8A', fontSize: '16px', backgroundColor: '#121212',
    borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)'
  },
  spinner: { 
    width: '30px', height: '30px', border: '3px solid rgba(0,255,102,0.2)', 
    borderTop: '3px solid #00ff66', borderRadius: '50%', animation: 'spin 1s linear infinite', 
    marginBottom: '16px' 
  }
};

export default TiendaScreen;