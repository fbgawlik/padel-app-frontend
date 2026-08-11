import { precacheAndRoute } from 'workbox-precaching';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

precacheAndRoute(self.__WB_MANIFEST || []);

const firebaseConfig = {
  apiKey: 'AIzaSyBccqbPrbySmwUHsc27FxshnakI67opvU4',
  authDomain: 'adn-padel-app.firebaseapp.com',
  projectId: 'adn-padel-app',
  storageBucket: 'adn-padel-app.firebasestorage.app',
  messagingSenderId: '313304050994',
  appId: '1:313304050994:web:951c0d29f8a96d18e8bb8b',
  measurementId: 'G-1D2YDF7WMW'
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification?.title || 'Notificación ADN Pádel';
  const notificationOptions = {
    body: payload.notification?.body || 'Tenés novedades en la app.',
    icon: '/logo-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
