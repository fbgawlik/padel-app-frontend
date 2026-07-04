import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; // 🔥 Usamos tu servicio centralizado

const RankingScreen = () => {
  const [jugadores, setJugadores] = useState([]);
  const [categoria, setCategoria] = useState('5ta'); 
  const [rama, setRama] = useState('Caballeros'); // 🔥 Nuevo estado para Damas/Caballeros
  const [cargando, setCargando] = useState(true);
  
  const navigate = useNavigate(); 
  
  // Usamos tu variable de entorno para las imágenes
  const URL_IMAGENES = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const categoriasDisponibles = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va'];
  const ramasDisponibles = ['Caballeros', 'Damas'];

  useEffect(() => {
    const cargarRanking = async () => {
      setCargando(true);
      try {
        // 🔥 Hacemos la petición enviando ambos filtros
        const respuesta = await API.get(`/ranking?categoria=${categoria}&rama=${rama}`);
        setJugadores(respuesta.data);
      } catch (error) {
        console.error("Error al obtener la tabla de posiciones:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarRanking();
  }, [categoria, rama]); // Se vuelve a ejecutar si cambias la categoría o la rama

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Ranking Oficial</h1>

      {/* Selectores de Filtro */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center">
          <label className="mr-3 font-semibold">Rama:</label>
          <select 
            value={rama} 
            onChange={(e) => setRama(e.target.value)}
            className="border border-gray-300 rounded p-2 bg-white outline-none cursor-pointer"
          >
            {ramasDisponibles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label className="mr-3 font-semibold">Categoría:</label>
          <select 
            value={categoria} 
            onChange={(e) => setCategoria(e.target.value)}
            className="border border-gray-300 rounded p-2 bg-white outline-none cursor-pointer"
          >
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pantalla de Carga */}
      {cargando ? (
        <div className="flex justify-center items-center py-10">
           <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Tabla de Posiciones */
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 border-b w-16 text-center">#</th>
                <th className="p-4 border-b">Jugador</th>
                <th className="p-4 border-b text-right">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500 font-medium">
                    Aún no hay jugadores registrados en esta categoría.
                  </td>
                </tr>
              ) : (
                jugadores.map((jugador, index) => (
  <tr 
    key={jugador.id} 
    className="hover:bg-gray-50 border-b cursor-pointer transition-colors"
    onClick={() => navigate(`/jugador/${jugador.id}`)}
  >
    <td className="p-4 font-bold text-gray-600 text-center">{index + 1}</td>
    <td className="p-4 flex items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3 overflow-hidden">
        {jugador.imagenPerfil ? (
          <img 
            src={`${import.meta.env.VITE_API_URL}${jugador.imagenPerfil}`} 
            alt="Perfil" 
            className="w-full h-full object-cover"
          />
        ) : (
          jugador.nombre.charAt(0).toUpperCase()
        )}
      </div>
      <span className="font-semibold text-gray-800">
        {jugador.nombre} {jugador.apellido}
      </span>
    </td>
    <td className="p-4 font-bold text-green-600 text-right">
      {jugador.puntosGenerales || 0} pts
    </td>
  </tr>
))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RankingScreen;