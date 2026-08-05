// src/screens/PerfilScreen.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { resolverUrlImagen } from '../services/imageHelper';
import { styles } from './PerfilScreen.styles';

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
;

export default PerfilScreen;