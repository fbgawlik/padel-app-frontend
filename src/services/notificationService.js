import API from './api';

export const registerFcmToken = async (token) => {
  return API.post('/usuarios/fcm-token', { token });
};

export const removeFcmToken = async () => {
  return API.delete('/usuarios/fcm-token');
};

export const sendNotification = async (destinatarioId, title, body, data = {}) => {
  return API.post('/usuarios/notificacion', { destinatarioId, title, body, data });
};
