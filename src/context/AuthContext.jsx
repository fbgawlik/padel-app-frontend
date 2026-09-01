// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    
    if (token && usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        // JSON corrupto en storage => limpiamos sesión
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  // 🔐 Escucha el evento "sesión expirada" que dispara el interceptor de api.js
  // cuando el backend responde 401/403 con token inválido.
  useEffect(() => {
    const manejarSesionExpirada = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setUsuario(null);
    };
    window.addEventListener('auth:expirado', manejarSesionExpirada);
    return () => window.removeEventListener('auth:expirado', manejarSesionExpirada);
  }, []);

  const login = async (email, password) => {
    try {
      const respuesta = await API.post('/auth/login', { email, password });
      const { token, usuario } = respuesta.data; 

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setUsuario(usuario);
      return { exito: true };
    } catch (error) {
      console.error("Error en login:", error);

      // 🔒 Si la cuenta no está verificada, avisamos para que la app
      // redirija a la pantalla de verificación en lugar de mostrar error genérico.
      if (error.response?.status === 403 && error.response?.data?.requiereVerificacion) {
        return {
          exito: false,
          requiereVerificacion: true,
          email: error.response.data.email || email,
          error: error.response.data.error,
        };
      }

      // 429 = bloqueado por intentos repetidos (rate limit)
      if (error.response?.status === 429) {
        return {
          exito: false,
          bloqueado: true,
          error: error.response.data?.error || 'Demasiados intentos. Esperá unos minutos.',
        };
      }

      return { 
        exito: false, 
        error: error.response?.data?.error || "Error al conectar con el servidor." 
      };
    }
  };

  const logout = () => {
    // Avisamos al backend para limpiar el token FCM (best-effort, no bloquea el logout)
    try { API.delete('/usuarios/fcm-token').catch(() => {}); } catch { /* noop */ }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // 🔥 Actualizar datos sin cerrar sesión
  const actualizarDatosUsuario = (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, actualizarDatosUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};