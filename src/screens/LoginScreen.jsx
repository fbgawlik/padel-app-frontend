// src/screens/LoginScreen.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✨ Importación correcta de Link
import { AuthContext } from '../context/AuthContext';
import { styles } from './LoginScreen.styles';

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
;

export default LoginScreen;