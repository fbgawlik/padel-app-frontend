// src/hooks/useTorneos.js
import { useState, useEffect, useCallback } from 'react';
import { torneoService } from '../services/torneoService';

export const useTorneos = () => {
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarTorneos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await torneoService.getAll();
      setTorneos(datos);
      setError(null);
    } catch (err) {
      console.error("Error al traer torneos:", err);
      setError("No se pudieron cargar los torneos. Revisa tu conexión.");
    } finally {
      setCargando(false);
    }
  }, []);

  // Se ejecuta automáticamente al montar el componente
  useEffect(() => {
    cargarTorneos();
  }, [cargarTorneos]);

  const crearNuevoTorneo = async (datos) => {
    try {
      const nuevoTorneo = await torneoService.crear(datos);
      setTorneos((prev) => [nuevoTorneo, ...prev]); // Lo agrega al inicio de la lista
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  return {
    torneos,
    cargando,
    error,
    refrescar: cargarTorneos,
    crearTorneo: crearNuevoTorneo
  };
};