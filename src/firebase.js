import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBCCqRPhbySnmUHsCC72sthnaXl67npVO4",
  authDomain: "adn-padel-app.firebaseapp.com",
  projectId: "adn-padel-app",
  storageBucket: "adn-padel-app.firebasestorage.app",
  messagingSenderId: "313304050994",
  appId: "1:313304058994:web:951c0692f8a96d106886eb",
  measurementId: "G-1DZR0F7WHN"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const solicitarPermisoNotificaciones = async () => {
  try {
    const permiso = await Notification.requestPermission();
    
    if (permiso === "granted") {
      console.log("¡Permiso concedido para notificaciones!");

      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );

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

// --- AGREGAR ESTA FUNCIÓN AL FINAL ---
export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};