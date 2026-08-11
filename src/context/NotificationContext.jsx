import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import Toast from '../components/Toast';
import { AuthContext } from './AuthContext';
import { registerFcmToken } from '../services/notificationService';
import { solicitarPermisoNotificaciones, onMessageListener } from '../firebase';

export const NotificationContext = createContext();

// Hook personalizado para usarlo más fácilmente
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notificacion, setNotificacion] = useState(null);
  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    const registrarTokenFCM = async () => {
      if (!usuario) return;
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        return;
      }

      try {
        const token = await solicitarPermisoNotificaciones();
        if (!token) return;

        await registerFcmToken(token);
      } catch (error) {
        console.error('Error al registrar token FCM:', error);
      }
    };

    registrarTokenFCM();
  }, [usuario]);

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      const title = payload.notification?.title || 'Notificación ADN Pádel';
      const body = payload.notification?.body || 'Tenés novedades en la app.';
      setNotificacion({ mensaje: `${title}: ${body}`, tipo: 'info' });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

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