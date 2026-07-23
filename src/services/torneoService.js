// src/services/torneoService.js
import API from "./api"; 

export const torneoService = {
  // Obtener todos los torneos
  getAll: async () => {
    const response = await API.get('/torneos');
    return response.data;
  },

  // Crear un nuevo torneo (Admin)
  crear: async (datosTorneo) => {
    const response = await API.post('/torneos/crear', datosTorneo);
    return response.data;
  },

  // Obtener un torneo por su id, incluyendo partidos y zonas
  getById: async (torneoId) => {
    const response = await API.get(`/torneos/${torneoId}`);
    return response.data;
  },

  // Registrar una pareja a un torneo
  inscribirPareja: async (torneoId, datosInscripcion) => {
    const response = await API.post(`/torneos/${torneoId}/inscripciones`, datosInscripcion);
    return response.data;
  },

  // Generar zonas y cuadros a partir de inscripciones
  generarZonas: async (torneoId, categoria) => {
    const response = await API.post('/torneos/generar-zonas', { torneoId, categoria });
    return response.data;
  },

  // Actualizar el resultado de un partido en las llaves/zonas
  actualizarPartido: async (partidoId, resultado) => {
    const response = await API.put(`/torneos/partido/${partidoId}/resultado`, { resultado });
    return response.data;
  }
};