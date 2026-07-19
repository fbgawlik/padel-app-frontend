// src/App.jsx
import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext'; 
import { NotificationProvider } from './context/NotificationContext'; // 1. <-- Importamos el nuevo Provider
import AppRoutes from './routes/AppRoutes'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  useEffect(() => {
    const activarNotificaciones = async () => {
      console.log("Solicitando permisos desde App.jsx...");
      const token = await solicitarPermisoNotificaciones();
      if (token) {
        console.log("¡Tenemos el token listo!", token);
      }
    };

    activarNotificaciones();
  }, []); 

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* 2. <-- Envolvemos AppRoutes con nuestro NotificationProvider */}
        <NotificationProvider> 
          <AppRoutes /> 
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;