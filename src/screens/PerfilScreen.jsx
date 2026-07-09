// src/screens/PerfilScreen.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const PerfilScreen = () => {
  const { usuario, actualizarDatosUsuario, logout } = useContext(AuthContext); 
  const navigate = useNavigate();
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados para imágenes (Perfil)
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Estados para todos los campos del Schema.prisma
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    telefono: usuario?.telefono || '',
    categoriaPadel: usuario?.categoriaPadel || '',
    ladoJuego: usuario?.ladoJuego || '',
    bio: usuario?.bio || '',
    email: usuario?.email || '', // Informativo
    puntosGenerales: usuario?.puntosGenerales || 0 // Informativo
  });

  useEffect(() => {
    const cargarPerfilCompleto = async () => {
      try {
        const res = await API.get('/auth/perfil');
        setFormData({
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          telefono: res.data.telefono || '',
          categoriaPadel: res.data.categoriaPadel || '',
          ladoJuego: res.data.ladoJuego || '',
          bio: res.data.bio || '',
          email: res.data.email || '',
          puntosGenerales: res.data.puntosGenerales || 0
        });
      } catch (err) {
        console.error("Error al traer perfil completo:", err);
      }
    };
    cargarPerfilCompleto();
  }, []);

  //  CÓMO DEBE QUEDAR EN TU PERFILSCREEN:
const resolverUrlImagen = (ruta) => {
  if (!ruta) return null;
  
  // 🔥 Si la ruta viene con localhost harcodeado desde la DB o el estado viejo, lo limpiamos
  if (ruta.includes('localhost:5000')) {
    const rutaRelativa = ruta.replace('http://localhost:5000', ''); // Nos quedamos solo con /uploads/...
    return `${import.meta.env.VITE_API_URL}${rutaRelativa}`;
  }
  
  if (ruta.startsWith('http')) return ruta; // Cloudinary seguro (https)
  
  return `${import.meta.env.VITE_API_URL}${ruta}`; 
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setMensajeExito('');

    try {
      const data = new FormData();
      data.append('nombre', formData.nombre);
      data.append('apellido', formData.apellido);
      data.append('telefono', formData.telefono);
      data.append('categoriaPadel', formData.categoriaPadel);
      data.append('ladoJuego', formData.ladoJuego);
      data.append('bio', formData.bio);

      if (imagenArchivo) {
        data.append('imagen', imagenArchivo);
      }

      const res = await API.put('/auth/perfil', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (actualizarDatosUsuario) {
        actualizarDatosUsuario(res.data.usuario);
      }

      setMensajeExito('¡Perfil actualizado con éxito!');
      setTimeout(() => setMensajeExito(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el perfil.');
    } finally {
      setCargando(false);
    }
  };

  const obtenerIniciales = () => {
    const n = formData.nombre?.charAt(0) || '';
    const a = formData.apellido?.charAt(0) || '';
    return (n + a).toUpperCase() || 'P';
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.tarjeta}>
        
        {/* BANNER DE PORTADA (imagenPortada del Schema) */}
        <div style={styles.bannerPortada}>
          {usuario?.imagenPortada ? (
            <img src={resolverUrlImagen(usuario.imagenPortada)} alt="Portada" style={styles.imagenPortadaImg} />
          ) : (
            <div style={styles.bannerVacio}></div>
          )}
          {/* BADGE DE PUNTOS GENERALES */}
          <div style={styles.badgePuntos}>
            <span style={styles.puntosNumero}>{formData.puntosGenerales}</span>
            <span style={styles.puntosLabel}>PTS</span>
          </div>
        </div>

        {/* CONTENEDOR AVATAR FLOTANTE */}
        <div style={styles.avatarSeccion}>
          <div style={styles.avatarContenedor} onClick={() => fileInputRef.current.click()}>
            {imagenPreview ? (
              <img src={imagenPreview} alt="Preview" style={styles.imagenImagen} />
            ) : usuario?.imagenPerfil ? (
              <img src={resolverUrlImagen(usuario.imagenPerfil)} alt="Perfil" style={styles.imagenImagen} />
            ) : (
              <div style={styles.avatarLetra}>{obtenerIniciales()}</div>
            )}
            <div style={styles.avatarOverlay}>CAMBIAR</div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <h2 style={styles.titulo}>Mi Perfil de Juego</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {mensajeExito && <div style={styles.exito}>{mensajeExito}</div>}

        {/* CAMPOS DEL FORMULARIO */}
        <div style={styles.gridForm}>
          <div style={styles.grupo}>
            <label style={styles.label}>Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Apellido</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Email (No editable)</label>
            <input type="email" value={formData.email} style={{...styles.input, ...styles.inputDisabled}} disabled />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Categoría de Pádel</label>
            <select name="categoriaPadel" value={formData.categoriaPadel} onChange={handleChange} style={styles.select}>
              <option value="">Selecciona tu categoría</option>
              <option value="1ra">1ra Categoría</option>
              <option value="2da">2da Categoría</option>
              <option value="3ra">3ra Categoría</option>
              <option value="4ta">4ta Categoría</option>
              <option value="5ta">5ta Categoría</option>
              <option value="6ta">6ta Categoría</option>
              <option value="7ma">7ma Categoría</option>
              <option value="Suma">Suma</option>
            </select>
          </div>

          <div style={styles.grupo}>
            <label style={styles.label}>Lado de Juego (Posición)</label>
            <select name="ladoJuego" value={formData.ladoJuego} onChange={handleChange} style={styles.select}>
              <option value="">Selecciona tu lado</option>
              <option value="Drive">Drive (Derecha)</option>
              <option value="Revés">Revés (Izquierda)</option>
              <option value="Ambos">Ambos lados</option>
            </select>
          </div>
        </div>

        <div style={styles.grupoCompleto}>
          <label style={styles.label}>Biografía / Sobre mí</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            placeholder="Contale a la comunidad tu estilo de juego, tus días disponibles o lo que quieras..." 
            style={styles.textarea}
          />
        </div>

        <div style={styles.contenedorBotones}>
          <button type="submit" disabled={cargando} style={styles.botonGuardar}>
            {cargando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button type="button" onClick={logout} style={styles.botonLogout}>
            Cerrar Sesión
          </button>
        </div>

      </form>
    </div>
  );
};

// ESTILOS MODERNOS (DARK MODE & NEON GREEN DETAILS)
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0C0C0E', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif' },
  tarjeta: { width: '100%', maxWidth: '700px', backgroundColor: '#141416', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' },
  bannerPortada: { width: '100%', height: '160px', backgroundColor: '#1F1F23', position: 'relative', overflow: 'hidden' },
  imagenPortadaImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bannerVacio: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #1f1f23 0%, #2c2c35 100%)' },
  badgePuntos: { position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(57, 255, 20, 0.15)', border: '1px solid #39FF14', padding: '6px 14px', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 12px rgba(57, 255, 20, 0.2)' },
  puntosNumero: { color: '#39FF14', fontSize: '16px', fontWeight: '800', lineHeight: '1' },
  puntosLabel: { color: '#FFF', fontSize: '9px', fontWeight: '700', marginTop: '2px', letterSpacing: '0.5px' },
  avatarSeccion: { display: 'flex', justifyContent: 'center', marginTop: '-60px', marginBottom: '15px', position: 'relative', zIndex: '2' },
  avatarContenedor: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#1C1C1E', border: '4px solid #141416', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
  avatarLetra: { fontSize: '40px', color: '#8E8E93', fontWeight: '700' },
  imagenImagen: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(18, 18, 20, 0.8)', color: '#fff', fontSize: '10px', fontWeight: '700', textAlign: 'center', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.1)' },
  titulo: { color: '#FFF', fontSize: '24px', fontWeight: '800', textAlign: 'center', margin: '10px 0 25px 0', letterSpacing: '-0.5px' },
  gridForm: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', padding: '0 30px' },
  grupo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  grupoCompleto: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px 30px' },
  label: { color: '#A0A0A5', fontSize: '13px', fontWeight: '600', letterSpacing: '0.3px' },
  input: { backgroundColor: '#1A1A1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
  inputDisabled: { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#121214' },
  select: { backgroundColor: '#1A1A1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none', cursor: 'pointer' },
  textarea: { backgroundColor: '#1A1A1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none', minHeight: '90px', resize: 'vertical', fontFamily: 'inherit' },
  contenedorBotones: { padding: '20px 30px 40px 30px', display: 'flex', flexDirection: 'column', gap: '12px' },
  botonGuardar: { backgroundColor: '#39FF14', color: '#000', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(57, 255, 20, 0.3)', transition: 'transform 0.2s' },
  botonLogout: { backgroundColor: 'transparent', color: '#FF453A', border: '1px solid rgba(255, 69, 58, 0.2)', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  error: { margin: '0 30px 20px 30px', padding: '12px', backgroundColor: 'rgba(255,69,58,0.1)', border: '1px solid #FF453A', color: '#FF453A', borderRadius: '10px', fontSize: '13px', textAlign: 'center' },
  exito: { margin: '0 30px 20px 30px', padding: '12px', backgroundColor: 'rgba(57,255,20,0.1)', border: '1px solid #39FF14', color: '#39FF14', borderRadius: '10px', fontSize: '13px', textAlign: 'center' }
};

export default PerfilScreen;