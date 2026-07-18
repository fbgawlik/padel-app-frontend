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

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const solicitarPermisoNotificaciones = async () => {
  try {
    const permiso = await Notification.requestPermission();
    
    if (permiso === "granted") {
      console.log("¡Permiso concedido para notificaciones!");

      const registration = await navigator.serviceWorker.register(
        new URL('./components/sw.js', import.meta.url), // Tu ruta corregida
        { type: 'module' }
      );

      // 👇 AQUÍ PASAMOS LA CLAVE QUE ACABAS DE GENERAR 👇
      const token = await getToken(messaging, { 
        serviceWorkerRegistration: registration,
        vapidKey: "BNGGi8Ko99YSFDHm8WLY_UgAG0xIY2RjxhUbZ4kFYynFCpLIU01-vIS6gXajctwDEVyT9-fgf4ESOTc_srHPbKo" 
      });
      
      return token;
      
    } else {
      console.log("Permiso denegado por el usuario.");
    }
  } catch (error) {
    console.error("Error al configurar las notificaciones:", error);
  }
};