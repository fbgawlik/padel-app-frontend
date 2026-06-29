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
        
        if (res.data.imagenPerfil) {
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
        <p style={styles.texto}>Gestioná tu información personal y nivel de juego dentro del circuito.</p>
      </div>

      <div style={styles.tarjetaFormulario}>
        {error && <div style={styles.alertaError}>{error}</div>}
        {mensajeExito && <div style={styles.alertaExito}>{mensajeExito}</div>}

        <form onSubmit={handleSubmit} style={styles.formularioGrid}>
          
          <div style={styles.contenedorAvatar}>
            <div style={styles.avatarCirculo} onClick={handleClickImagen}>
              {imagenPreview ? (
                <img src={imagenPreview} alt="Perfil" style={styles.imagenImagen} />
              ) : (
                <span style={styles.avatarLetra}>{formData.nombre.charAt(0).toUpperCase() || 'U'}</span>
              )}
              <div style={styles.avatarOverlay}>Editar</div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImagenChange} 
              style={{ display: 'none' }} 
            />
          </div>

          <div style={styles.grupoInputFull}>
            <label style={styles.labelForm}>Correo Electrónico</label>
            <input 
              type="email" 
              value={usuario?.email || 'usuario@mail.com'} 
              disabled 
              style={styles.inputFormDisabled} 
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
            <select name="categoriaPadel" value={formData.categoriaPadel} onChange={handleChange} style={styles.selectForm}>
                <option value="">No clasificado</option>
                <option value="1ra">1ra Categoría</option>
                <option value="2da">2da Categoría</option>
                <option value="3ra">3ra Categoría</option>
                <option value="4ta">4ta Categoría</option>
                <option value="5ta">5ta Categoría</option>
                <option value="6ta">6ta Categoría</option>
                <option value="7ma">7ma Categoría</option>
                <option value="8va">8va Categoría</option>
            </select>
          </div>

          <button type="submit" disabled={cargando} style={styles.botonGuardar}>
            {cargando ? 'Guardando cambios...' : 'Guardar Configuración'}
          </button>
        </form>

        <div style={styles.seccionSalir}>
          <button type="button" onClick={handleCerrarSesion} style={styles.botonCerrarSesion}>
            Cerrar Sesión Activa
          </button>
        </div>

      </div>
    </div>
  );
};

const styles = {
  contenedor: { 
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '40px 24px', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#0A0A0A',
    minHeight: '100vh'
  },
  header: { 
    borderBottom: '1px solid rgba(255,255,255,0.04)', 
    paddingBottom: '24px', 
    marginBottom: '36px' 
  },
  titulo: { 
    fontSize: '34px', 
    margin: '0 0 6px 0', 
    fontWeight: '800', 
    color: '#ffffff', 
    letterSpacing: '-0.8px' 
  },
  texto: { 
    color: '#8E8E93', 
    margin: 0, 
    fontSize: '15px',
    letterSpacing: '-0.2px'
  },
  tarjetaFormulario: { 
    backgroundColor: '#121214', 
    border: '1px solid rgba(255,255,255,0.04)', 
    borderRadius: '28px', 
    padding: '40px 32px', 
    maxWidth: '760px', 
    boxShadow: '0 16px 40px rgba(0,0,0,0.3)' 
  },
  formularioGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
    gap: '24px' 
  },
  grupoInput: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px' 
  },
  grupoInputFull: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px', 
    gridColumn: '1 / -1' 
  },
  labelForm: { 
    fontSize: '13px', 
    color: '#8E8E93', 
    fontWeight: '600',
    letterSpacing: '-0.1px',
    paddingLeft: '4px'
  },
  inputForm: { 
    backgroundColor: '#1C1C1E', 
    color: '#ffffff', 
    border: '1px solid rgba(255,255,255,0.05)', 
    padding: '14px 16px', 
    borderRadius: '14px', 
    fontSize: '14px', 
    outline: 'none', 
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  selectForm: {
    backgroundColor: '#1C1C1E', 
    color: '#ffffff', 
    border: '1px solid rgba(255,255,255,0.05)', 
    padding: '14px 16px', 
    borderRadius: '14px', 
    fontSize: '14px', 
    outline: 'none', 
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none'
  },
  inputFormDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
    color: '#545456', 
    border: '1px solid rgba(255,255,255,0.02)', 
    padding: '14px 16px', 
    borderRadius: '14px', 
    fontSize: '14px', 
    outline: 'none',
    cursor: 'not-allowed',
    boxSizing: 'border-box'
  },
  botonGuardar: { 
    gridColumn: '1 / -1', 
    padding: '16px', 
    backgroundColor: '#39FF14', 
    color: '#000000', 
    border: 'none', 
    borderRadius: '16px', 
    fontWeight: '700', 
    fontSize: '15px', 
    cursor: 'pointer', 
    marginTop: '12px', 
    transition: 'all 0.2s ease',
    boxShadow: '0 8px 24px rgba(57, 255, 20, 0.15)'
  },
  alertaError: { 
    backgroundColor: 'rgba(255,69,58,0.08)', 
    color: '#FF453A', 
    padding: '14px 18px', 
    borderRadius: '16px', 
    marginBottom: '28px', 
    fontWeight: '600', 
    fontSize: '14px',
    border: '1px solid rgba(255,69,58,0.15)' 
  },
  alertaExito: { 
    backgroundColor: 'rgba(57,255,20,0.06)', 
    color: '#39FF14', 
    padding: '14px 18px', 
    borderRadius: '16px', 
    marginBottom: '28px', 
    fontWeight: '600', 
    fontSize: '14px',
    border: '1px solid rgba(57,255,20,0.15)' 
  },
  contenedorAvatar: { 
    gridColumn: '1 / -1', 
    display: 'flex', 
    justifyContent: 'center', 
    marginBottom: '16px' 
  },
  avatarCirculo: { 
    width: '110px', 
    height: '110px', 
    borderRadius: '50%', 
    backgroundColor: '#1C1C1E', 
    border: '2px solid rgba(255,255,255,0.06)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer', 
    position: 'relative', 
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    transition: 'transform 0.2s ease'
  },
  avatarLetra: { 
    fontSize: '44px', 
    color: '#8E8E93', 
    fontWeight: '700' 
  },
  imagenImagen: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  avatarOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'rgba(18, 18, 20, 0.75)', 
    backdropFilter: 'blur(4px)',
    color: '#ffffff', 
    fontSize: '11px', 
    fontWeight: '600', 
    textAlign: 'center', 
    padding: '6px 0',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  seccionSalir: { 
    marginTop: '36px', 
    paddingTop: '28px', 
    borderTop: '1px solid rgba(255,255,255,0.04)', 
    display: 'flex', 
    justifyContent: 'center' 
  },
  botonCerrarSesion: { 
    padding: '14px 24px', 
    backgroundColor: 'rgba(255, 69, 58, 0.06)', 
    border: '1px solid rgba(255, 69, 58, 0.12)', 
    color: '#FF453A', 
    borderRadius: '16px', 
    fontSize: '14px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease', 
    width: '100%', 
    maxWidth: '240px',
    textAlign: 'center'
  }
};

export default PerfilScreen;