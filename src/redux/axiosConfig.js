import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5005';
console.log("🔥 API BASE URL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // ⏱️ 30 segundos de timeout para prevenir colgados eternos
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.code === 'ECONNABORTED') {
      console.warn('⏰ Timeout de la petición:', originalRequest.url);
      return Promise.reject({ message: 'Tiempo de espera agotado. Intenta nuevamente.' });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.warn('⚠️ No hay refresh token, no se puede renovar el acceso.');
          return Promise.reject(error);
        }
const response = await axios.post(`${baseURL}/usuarios/refresh`, { refreshToken });

        const newAccessToken = response.data.accessToken;

        localStorage.setItem('authToken', newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest); // 🔁 RETRY
      } catch (refreshError) {
        console.error('❌ Falló el refresh del token:', refreshError);

        if (
          refreshError.response?.status === 401 || 
          refreshError.response?.status === 403
        ) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');

          window.location.href = '/home'; // o '/login'
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



export default api;
