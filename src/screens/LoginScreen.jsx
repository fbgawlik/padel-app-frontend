// src/screens/LoginScreen.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✨ Importación correcta de Link
import { AuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLocal, setErrorLocal] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    setCargando(true);

    if (!email || !password) {
      setErrorLocal('Por favor, completa todos los campos.');
      setCargando(false);
      return;
    }

    const resultado = await login(email, password);
    
    if (!resultado.exito) {
      setErrorLocal(resultado.error);
    } else {
      navigate('/dashboard'); 
    }
    setCargando(false);
  };

  return (
    <div style={styles.contenedor}>
      <div style={styles.tarjetaLogin}>
        
        {/* Logo de Texto Temporal Premium */}
        <div style={styles.contenedorLogo}>
          <h1 style={styles.logoTexto}>ADN PÁDEL</h1>
          <h2 style={styles.subtituloLogo}>SISTEMA DE GESTIÓN</h2>
        </div>

        {errorLocal && <div style={styles.error}>{errorLocal}</div>}

        <form onSubmit={handleSubmit} style={styles.formulario}>
          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <button type="submit" style={styles.botonIngresar} disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* ✨ Enlace de redirección al registro con estilo unificado */}
        <div style={styles.contenedorRegistro}>
          <span style={styles.textoSecundario}>¿No tienes una cuenta? </span>
          <Link to="/register" style={styles.enlaceRegistro}>
            Regístrate acá
          </Link>
        </div>

      </div>
    </div>
  );
};

// Objeto de estilos completo y restaurado al 100%
const styles = {
 contenedor: { 
  display: 'flex',
  justifyContent: 'center', // Centra la tarjeta horizontalmente
  alignItems: 'center',     // Centra la tarjeta verticalmente
  minHeight: '100dvh',      // Ajustado para el navegador móvil moderno
  padding: '20px', 
  color: '#fff', 
  fontFamily: 'sans-serif',
  boxSizing: 'border-box',
  backgroundColor: '#0A0A0A' // Fondo oscuro para que combine con el diseño premium
},
  tarjetaLogin: {
    backgroundColor: '#141414',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  contenedorLogo: {
    textAlign: 'center',
    marginBottom: '35px',
  },
  logoTexto: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: '0 0 5px 0',
  },
  subtituloLogo: {
    color: '#00ff66', // Verde pista eléctrico vibrante
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '3px',
    margin: 0,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grupoInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    transition: 'border-color 0.2s',
  },
  botonIngresar: {
    backgroundColor: '#00ff66',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
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
  contenedorRegistro: {
    marginTop: '25px',
    textAlign: 'center',
    fontSize: '14px',
  },
  textoSecundario: {
    color: '#aaaaaa',
  },
  enlaceRegistro: {
    color: '#00ff66',
    textDecoration: 'none',
    fontWeight: '700',
    marginLeft: '5px',
    transition: 'color 0.2s'
  },
};

export default LoginScreen;