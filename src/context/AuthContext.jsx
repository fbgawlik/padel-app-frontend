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
      setUsuario(JSON.parse(usuarioGuardado)); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const respuesta = await API.post('/auth/login', { email, password });
      const { token, usuario } = respuesta.data; 

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario)); // Agregamos esto para que persista al recargar
      setUsuario(usuario);
      return { exito: true };
    } catch (error) {
      console.error("Error en login:", error);
      return { 
        exito: false, 
        error: error.response?.data?.error || "Error al conectar con el servidor." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // 🔥 NUEVA FUNCIÓN: Actualizar datos sin cerrar sesión
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