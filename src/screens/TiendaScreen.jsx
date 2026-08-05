// src/screens/TiendaScreen.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { styles } from './TiendaScreen.styles';

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

;

export default TiendaScreen;