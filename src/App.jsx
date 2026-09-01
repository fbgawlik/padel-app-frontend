// src/App.jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext'; 
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider> 
          <AppRoutes /> 
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;