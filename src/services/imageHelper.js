// src/services/imageHelper.js
const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'https://padel-api-backend-production.up.railway.app').replace(/\/$/, '');

export const resolverUrlImagen = (ruta) => {
  if (!ruta) return null;
  const url = String(ruta).trim();

  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.includes('localhost:5000')) {
    return url.replace(/^(https?:\/\/)?localhost:5000/, BACKEND_URL);
  }
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  return `${BACKEND_URL}/${url}`;
};