// src/screens/PerfilScreen.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { resolverUrlImagen } from '../services/imageHelper';

const PerfilScreen = () => {
  const { usuario, actualizarDatosUsuario, logout } = useContext(AuthContext); 
  const navigate = useNavigate();
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados para imagen de Perfil
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Estados para imagen de Portada
  const [portadaArchivo, setPortadaArchivo] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const portadaInputRef = useRef(null);

  // AGREGAMOS LAS IMÁGENES AL ESTADO INICIAL
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    telefono: usuario?.telefono || '',
    categoriaPadel: usuario?.categoriaPadel || '',
    ladoJuego: usuario?.ladoJuego || '',
    bio: usuario?.bio || '',
    email: usuario?.email || '', 
    puntosGenerales: usuario?.puntosGenerales || 0,
    imagenPerfil: usuario?.imagenPerfil || '', 
    imagenPortada: usuario?.imagenPortada || '' 
  });

  useEffect(() => {
    const cargarPerfilCompleto = async () => {
      try {
        const res = await API.get('/usuarios/perfil');
        setFormData({
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          telefono: res.data.telefono || '',
          categoriaPadel: res.data.categoriaPadel || '',
          ladoJuego: res.data.ladoJuego || '',
          bio: res.data.bio || '',
          email: res.data.email || '',
          puntosGenerales: res.data.puntosGenerales || 0,
          // GUARDAMOS LAS IMÁGENES FRESCAS QUE VIENEN DEL SERVER
          imagenPerfil: res.data.imagenPerfil || '', 
          imagenPortada: res.data.imagenPortada || ''
        });
      } catch (err) {
        console.error("Error al traer perfil completo:", err);
      }
    };
    cargarPerfilCompleto();
  }, []);


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

  const handlePortadaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortadaArchivo(file);
      setPortadaPreview(URL.createObjectURL(file));
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
        data.append('imagenPerfil', imagenArchivo);
      }
      if (portadaArchivo) {
        data.append('imagenPortada', portadaArchivo);
      }

      const res = await API.put('/usuarios/perfil', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (actualizarDatosUsuario) {
        actualizarDatosUsuario(res.data.usuario);
      }

      // ACTUALIZAMOS EL ESTADO CON LAS NUEVAS RUTAS Y LIMPIAMOS LOS ARCHIVOS TEMPORALES
      setFormData(prev => ({
        ...prev,
        imagenPerfil: res.data.usuario.imagenPerfil || prev.imagenPerfil,
        imagenPortada: res.data.usuario.imagenPortada || prev.imagenPortada
      }));
      
      setImagenPreview(null);
      setImagenArchivo(null);
      setPortadaPreview(null);
      setPortadaArchivo(null);

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
        
        {/* BANNER DE PORTADA INTERACTIVO */}
        <div 
          style={styles.bannerPortada} 
          onClick={() => portadaInputRef.current.click()}
          title="Hacé clic para cambiar tu foto de portada"
        >
          {portadaPreview ? (
            <img src={portadaPreview} alt="Preview Portada" style={styles.imagenPortadaImg} />
          ) : formData.imagenPortada ? (
            <img src={resolverUrlImagen(formData.imagenPortada)} alt="Portada" style={styles.imagenPortadaImg} />
          ) : (
            <div style={styles.bannerVacio}></div>
          )}
          
          <div style={styles.portadaOverlay}>CAMBIAR PORTADA</div>

          <input 
            type="file" 
            ref={portadaInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handlePortadaChange} 
          />

          <div style={styles.badgePuntos} onClick={(e) => e.stopPropagation()}>
            <span style={styles.puntosNumero}>{formData.puntosGenerales}</span>
            <span style={styles.puntosLabel}>PTS</span>
          </div>
        </div>

        {/* CONTENEDOR AVATAR FLOTANTE */}
        <div style={styles.avatarSeccion}>
          <div style={styles.avatarContenedor} onClick={() => fileInputRef.current.click()}>
            {imagenPreview ? (
              <img src={imagenPreview} alt="Preview Perfil" style={styles.imagenImagen} />
            ) : formData.imagenPerfil ? (
              <img src={resolverUrlImagen(formData.imagenPerfil)} alt="Perfil" style={styles.imagenImagen} />
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
            {/* 🔥 REPARACIÓN AQUÍ: Mapeamos los valores exactos compuestos para evitar romper el Ranking */}
            <select name="categoriaPadel" value={formData.categoriaPadel} onChange={handleChange} style={styles.select} required>
              <option value="">Selecciona tu categoría</option>
              
              <optgroup label="Caballeros" style={styles.optgroup}>
                <option value="1ra Caballeros">1ra Caballeros</option>
                <option value="2da Caballeros">2da Caballeros</option>
                <option value="3ra Caballeros">3ra Caballeros</option>
                <option value="4ta Caballeros">4ta Caballeros</option>
                <option value="5ta Caballeros">5ta Caballeros</option>
                <option value="6ta Caballeros">6ta Caballeros</option>
                <option value="7ma Caballeros">7ma Caballeros</option>
                <option value="8va Caballeros">8va Caballeros</option>
              </optgroup>

              <optgroup label="Damas" style={styles.optgroup}>
                <option value="1ra Damas">1ra Damas</option>
                <option value="2da Damas">2da Damas</option>
                <option value="3ra Damas">3ra Damas</option>
                <option value="4ta Damas">4ta Damas</option>
                <option value="5ta Damas">5ta Damas</option>
                <option value="6ta Damas">6ta Damas</option>
                <option value="7ma Damas">7ma Damas</option>
                <option value="8va Damas">8va Damas</option>
              </optgroup>

              <optgroup label="Especiales" style={styles.optgroup}>
                <option value="Suma">Suma</option>
              </optgroup>
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

// ESTILOS MODERNOS (Conservados y optimizados)
const styles = {
  container: { backgroundColor: '#0C0C0E', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif' },
  tarjeta: { width: '100%', maxWidth: '700px', backgroundColor: '#141416', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' },
  bannerPortada: { width: '100%', height: '160px', backgroundColor: '#1F1F23', position: 'relative', overflow: 'hidden', cursor: 'pointer' },
  imagenPortadaImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bannerVacio: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #1f1f23 0%, #2c2c35 100%)' },
  portadaOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', color: '#FFF', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', ':hover': { opacity: 1 } },
  badgePuntos: { position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(57, 255, 20, 0.15)', border: '1px solid #39FF14', padding: '6px 14px', borderRadius: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 12px rgba(57, 255, 20, 0.2)', zIndex: 3 },
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
  optgroup: { backgroundColor: '#141416', color: '#39FF14', fontWeight: '700' },
  textarea: { backgroundColor: '#1A1A1E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none', minHeight: '90px', resize: 'vertical', fontFamily: 'inherit' },
  contenedorBotones: { padding: '20px 30px 40px 30px', display: 'flex', flexDirection: 'column', gap: '12px' },
  botonGuardar: { backgroundColor: '#39FF14', color: '#000', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(57, 255, 20, 0.3)', transition: 'transform 0.2s' },
  botonLogout: { backgroundColor: 'transparent', color: '#FF453A', border: '1px solid rgba(255, 69, 58, 0.2)', padding: '14px', borderRadius: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  error: { margin: '0 30px 20px 30px', padding: '12px', backgroundColor: 'rgba(255,69,58,0.1)', border: '1px solid #FF453A', color: '#FF453A', borderRadius: '10px', fontSize: '13px', textAlign: 'center' },
  exito: { margin: '0 30px 20px 30px', padding: '12px', backgroundColor: 'rgba(57,255,20,0.1)', border: '1px solid #39FF14', color: '#39FF14', borderRadius: '10px', fontSize: '13px', textAlign: 'center' }
};

export default PerfilScreen;