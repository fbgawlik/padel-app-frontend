// src/App.jsx
import React, { useEffect } from 'react'; // 1. Agregamos useEffect aquí
import { AuthProvider } from './context/AuthContext'; 
import AppRoutes from './routes/AppRoutes'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 2. Importamos tu función de Firebase
import { solicitarPermisoNotificaciones } from './firebase'; 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  // 3. Añadimos el disparador de permisos aquí afuera de las rutas
  useEffect(() => {
    const activarNotificaciones = async () => {
      console.log("Solicitando permisos desde App.jsx...");
      const token = await solicitarPermisoNotificaciones();
      if (token) {
        console.log("¡Tenemos el token listo!", token);
      }
    };

    activarNotificaciones();
  }, []); // Los corchetes vacíos hacen que solo se ejecute una vez al cargar la web

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes /> {/* Tus rutas siguen funcionando exactamente igual */}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;