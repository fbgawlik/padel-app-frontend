import React from 'react';
import { AuthProvider } from './context/AuthContext'; 
import AppRoutes from './routes/AppRoutes'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita que recargue datos solo por cambiar de pestaña
      staleTime: 1000 * 60 * 5,    // Mantiene los datos en caché por 5 minutos sin volver a pedir
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;