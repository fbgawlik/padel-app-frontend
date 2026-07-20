// src/screens/RegisterScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotification();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    categoriaPadel: '',
    genero: '',     
    ladoJuego: ''   
  });
  const [errorLocal, setErrorLocal] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para controlar los selectores customizados abiertos
  const [dropdownAbierto, setDropdownAbierto] = useState({
    genero: false,
    categoriaPadel: false,
    ladoJuego: false
  });

  // Referencias para cerrar al hacer clic afuera
  const generoRef = useRef(null);
  const categoriaRef = useRef(null);
  const ladoRef = useRef(null);

  useEffect(() => {
    const clickAfuera = (e) => {
      if (generoRef.current && !generoRef.current.contains(e.target)) {
        setDropdownAbierto(prev => ({ ...prev, genero: false }));
      }
      if (categoriaRef.current && !categoriaRef.current.contains(e.target)) {
        setDropdownAbierto(prev => ({ ...prev, categoriaPadel: false }));
      }
      if (ladoRef.current && !ladoRef.current.contains(e.target)) {
        setDropdownAbierto(prev => ({ ...prev, ladoJuego: false }));
      }
    };
    document.addEventListener('mousedown', clickAfuera);
    return () => document.removeEventListener('mousedown', clickAfuera);
  }, []);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const seleccionarOpcion = (campo, valor) => {
    setFormData({ ...formData, [campo]: valor });
    setDropdownAbierto(prev => ({ ...prev, [campo]: false }));
  };

  const alternarDropdown = (campo) => {
    setDropdownAbierto(prev => ({
      genero: campo === 'genero' ? !prev.genero : false,
      categoriaPadel: campo === 'categoriaPadel' ? !prev.categoriaPadel : false,
      ladoJuego: campo === 'ladoJuego' ? !prev.ladoJuego : false,
    }));
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
      mostrarNotificacion('¡Usuario registrado con éxito! Ya podés iniciar sesión.', 'success');
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
        
        <div style={styles.contenedorLogo}>
          <h1 style={styles.logoTexto}>ADN PÁDEL</h1>
          <h2 style={styles.subtituloLogo}>REGISTRO DE JUGADOR</h2>
        </div>

        {errorLocal && <div style={styles.error}>{errorLocal}</div>}

        <form onSubmit={handleSubmit} style={styles.formulario}>
          
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

          {/* CUSTOM DROPDOWN: GÉNERO */}
          <div style={styles.grupoInput} ref={generoRef}>
            <label style={styles.etiqueta}>Género</label>
            <div 
              style={styles.customSelectTrigger} 
              onClick={() => !cargando && alternarDropdown('genero')}
            >
              <span>{formData.genero || 'Selecciona tu género...'}</span>
              <span style={styles.flecha}>{dropdownAbierto.genero ? '▲' : '▼'}</span>
            </div>
            {dropdownAbierto.genero && (
              <div style={styles.opcionesContenedor}>
                <div style={styles.opcion} onClick={() => seleccionarOpcion('genero', 'Caballeros')}>Caballeros</div>
                <div style={styles.opcion} onClick={() => seleccionarOpcion('genero', 'Damas')}>Damas</div>
              </div>
            )}
          </div>

          {/* CUSTOM DROPDOWN: CATEGORÍA DE PÁDEL */}
          <div style={styles.grupoInput} ref={categoriaRef}>
            <label style={styles.etiqueta}>Categoría de Pádel</label>
            <div 
              style={styles.customSelectTrigger} 
              onClick={() => !cargando && alternarDropdown('categoriaPadel')}
            >
              <span>{formData.categoriaPadel || 'Selecciona tu nivel...'}</span>
              <span style={styles.flecha}>{dropdownAbierto.categoriaPadel ? '▲' : '▼'}</span>
            </div>
            {dropdownAbierto.categoriaPadel && (
              <div style={styles.opcionesContenedorMax}>
                {['1ra Caballeros', '2da Caballeros', '3ra Caballeros', '4ta Caballeros', '5ta Caballeros', '6ta Caballeros', '7ma Caballeros'
                , '8va Caballeros', '1ra Damas','2da Damas', '3ra Damas', '4ta Damas', '5ta Damas', '6ta Damas', '7ma Damas', '8va Damas'].map((cat) => (
                  <div key={cat} style={styles.opcion} onClick={() => seleccionarOpcion('categoriaPadel', cat)}>
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CUSTOM DROPDOWN: LADO DE JUEGO */}
          <div style={styles.grupoInput} ref={ladoRef}>
            <label style={styles.etiqueta}>Lado de Juego</label>
            <div 
              style={styles.customSelectTrigger} 
              onClick={() => !cargando && alternarDropdown('ladoJuego')}
            >
              <span>{formData.ladoJuego || 'Selecciona tu lado...'}</span>
              <span style={styles.flecha}>{dropdownAbierto.ladoJuego ? '▲' : '▼'}</span>
            </div>
            {dropdownAbierto.ladoJuego && (
              <div style={styles.opcionesContenedor}>
                <div style={styles.opcion} onClick={() => seleccionarOpcion('ladoJuego', 'Drive')}>Drive</div>
                <div style={styles.opcion} onClick={() => seleccionarOpcion('ladoJuego', 'Revés')}>Revés</div>
                <div style={styles.opcion} onClick={() => seleccionarOpcion('ladoJuego', 'Ambos')}>Ambos</div>
              </div>
            )}
          </div>

          <button type="submit" style={styles.botonRegistrar} disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

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

const styles = {
  contenedor: { 
    width: '100%', 
    minHeight: '100vh',         // Obliga al contenedor a usar todo el alto de la pantalla
    backgroundColor: '#050505', // Fondo general para fundirse con la tarjeta
    color: '#fff', 
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',       // Centra la tarjeta verticalmente
    padding: '20px'             // Padding en todos los lados (importante para móviles)
  },
  tarjetaRegister: {
    backgroundColor: '#0A0A0B', 
    width: '100%',
    maxWidth: '420px',
    padding: '32px 24px',       // Un poco más de aire interno
    boxSizing: 'border-box',
    borderRadius: '16px',       // Suaviza los bordes para estilo App
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)' // Sutil sombra para separarlo del fondo
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
    color: '#39FF14', 
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
    // En pantallas MUY chicas (ej. iPhone SE), podrías necesitar que esto sea flex-direction: column. 
    // Como usas estilos en línea, dejémoslo en row pero asegurándonos que los inputs tengan un ancho mínimo de 100%.
  },
  grupoInput: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative' 
  },
  etiqueta: {
    color: '#8E8E93',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '8px',
    textAlign: 'left' // Cambiado a 'left' (o 'center' si lo prefieres, pero left suele ser mejor en móviles)
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
    textAlign: 'left', // Cambiado a 'left' para mejorar usabilidad móvil
  },
  customSelectTrigger: {
    backgroundColor: '#161618',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    height: '48px',
    padding: '0 16px',
    color: '#ffffff',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  flecha: {
    fontSize: '10px',
    color: '#8E8E93'
  },
  opcionesContenedor: {
    position: 'absolute',
    top: '74px',
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    zIndex: 100,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
  },
  opcionesContenedorMax: {
    position: 'absolute',
    top: '74px',
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    zIndex: 100,
    maxHeight: '200px', 
    overflowY: 'auto',   
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
  },
  opcion: {
    padding: '14px',
    fontSize: '14px',
    textAlign: 'left', // Cambiado a 'left'
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#FFFFFF',
    transition: 'background-color 0.2s',
  },
  botonRegistrar: {
    backgroundColor: '#39FF14',
    color: '#0A0A0B',
    border: 'none',
    borderRadius: '14px',
    height: '52px',
    fontSize: '16px', // Un poco más grande para el tap
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