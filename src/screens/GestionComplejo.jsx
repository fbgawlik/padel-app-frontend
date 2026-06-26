// src/screens/GestionComplejo.jsx
import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GestionComplejo = () => {
  const { usuario } = useContext(AuthContext);
  const [complejo, setComplejo] = useState(null); 
  const [canchas, setCanchas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [necesitaCrear, setNecesitaCrear] = useState(false);
  const [formNuevoComplejo, setFormNuevoComplejo] = useState({ nombre: '', direccion: '', telefono: '' });
  const [archivoImagen, setArchivoImagen] = useState(null); 
  const [archivoImagenEdit, setArchivoImagenEdit] = useState(null); // 🔥 NUEVO ESTADO PARA LA FOTO EN EDICIÓN

  const [formComplejo, setFormComplejo] = useState({ nombre: '', direccion: '', telefono: '' });
 const [formCancha, setFormCancha] = useState({ nombre: '', tipoPiso: 'Césped Sintético', tipoPared: 'Blindex', techada: true });
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', stock: '0', esAlquiler: false });

  const cargarProductosTienda = async (clubId) => {
    try {
      const res = await API.get(`/productos?complejoId=${clubId}`);
      setProductos(res.data);
    } catch (err) {
      console.error("Error al traer productos:", err);
    }
  };

  useEffect(() => {
    const cargarDatosClub = async () => {
      if (!usuario?.id) return;
      
      try {
        setLoading(true);
        const res = await API.get('/complejos'); 
        const miClub = res.data.find(c => c.administradorId === usuario.id);
        
        if (miClub) {
          setComplejo(miClub);
          setFormComplejo({ nombre: miClub.nombre, direccion: miClub.direccion, telefono: miClub.telefono || '' });
          
          const resCanchas = await API.get('/canchas');
          const filtradas = resCanchas.data.filter(c => c.complejoId === miClub.id);
          setCanchas(filtradas);

          await cargarProductosTienda(miClub.id);
        } else {
          setNecesitaCrear(true);
        }
      } catch (err) {
        setError('No se pudieron cargar los datos del sistema.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatosClub();
  }, [usuario]);

  const gestionarCrearMiComplejo = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', formNuevoComplejo.nombre);
      formData.append('direccion', formNuevoComplejo.direccion);
      formData.append('telefono', formNuevoComplejo.telefono);
      if (archivoImagen) {
        formData.append('imagen', archivoImagen);
      }

      const res = await API.post('/complejos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("¡Complejo registrado con éxito!");
      setComplejo(res.data.complejo);
      setFormComplejo({ nombre: res.data.complejo.nombre, direccion: res.data.complejo.direccion, telefono: res.data.complejo.telefono || '' });
      setNecesitaCrear(false); 
    } catch (err) {
      alert(err.response?.data?.error || "Error al crear el complejo.");
    }
  };

  // 🔥 NUEVA FUNCIÓN PARA ENVIAR ACTUALIZACIONES DE TU COMPLEJO
  const gestionarActualizarComplejo = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nombre', formComplejo.nombre);
      formData.append('direccion', formComplejo.direccion);
      formData.append('telefono', formComplejo.telefono);
      if (archivoImagenEdit) {
        formData.append('imagen', archivoImagenEdit);
      }

      const res = await API.put('/complejos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("¡Datos del complejo actualizados!");
      setComplejo(res.data.complejo);
      setArchivoImagenEdit(null); // Reseteamos el campo file de edición
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar los datos.");
    }
  };

  const gestionarCrearCancha = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/canchas', formCancha);
      alert(res.data.message || "Cancha añadida.");
      setCanchas([...canchas, res.data.cancha]);
      setFormCancha({ nombre: '', tipoPiso: 'Césped Sintético', tipoPared: 'Blindex', techada: true });
    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar cancha.");
    }
  };

  const gestionarCrearProducto = async (e) => {
    e.preventDefault();
    if (!formProducto.nombre || !formProducto.precio) return alert("Ingresá nombre y precio.");

    try {
      const res = await API.post('/productos', formProducto);
      setProductos([...productos, res.data.producto]);
      setFormProducto({ nombre: '', precio: '', stock: '0', esAlquiler: false });
    } catch (err) {
      alert(err.response?.data?.error || "Error registrando producto.");
    }
  };

  const gestionarEliminarProducto = async (productoId) => {
    if (!window.confirm("¿Seguro que querés eliminar esto?")) return;
    try {
      await API.delete(`/productos/${productoId}`);
      setProductos(productos.filter(p => p.id !== productoId));
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar producto.");
    }
  };

  if (loading) return <div style={styles.mensaje}>Cargando panel de control...</div>;

  if (necesitaCrear) {
    return (
      <div style={styles.contenedor}>
        <div style={styles.tarjetaAdmin}>
          <h2 style={{ color: '#00ff66', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>¡Bienvenido a tu Panel!</h2>
          <p style={{ color: '#8A8A8A', marginBottom: '24px', fontSize: '15px' }}>Para comenzar a usar la plataforma, primero debés registrar los datos principales de tu club.</p>
          <form onSubmit={gestionarCrearMiComplejo} style={styles.formulario}>
            <input 
              type="text" placeholder="Nombre Comercial de tu Complejo" required 
              value={formNuevoComplejo.nombre} onChange={(e) => setFormNuevoComplejo({...formNuevoComplejo, nombre: e.target.value})} 
              style={styles.input} 
            />
            <input 
              type="text" placeholder="Dirección Física (Ej: Av. San Martín 1500)" required 
              value={formNuevoComplejo.direccion} onChange={(e) => setFormNuevoComplejo({...formNuevoComplejo, direccion: e.target.value})} 
              style={styles.input} 
            />
            <input 
              type="text" placeholder="Teléfono de Contacto" 
              value={formNuevoComplejo.telefono} onChange={(e) => setFormNuevoComplejo({...formNuevoComplejo, telefono: e.target.value})} 
              style={styles.input} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#8A8A8A', fontSize: '13px' }}>Subir Logo o Foto de Portada (Opcional)</label>
              <input 
                type="file" accept="image/*" 
                onChange={(e) => setArchivoImagen(e.target.files[0])} 
                style={styles.input} 
              />
            </div>
            <button type="submit" style={styles.botonVerde}>Crear mi Complejo</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.contenedor}>
      <div style={styles.headerClub}>
        <h1 style={styles.tituloClub}>Gestión de mi Complejo</h1>
        <p style={styles.infoClub}>Administrá las canchas, los datos de contacto y el stock de tu cantina.</p>
      </div>

      {error && <div style={styles.alerta}>{error}</div>}

      <div style={styles.grillaLayout}>
        <div style={styles.columnaFlex}>
          {/* 🔥 SECCIÓN TOTALMENTE INTERACTIVA AHORA */}
          <div style={styles.tarjetaAdmin}>
            <h3 style={styles.tituloSeccion}>🏢 Información General</h3>
            <form onSubmit={gestionarActualizarComplejo} style={styles.formulario}>
              <input 
                type="text" placeholder="Nombre de tu Complejo" required
                value={formComplejo.nombre} 
                onChange={(e) => setFormComplejo({ ...formComplejo, nombre: e.target.value })} 
                style={styles.input} 
              />
              <input 
                type="text" placeholder="Dirección del Complejo" required
                value={formComplejo.direccion} 
                onChange={(e) => setFormComplejo({ ...formComplejo, direccion: e.target.value })} 
                style={styles.input} 
              />
              <input 
                type="text" placeholder="Teléfono de Contacto" required
                value={formComplejo.telefono} 
                onChange={(e) => setFormComplejo({ ...formComplejo, telefono: e.target.value })} 
                style={styles.input} 
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#8A8A8A', fontSize: '13px' }}>Cambiar Foto de Portada / Logo</label>
                <input 
                  type="file" accept="image/*" 
                  onChange={(e) => setArchivoImagenEdit(e.target.files[0])} 
                  style={styles.input} 
                />
              </div>

              <button type="submit" style={styles.botonVerde}>Guardar Cambios</button>
            </form>
          </div>

          <div style={styles.tarjetaAdmin}>
            <h3 style={styles.tituloSeccion}>🎾 Agregar Nueva Cancha</h3>
           <form onSubmit={gestionarCrearCancha} style={styles.formulario}>
              <input 
                type="text" placeholder="Ej: Cancha 1" value={formCancha.nombre}
                onChange={(e) => setFormCancha({ ...formCancha, nombre: e.target.value })} style={styles.input} required
              />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <select 
                  value={formCancha.tipoPiso} onChange={(e) => setFormCancha({ ...formCancha, tipoPiso: e.target.value })} style={{ ...styles.input, flex: 1 }}
                >
                  <option value="Césped Sintético">Césped Sintético</option>
                  <option value="Cemento / Quick">Cemento / Quick</option>
                  <option value="Parquet">Parquet</option>
                </select>

                <select 
                  value={formCancha.tipoPared} onChange={(e) => setFormCancha({ ...formCancha, tipoPared: e.target.value })} style={{ ...styles.input, flex: 1 }}
                >
                  <option value="Blindex">Blindex</option>
                  <option value="Muro">Muro (Cemento)</option>
                  <option value="Panorámica">Panorámica</option>
                </select>
              </div>

              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" checked={formCancha.techada} 
                  onChange={(e) => setFormCancha({ ...formCancha, techada: e.target.checked })}
                  style={{ accentColor: '#00ff66', width: '16px', height: '16px' }}
                />
                ¿La cancha es techada / cubierta?
              </label>
              <button type="submit" style={styles.botonVerde}>Dar de Alta Cancha</button>
            </form>
          </div>

          <div style={styles.tarjetaAdmin}>
            <h3 style={styles.tituloSeccion}>Listado de Canchas ({canchas.length})</h3>
            <div style={styles.listaElementos}>
              {canchas.map(c => (
                <div key={c.id} style={styles.itemFila}>
                  <div>
                    <strong style={{ color: '#EAEAEA', fontSize: '15px' }}>{c.nombre}</strong>
                    <div style={{ fontSize: '13px', color: '#8A8A8A', marginTop: '4px' }}>
                      {c.tipoPiso} — {c.tipoPared} — {c.techada ? '🧱 Cubierta' : '☀️ Descubierta'}
                    </div>
                  </div>
                  <span style={{ color: '#00ff66', fontSize: '14px', backgroundColor: 'rgba(0, 255, 102, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>ACTIVA</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.columnaFlex}>
          <div style={styles.tarjetaAdmin}>
            <h3 style={styles.tituloSeccion}>🍺 Alta de Productos / Alquileres</h3>
            <form onSubmit={gestionarCrearProducto} style={styles.formulario}>
              <input 
                type="text" placeholder="Ej: Coca Cola 500ml o Alquiler de Pala" value={formProducto.nombre}
                onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })} style={styles.input} required
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="number" placeholder="Precio ($)" value={formProducto.precio}
                  onChange={(e) => setFormProducto({ ...formProducto, precio: e.target.value })} style={{ ...styles.input, flex: 1 }} required min="0" step="0.01"
                />
                <input 
                  type="number" placeholder="Stock inicial" value={formProducto.stock}
                  onChange={(e) => setFormProducto({ ...formProducto, stock: e.target.value })} style={{ ...styles.input, flex: 1 }} min="0"
                />
              </div>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" checked={formProducto.esAlquiler} 
                  onChange={(e) => setFormProducto({ ...formProducto, esAlquiler: e.target.checked })}
                  style={{ accentColor: '#00ccff', width: '16px', height: '16px' }}
                />
                ¿Es un artículo para alquilar?
              </label>
              <button type="submit" style={{ ...styles.botonVerde, backgroundColor: '#00ccff', color: '#000' }}>Registrar en Tienda</button>
            </form>
          </div>

          <div style={styles.tarjetaAdmin}>
            <h3 style={styles.tituloSeccion}>📦 Inventario de la Cantina ({productos.length})</h3>
            <div style={styles.listaElementos}>
              {productos.length === 0 ? (
                <p style={{ color: '#8A8A8A', fontSize: '14px', margin: 0, fontStyle: 'italic' }}>No hay productos dados de alta.</p>
              ) : (
                productos.map(p => (
                  <div key={p.id} style={styles.itemFila}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ color: '#EAEAEA', fontSize: '15px' }}>{p.nombre}</strong>
                        <span style={{ 
                          ...styles.badgeTipo, 
                          backgroundColor: p.esAlquiler ? 'rgba(0, 204, 255, 0.1)' : 'rgba(0, 255, 102, 0.1)', 
                          color: p.esAlquiler ? '#00ccff' : '#00ff66',
                          border: p.esAlquiler ? '1px solid rgba(0, 204, 255, 0.2)' : '1px solid rgba(0, 255, 102, 0.2)'
                        }}>
                          {p.esAlquiler ? 'Alquiler' : 'Venta'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#8A8A8A', marginTop: '6px' }}>
                        Precio: <strong style={{ color: '#EAEAEA' }}>${p.precio}</strong> | Stock: <strong style={{ color: p.stock <= 3 ? '#ff6666' : '#EAEAEA' }}>{p.stock} u.</strong>
                      </div>
                    </div>
                    <button onClick={() => gestionarEliminarProducto(p.id)} style={styles.botonEliminar}>🗑️</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  contenedor: { width: '100%', color: '#EAEAEA', boxSizing: 'border-box' }, 
  headerClub: { borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '24px', marginBottom: '32px' },
  tituloClub: { fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' },
  infoClub: { color: '#8A8A8A', margin: 0, fontSize: '15px', fontWeight: '400' },
  grillaLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' },
  columnaFlex: { display: 'flex', flexDirection: 'column', gap: '24px' },
  tarjetaAdmin: { backgroundColor: '#121212', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  tituloSeccion: { fontSize: '13px', color: '#8A8A8A', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0, fontWeight: '600' },
  formulario: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { backgroundColor: '#1E1E1E', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '14px', color: '#ffffff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', color: '#8A8A8A', fontSize: '14px', cursor: 'pointer', marginTop: '4px' },
  botonVerde: { backgroundColor: '#00ff66', color: '#000000', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.5px' },
  listaElementos: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' },
  itemFila: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s' },
  badgeTipo: { fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  botonEliminar: { backgroundColor: 'rgba(255, 51, 51, 0.1)', border: '1px solid rgba(255, 51, 51, 0.15)', cursor: 'pointer', fontSize: '14px', padding: '8px 12px', borderRadius: '6px', transition: 'all 0.2s ease' },
  alerta: { backgroundColor: 'rgba(255, 51, 51, 0.1)', border: '1px solid rgba(255, 51, 51, 0.2)', color: '#ff6666', padding: '16px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', fontWeight: '500' },
  mensaje: { color: '#8A8A8A', textAlign: 'center', marginTop: '100px', fontSize: '16px', fontWeight: '500', flex: 1 }
};

export default GestionComplejo;