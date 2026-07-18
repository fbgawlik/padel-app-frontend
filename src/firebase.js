// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBccqbPrbySmwUHsc27FxshnakI67opvU4",
  authDomain: "adn-padel-app.firebaseapp.com",
  projectId: "adn-padel-app",
  storageBucket: "adn-padel-app.firebasestorage.app",
  messagingSenderId: "313304050994",
  appId: "1:313304050994:web:951c0d29f8a96d18e8bb8b",
  measurementId: "G-1D2YDF7WMW"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const solicitarPermisoNotificaciones = async () => {
  try {
    // 1. Pedimos permiso al usuario
    const permiso = await Notification.requestPermission();
    
    if (permiso === "granted") {
      console.log("¡Permiso concedido para notificaciones!");

      // 2. Registramos el Service Worker usando un archivo que crearemos en src
      const registration = await navigator.serviceWorker.register(
        new URL('./sw.js', import.meta.url),
        { type: 'module' }
      );

      // 3. Le pedimos el Token a Firebase usando ese registro
      const token = await getToken(messaging, { serviceWorkerRegistration: registration });
      return token;
      
    } else {
      console.log("Permiso denegado por el usuario.");
    }
  } catch (error) {
    console.error("Error al configurar las notificaciones:", error);
  }
};