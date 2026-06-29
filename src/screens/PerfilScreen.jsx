// src/screens/PerfilScreen.jsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Agregamos useNavigate
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const PerfilScreen = () => {
  // Extraemos logout del contexto
  const { usuario, actualizarDatosUsuario, logout } = useContext(AuthContext); 
  const navigate = useNavigate(); // Inicializamos navigate
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados para la imagen
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    telefono: usuario?.telefono || '',
    categoriaPadel: usuario?.categoriaPadel || ''
  });

  useEffect(() => {
    const cargarPerfilCompleto = async () => {
      try {
        const res = await API.get('/auth/perfil');
        setFormData({
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          telefono: res.data.telefono || '',
          categoriaPadel: res.data.categoriaPadel || ''
        });
        
        // Mostrar la foto actual si existe (Asegúrate de que API configure la baseURL)
        if (res.data.imagenPerfil) {
          // Ajusta localhost:3000 si tu backend corre en otro puerto
          setImagenPreview(`http://localhost:5000${res.data.imagenPerfil}`);
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    };
    cargarPerfilCompleto();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleClickImagen = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setMensajeExito('');

    // Preparamos los datos con FormData para soportar la imagen
    const datosAEnviar = new FormData();
    datosAEnviar.append('nombre', formData.nombre);
    datosAEnviar.append('apellido', formData.apellido);
    datosAEnviar.append('telefono', formData.telefono);
    datosAEnviar.append('categoriaPadel', formData.categoriaPadel);
    
    if (imagenArchivo) {
      datosAEnviar.append('imagen', imagenArchivo);
    }

    try {
      const res = await API.put('/auth/perfil', datosAEnviar);
      
      setMensajeExito('Perfil actualizado correctamente.');
      
      // Actualizamos el contexto global (sidebar)
      actualizarDatosUsuario({
        nombre: res.data.usuario.nombre,
        apellido: res.data.usuario.apellido,
        imagenPerfil: res.data.usuario.imagenPerfil
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al actualizar el perfil.');
    } finally {
      setCargando(false);
    }
  };

  // Función agregada para manejar el cierre de sesión
  const handleCerrarSesion = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    navigate('/login');
  };

  return (
    <div style={styles.contenedor}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>Mi Perfil</h1>
        <p style={styles.texto}>Gestioná tu información personal y nivel de juego.</p>
      </div>

      <div style={styles.tarjetaFormulario}>
        {error && <div style={styles.alertaError}>{error}</div>}
        {mensajeExito && <div style={styles.alertaExito}>{mensajeExito}</div>}

        <form onSubmit={handleSubmit} style={styles.formularioGrid}>
          
          {/* Avatar / Foto de Perfil */}
          <div style={styles.contenedorAvatar}>
            <div style={styles.avatarCirculo} onClick={handleClickImagen}>
              {imagenPreview ? (
                <img src={imagenPreview} alt="Perfil" style={styles.imagenImagen} />
              ) : (
                <span style={styles.avatarLetra}>{formData.nombre.charAt(0).toUpperCase() || 'U'}</span>
              )}
              <div style={styles.avatarOverlay}>Cambiar</div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImagenChange} 
              style={{ display: 'none' }} 
            />
          </div>

          {/* Correo (Solo Lectura) */}
          <div style={styles.grupoInputFull}>
            <label style={styles.labelForm}>Correo Electrónico (No modificable)</label>
            <input 
              type="email" 
              value={usuario?.email || 'usuario@mail.com'} 
              disabled 
              style={{...styles.inputForm, opacity: 0.5, cursor: 'not-allowed'}} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.labelForm}>Nombre</label>
            <input 
              type="text" name="nombre" value={formData.nombre} 
              onChange={handleChange} required style={styles.inputForm} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.labelForm}>Apellido</label>
            <input 
              type="text" name="apellido" value={formData.apellido} 
              onChange={handleChange} required style={styles.inputForm} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.labelForm}>Teléfono</label>
            <input 
              type="text" name="telefono" value={formData.telefono} 
              onChange={handleChange} placeholder="Ej: 3624123456" style={styles.inputForm} 
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.labelForm}>Categoría de Pádel</label>
            <select name="categoriaPadel" value={formData.categoriaPadel} onChange={handleChange} style={styles.inputForm}>
                <option value="">No clasificado</option>
                <option value="1ra">1ra</option>
                <option value="2da">2da</option>
                <option value="3ra">3ra</option>
                <option value="4ta">4ta</option>
                <option value="5ta">5ta</option>
                <option value="6ta">6ta</option>
                <option value="7ma">7ma</option>
                <option value="8va">8va</option>
            </select>
          </div>

          <button type="submit" disabled={cargando} style={styles.botonGuardar}>
            {cargando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>

        {/* Sección de Cerrar Sesión Agregada */}
        <div style={styles.seccionSalir}>
          <button type="button" onClick={handleCerrarSesion} style={styles.botonCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
};

const styles = {
  contenedor: { width: '100%', boxSizing: 'border-box', padding: '24px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px' },
  titulo: { fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  texto: { color: '#8A8A8A', margin: 0, fontSize: '15px' },
  tarjetaFormulario: { backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', maxWidth: '800px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  formularioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  grupoInput: { display: 'flex', flexDirection: 'column', gap: '6px' },
  grupoInputFull: { display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' },
  labelForm: { fontSize: '13px', color: '#8A8A8A', fontWeight: '600' },
  inputForm: { backgroundColor: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
  botonGuardar: { gridColumn: '1 / -1', padding: '14px', backgroundColor: '#00ff66', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '16px', transition: 'all 0.2s' },
  alertaError: { backgroundColor: 'rgba(255,51,51,0.1)', color: '#ff4d4d', padding: '14px', borderRadius: '10px', marginBottom: '24px', fontWeight: '600', border: '1px solid rgba(255,51,51,0.2)' },
  alertaExito: { backgroundColor: 'rgba(0,255,102,0.1)', color: '#00ff66', padding: '14px', borderRadius: '10px', marginBottom: '24px', fontWeight: '600', border: '1px solid rgba(0,255,102,0.2)' },
  
  // Estilos del Avatar
  contenedorAvatar: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginBottom: '10px' },
  avatarCirculo: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' },
  avatarLetra: { fontSize: '40px', color: '#8A8A8A', fontWeight: 'bold' },
  imagenImagen: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 255, 102, 0.8)', color: '#000', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', padding: '4px 0', opacity: 0.8 },
  
  // Nuevos Estilos para el botón de salida
  seccionSalir: { marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' },
  botonCerrarSesion: { padding: '14px 24px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.2)', color: '#FF3B30', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', width: '100%', maxWidth: '250px' }
};

export default PerfilScreen;