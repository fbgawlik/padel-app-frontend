// src/screens/VerificarCuentaScreen.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { styles } from './VerificarCuentaScreen.styles';

const CODIGO_LONGITUD = 6;

const VerificarCuentaScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mostrarNotificacion } = useNotification();

  // El email llega desde el registro/login vía state o query param
  const emailInicial =
    location.state?.email || new URLSearchParams(location.search).get('email') || '';

  const [email, setEmail] = useState(emailInicial);
  const [digitos, setDigitos] = useState(Array(CODIGO_LONGITUD).fill(''));
  const [errorLocal, setErrorLocal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [countdown, setCountdown] = useState(emailInicial ? 60 : 0);
  const [codigoDev, setCodigoDev] = useState(location.state?.codigoDev || null);

  const refsInputs = useRef([]);

  // ⏱️ Cuenta regresiva para habilitar el reenvío
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // 🎯 Auto-focus en el primer casillero al montar
  useEffect(() => {
    if (refsInputs.current[0]) {
      refsInputs.current[0].focus();
    }
  }, []);

  const codigoCompleto = digitos.every((d) => d !== '');

  const manejarCambioDigito = (index, valor) => {
    const soloDigitos = valor.replace(/\D/g, '');

    // Pegado de código completo (ej: "123456")
    if (soloDigitos.length > 1) {
      const nuevo = Array(CODIGO_LONGITUD).fill('');
      for (let i = 0; i < CODIGO_LONGITUD; i += 1) {
        nuevo[i] = soloDigitos[i] || '';
      }
      setDigitos(nuevo);
      const siguiente = Math.min(soloDigitos.length, CODIGO_LONGITUD) - 1;
      refsInputs.current[siguiente]?.focus();
      return;
    }

    const nuevos = [...digitos];
    nuevos[index] = soloDigitos;
    setDigitos(nuevos);
    setErrorLocal('');

    if (soloDigitos && index < CODIGO_LONGITUD - 1) {
      refsInputs.current[index + 1]?.focus();
    }
  };

  const manejarRetroceso = (index, e) => {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      refsInputs.current[index - 1]?.focus();
    }
  };

  const manejarTecla = (index, e) => {
    // Permitimos navegación con flechas entre casilleros
    if (e.key === 'ArrowLeft' && index > 0) refsInputs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < CODIGO_LONGITUD - 1) refsInputs.current[index + 1]?.focus();
    if (e.key === 'Enter' && codigoCompleto) {
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErrorLocal('');

    if (!email.trim()) {
      setErrorLocal('Ingresá tu correo electrónico.');
      return;
    }
    if (!codigoCompleto) {
      setErrorLocal('Completá los 6 dígitos del código.');
      return;
    }

    setCargando(true);
    try {
      const res = await API.post('/auth/verificar-cuenta', {
        email: email.trim(),
        codigo: digitos.join(''),
      });

      setVerificado(true);
      mostrarNotificacion(res.data.message || '¡Cuenta verificada!', 'success');

      // Tras 1.6s redirigimos al login para que inicie sesión
      setTimeout(() => navigate('/login', { state: { email: email.trim() } }), 1600);
    } catch (err) {
      setErrorLocal(err.response?.data?.error || 'No se pudo verificar la cuenta. Intentá de nuevo.');

      // Si el código quedó bloqueado/expirado, limpiamos los casilleros
      const mensaje = err.response?.data?.error || '';
      if (/expiró|Bloqueamos|nuevo/i.test(mensaje)) {
        setDigitos(Array(CODIGO_LONGITUD).fill(''));
        refsInputs.current[0]?.focus();
      }
    } finally {
      setCargando(false);
    }
  };

  const reenviarCodigo = useCallback(async () => {
    setErrorLocal('');
    if (!email.trim()) {
      setErrorLocal('Ingresá tu correo para poder reenviar el código.');
      return;
    }

    setReenviando(true);
    try {
      const res = await API.post('/auth/reenviar-codigo', { email: email.trim() });
      mostrarNotificacion(res.data.message || 'Código reenviado.', 'info');
      setCountdown(60);
      setDigitos(Array(CODIGO_LONGITUD).fill(''));
      refsInputs.current[0]?.focus();

      // 🧪 Modo dev: el backend devuelve el código para poder probar sin SMTP
      if (res.data.codigoDev) {
        setCodigoDev(res.data.codigoDev);
      }
    } catch (err) {
      setErrorLocal(err.response?.data?.error || 'No se pudo reenviar el código.');
      const cooldown = err.response?.data?.cooldown;
      if (cooldown) setCountdown(cooldown);
    } finally {
      setReenviando(false);
    }
  }, [email, mostrarNotificacion]);

  return (
    <div style={styles.contenedor}>
      <div style={styles.tarjeta}>
        {/* Logo */}
        <div style={styles.contenedorLogo}>
          <h1 style={styles.logoTexto}>ADN PÁDEL</h1>
          <h2 style={styles.subtituloLogo}>VERIFICACIÓN DE CUENTA</h2>
        </div>

        {verificado ? (
          <>
            <div style={styles.exitoGrande}>
              <span style={styles.iconoExito}>✓</span>
            </div>
            <p style={styles.textoExito}>
              ¡Tu cuenta fue verificada con éxito!
              <br />
              <span style={styles.textoSecundario}>Te llevamos al inicio de sesión…</span>
            </p>
          </>
        ) : (
          <>
            <p style={styles.descripcion}>
              Te enviamos un código de 6 dígitos a tu correo electrónico.
              Ingresalo acá abajo para activar tu cuenta.
            </p>

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
                  required
                />
              </div>

              {/* CASILLEROS OTP */}
              <div style={styles.grupoInput}>
                <label style={styles.etiqueta}>Código de Verificación</label>
                <div style={styles.contenedorOtp}>
                  {digitos.map((digito, index) => (
                    <input
                      key={index}
                      ref={(el) => (refsInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      maxLength={CODIGO_LONGITUD}
                      value={digito}
                      onChange={(e) => manejarCambioDigito(index, e.target.value)}
                      onKeyDown={(e) => manejarRetroceso(index, e)}
                      onKeyUp={(e) => manejarTecla(index, e)}
                      style={{
                        ...styles.otpInput,
                        ...(digito ? styles.otpInputLleno : {}),
                        ...(errorLocal ? styles.otpInputError : {}),
                      }}
                      disabled={cargando}
                      aria-label={`Dígito ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* 🧪 AYUDA MODO DEV: muestra el código que devolvió el backend sin SMTP */}
              {codigoDev && (
                <div style={styles.cajaDev}>
                  <span style={styles.tituloDev}>🧪 Modo desarrollo (sin SMTP configurado)</span>
                  <span style={styles.textoDev}>
                    Tu código es: <strong style={styles.codigoDev}>{codigoDev}</strong>
                  </span>
                  <span style={styles.notaDev}>
                    Configurá SMTP_HOST / SMTP_USER / SMTP_PASS en el backend para enviar emails reales.
                  </span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  ...styles.botonVerificar,
                  ...(!codigoCompleto || cargando ? styles.botonDeshabilitado : {}),
                }}
                disabled={!codigoCompleto || cargando}
              >
                {cargando ? 'Verificando…' : 'Verificar mi cuenta'}
              </button>
            </form>

            {/* REENVÍO */}
            <div style={styles.contenedorReenvio}>
              <span style={styles.textoSecundario}>¿No llegó el código?</span>{' '}
              {countdown > 0 ? (
                <span style={styles.countdown}>
                  Podrás pedir otro en {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={reenviarCodigo}
                  disabled={reenviando}
                  style={reenviando ? styles.enlaceReenvioDeshabilitado : styles.enlaceReenvio}
                >
                  {reenviando ? 'Enviando…' : 'Reenviar código'}
                </button>
              )}
            </div>

            <div style={styles.contenedorVolver}>
              <Link to="/login" style={styles.enlaceVolver}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerificarCuentaScreen;