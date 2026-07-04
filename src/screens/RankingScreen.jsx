import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos useNavigate

const RankingScreen = () => {
  // Estados para manejar la información visual
  const [jugadores, setJugadores] = useState([]);
  const [categoria, setCategoria] = useState('5ta'); // Categoría por defecto
  const [cargando, setCargando] = useState(true);
  
  // 2. Inicializamos la navegación
  const navigate = useNavigate(); 

  // Array de categorías disponibles para el selector
  const categoriasDisponibles = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va'];

  // Efecto que se dispara al cargar la pantalla o al cambiar de categoría
  useEffect(() => {
    const cargarRanking = async () => {
      setCargando(true);
      try {
        // Asegurate de que el puerto coincida con tu backend (ej: 3000)
        const respuesta = await fetch(`http://localhost:3000/api/ranking?categoria=${categoria}`);
        
        if (!respuesta.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const data = await respuesta.json();
        setJugadores(data);
      } catch (error) {
        console.error("Error al obtener la tabla de posiciones:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarRanking();
  }, [categoria]); // El array de dependencias escucha los cambios en 'categoria'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Ranking Oficial</h1>

      {/* Selector de Categoría */}
      <div className="flex justify-center mb-8">
        <label className="mr-3 font-semibold self-center">Categoría:</label>
        <select 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)}
          className="border border-gray-300 rounded p-2 bg-white"
        >
          {categoriasDisponibles.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Pantalla de Carga */}
      {cargando ? (
        <p className="text-center text-gray-500">Cargando posiciones...</p>
      ) : (
        /* Tabla de Posiciones */
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 border-b">#</th>
                <th className="p-4 border-b">Jugador</th>
                <th className="p-4 border-b">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {jugadores.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    Aún no hay jugadores clasificados en esta categoría.
                  </td>
                </tr>
              ) : (
                jugadores.map((jugador, index) => (
                  // 3. Modificamos el <tr> con cursor-pointer y el evento onClick
                  <tr 
                    key={jugador.id} 
                    className="hover:bg-gray-50 border-b cursor-pointer transition-colors"
                    onClick={() => navigate(`/jugador/${jugador.usuarioId || jugador.usuario.id}`)}
                  >
                    <td className="p-4 font-bold text-gray-600">
                      {index + 1}
                    </td>
                    <td className="p-4 flex items-center">
                      {/* Foto de perfil con fallback si no tiene imagen */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold mr-3 overflow-hidden">
                        {jugador.usuario.imagenPerfil ? (
                          <img 
                            src={`http://localhost:3000${jugador.usuario.imagenPerfil}`} 
                            alt="Perfil" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // Muestra la primera letra del nombre si no hay foto
                          jugador.usuario.nombre.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium">
                        {jugador.usuario.nombre} {jugador.usuario.apellido}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      {jugador.puntos} pts
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