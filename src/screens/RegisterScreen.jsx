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
    categoriaPadel: '',
    genero: '',     // 🟢 Agregado para consistencia con Prisma
    ladoJuego: ''   // 🟢 Agregado para consistencia con Prisma
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

    const { nombre, apellido, email, password } = formData;
    if (!nombre || !apellido || !email || !password) {
      setErrorLocal('Por favor, completa todos los campos obligatorios (*).');
      setCargando(false);
      return;
    }

    try {
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
        
        {/* Identidad Visual Premium Unificada */}
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

          {/* GÉNERO */}
          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Género</label>
            <select
              name="genero"
              value={formData.genero}
              onChange={manejarCambio}
              style={styles.select}
              disabled={cargando}
            >
              <option value="">Selecciona tu género...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* CATEGORÍA DE PÁDEL: Mapeada idéntica a los rankings y torneos de la BD */}
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
              <option value="1ra Caballeros">1ra Caballeros</option>
              <option value="2da Caballeros">2da Caballeros</option>
              <option value="3ra Caballeros">3ra Caballeros</option>
              <option value="4ta Caballeros">4ta Caballeros</option>
              <option value="5ta Caballeros">5ta Caballeros</option>
              <option value="6ta Caballeros">6ta Caballeros</option>
              <option value="7ma Caballeros">7ma Caballeros</option>
              <option value="1ra Damas">1ra Damas</option>
              <option value="3ra Damas">3ra Damas</option>
              <option value="4ta Damas">4ta Damas</option>
              <option value="5ta Damas">5ta Damas</option>
              <option value="6ta Damas">6ta Damas</option>
            </select>
          </div>

          {/* LADO DE JUEGO */}
          <div style={styles.grupoInput}>
            <label style={styles.etiqueta}>Lado de Juego</label>
            <select
              name="ladoJuego"
              value={formData.ladoJuego}
              onChange={manejarCambio}
              style={styles.select}
              disabled={cargando}
            >
              <option value="">Selecciona tu lado...</option>
              <option value="Drive">Drive</option>
              <option value="Revés">Revés</option>
              <option value="Ambos">Ambos</option>
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

// Estilos de ADN Pádel Premium (Alineados a la captura)
const styles = {
  contenedor: { 
    width: '100%', 
    color: '#fff', 
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    padding: '20px 0'
  },
  tarjetaRegister: {
    backgroundColor: '#0A0A0B', // Mismo fondo oscuro profundo de la app
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
    boxSizing: 'border-box'
  },
  contenedorLogo: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  logoTexto: {
    color: '#ffffff',
    fontSize: '34px',
    fontWeight: '900',
    letterSpacing: '1px',
    margin: '0 0 4px 0',
  },
  subtituloLogo: {
    color: '#39FF14', // Verde neón exacto
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: 0,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  filaDoble: {
    display: 'flex',
    gap: '14px',
  },
  grupoInput: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  etiqueta: {
    color: '#8E8E93',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '8px',
    textAlign: 'center' // Centrado como en la captura
  },
  input: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    height: '48px',
    padding: '0 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center', // Texto centrado
  },
  select: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    height: '48px',
    padding: '0 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    textAlignLast: 'center', // Fuerza el centrado de la opción elegida
  },
  botonRegistrar: {
    backgroundColor: '#39FF14',
    color: '#0A0A0B',
    border: 'none',
    borderRadius: '14px',
    height: '52px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 4px 20px rgba(57, 255, 20, 0.2)',
  },
  error: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    color: '#ff4d4d',
    border: '1px solid #ff4d4d',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: '20px',
  },
  contenedorLoginRedireccion: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '14px',
  },
  textoSecundario: {
    color: '#8E8E93',
  },
  enlaceLogin: {
    color: '#39FF14',
    textDecoration: 'underline',
    fontWeight: '700',
    marginLeft: '5px',
  },
};

export default RegisterScreen;