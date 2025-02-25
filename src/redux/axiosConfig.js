import axios from 'axios';



const baseURL = process.env.REACT_APP_ENV === 'remote'
    ? process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:5005'
    : process.env.REACT_APP_API_URL_REMOTE || 'http://10.100.1.80:5005';

console.log('Base URL configurada:', baseURL);


const api = axios.create({
    baseURL: process.env.REACT_APP_ENV === 'remote'
        ? process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:5005'
        : process.env.REACT_APP_API_URL_REMOTE || 'http://10.100.1.80:5005',
    withCredentials: true, // PERMITIR ENVIAR COOKIES Y CREDENCIALES
});


// Interceptores
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/home';
                    return Promise.reject(error);
                }

                const response = await axios.post(`${baseURL}/refresh`, { refreshToken });
                const newAccessToken = response.data.accessToken;

                localStorage.setItem('token', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                console.error('Error al refrescar el token:', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/home';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
