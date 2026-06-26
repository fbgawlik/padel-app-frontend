// src/screens/RegisterScreen.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    categoriaPadel: ''
  });
  const [errorLocal, setErrorLocal] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    setCargando(true);

    // Validación básica antes de enviar
    const { nombre, apellido, email, password } = formData;
    if (!nombre || !apellido || !email || !password) {
      setErrorLocal('Por favor, completa todos los campos obligatorios (*).');
      setCargando(false);
      return;
    }

    try {
      // ⚠️ Ajustá la URL según el puerto y ruta que use tu Backend (ej: http://localhost:5000/api/auth/registrar)
     await API.post('/auth/register', formData);
      
      alert('¡Usuario registrado con éxito! Ya podés iniciar sesión.');
      navigate('/login'); 
    } catch (error) {
      console.error("Error al registrar:", error);
      const mensajeError = error.response?.data?.error || "Ocurrió un error al registrar el usuario.";
      setErrorLocal(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.contenedor}>
      <div style={styles.tarjetaRegister}>
        
        {/* Identidad Visual Unificada */}
        <div style={styles.contenedorLogo}>
          <h1 style={styles.logoTexto}>ADN PÁDEL</h1>
          <h2 style={styles.subtituloLogo}>REGISTRO DE JUGADOR</h2>
        </div>

        {errorLocal && <div style={styles.error}>{errorLocal}</div>}

        <form onSubmit={handleSubmit} style={styles.formulario}>
          
          {/* Fila Doble: Nombre y Apellido */}
          <div style={styles.filaDoble}>
            <div style={styles.grupoInput}>
              <label style={styles.etiqueta}>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                placeholder="Juan"
                style={styles.input}
                disabled={cargando}
              />
            </div>
            <div style={styles.grupoInput}>
              <label style={styles.etiqueta}>Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={manejarCambio}
                placeholder="Pérez"
                style={styles.input}
                disabled={cargando}
              />
            </div>
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Correo Electrónico *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={manejarCambio}
              placeholder="ejemplo@correo.com"
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={manejarCambio}
              placeholder="••••••••"
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={manejarCambio}
              placeholder="3624xxxxxx"
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Categoría de Pádel</label>
            <select
              name="categoriaPadel"
              value={formData.categoriaPadel}
              onChange={manejarCambio}
              style={styles.select}
              disabled={cargando}
            >
              <option value="">Selecciona tu nivel...</option>
              <option value="1ra">1ra Categoría</option>
              <option value="2da">2da Categoría</option>
              <option value="3ra">3ra Categoría</option>
              <option value="4ta">4ta Categoría</option>
              <option value="5ta">5ta Categoría</option>
              <option value="6ta">6ta Categoría</option>
              <option value="7ma">7ma Categoría</option>
              <option value="8va">8va Categoría</option>
              <option value="Suma 13">Suma 13</option>
              <option value="Mixto">Mixto</option>
            </select>
          </div>

          <button type="submit" style={styles.botonRegistrar} disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        {/* Retorno al Login */}
        <div style={styles.contenedorLoginRedireccion}>
          <span style={styles.textoSecundario}>¿Ya tienes una cuenta? </span>
          <Link to="/login" style={styles.enlaceLogin}>
            Inicia sesión acá
          </Link>
        </div>

      </div>
    </div>
  );
};

// Estilos de ADN Pádel
const styles = {
  // ✅ CÓMO DEBE QUEDAR (Limpio, delegando el layout a Layout.jsx)
contenedor: { 
  width: '100%', 
  color: '#fff', 
  fontFamily: 'sans-serif',
  boxSizing: 'border-box'
},
  tarjetaRegister: {
    backgroundColor: '#141414',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  contenedorLogo: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoTexto: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: '0 0 5px 0',
  },
  subtituloLogo: {
    color: '#00ff66',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '3px',
    margin: 0,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  filaDoble: {
    display: 'flex',
    gap: '15px',
  },
  grupoInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  etiqueta: {
    color: '#aaaaaa',
    fontSize: '13px',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
  },
  botonRegistrar: {
    backgroundColor: '#00ff66',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    color: '#ff3b30',
    border: '1px solid #ff3b30',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  contenedorLoginRedireccion: {
    marginTop: '25px',
    textAlign: 'center',
    fontSize: '14px',
  },
  textoSecundario: {
    color: '#aaaaaa',
  },
  enlaceLogin: {
    color: '#00ff66',
    textDecoration: 'none',
    fontWeight: '700',
    marginLeft: '5px',
  },
};

export default RegisterScreen;