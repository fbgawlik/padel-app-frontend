// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://padel-api-backend-production.up.railway.app/api', // Asegurate de que coincida con tu puerto del backend
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

export default API;