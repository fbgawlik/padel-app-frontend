importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBccqbPrbySmwUHsc27FxshnakI67opvU4',
  authDomain: 'adn-padel-app.firebaseapp.com',
  projectId: 'adn-padel-app',
  storageBucket: 'adn-padel-app.firebasestorage.app',
  messagingSenderId: '313304050994',
  appId: '1:313304050994:web:951c0d29f8a96d18e8bb8b',
  measurementId: 'G-1D2YDF7WMW'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification?.title || 'Notificación ADN Pádel';
  const notificationOptions = {
    body: payload.notification?.body || 'Tenés novedades en la app.',
    icon: '/logo-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
