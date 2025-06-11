// utils/auth.js
import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';
const baseURL = isLocalhost
  ? 'http://localhost:5005'
  : 'https://regbim.minsegmza.gob.ar';

export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No hay refreshToken en localStorage');

    const res = await axios.post(`${baseURL}/usuarios/refresh`, { refreshToken });

    const { accessToken, refreshToken: newRefresh } = res.data;

    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', newRefresh);

    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    return true;
  } catch (error) {
    console.warn('⛔ Falló el auto-refresh:', error.message);
    return false;
  }
};
