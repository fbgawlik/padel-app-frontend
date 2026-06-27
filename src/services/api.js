// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, 
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