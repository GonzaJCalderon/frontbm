// utils/auth.js
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5005';

export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No hay refreshToken en localStorage');

    const res = await axios.post(`${baseURL}/usuarios/refresh`, { refreshToken });

    const { accessToken, refreshToken: newRefresh } = res.data;

    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', newRefresh);

    // También actualizá Axios con el nuevo token
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    return true;
  } catch (error) {
    console.warn('⛔ Falló el auto-refresh:', error.message);
    return false;
  }
};
