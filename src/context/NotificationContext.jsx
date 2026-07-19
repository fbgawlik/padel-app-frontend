import React, { createContext, useState, useCallback, useContext } from 'react';
import Toast from '../components/Toast';

export const NotificationContext = createContext();

// Hook personalizado para usarlo más fácilmente
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notificacion, setNotificacion] = useState(null);

  // Función que llamaremos desde otras pantallas
  const mostrarNotificacion = useCallback((mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
  }, []);

  const cerrarNotificacion = useCallback(() => {
    setNotificacion(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ mostrarNotificacion }}>
      {children}
      
      {/* Si hay una notificación en el estado, renderizamos el Toast */}
      {notificacion && (
        <Toast 
          mensaje={notificacion.mensaje} 
          tipo={notificacion.tipo} 
          onClose={cerrarNotificacion} 
        />
      )}
    </NotificationContext.Provider>
  );
};