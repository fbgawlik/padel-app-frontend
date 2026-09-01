// src/services/api.js
import axios from 'axios';

const API = axios.create({
  // Con VITE_API_URL definida (producción): "https://.../api".
  // Con VITE_API_URL vacía (dev con proxy): "/api" (mismo origen, sin CORS).
  // Sin definir: fallback al backend de producción de Railway.
  baseURL: `${import.meta.env.VITE_API_URL ?? 'https://padel-api-backend-production.up.railway.app'}/api`,
});

// 🔥 INTERCEPTOR: Inyecta el token automáticamente en CADA petición
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // El backend va a poder leer a req.usuario
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔐 INTERCEPTOR DE RESPUESTA: si el token expira o es inválido (401/403 de JWT),
// cerramos la sesión de forma limpia. El evento lo escucha el AuthContext.
API.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const estado = error.response?.status;
    const ruta = error.config?.url || '';
    const esRutaDeAuth = ruta.includes('/auth/login') || ruta.includes('/auth/register')
      || ruta.includes('/auth/verificar-cuenta') || ruta.includes('/auth/reenviar-codigo');

    // 401/403 en rutas privadas (NO en login/verificación) => sesión vencida
    if ((estado === 401 || estado === 403) && !esRutaDeAuth) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.dispatchEvent(new Event('auth:expirado'));
    }

    return Promise.reject(error);
  }
);

export default API;