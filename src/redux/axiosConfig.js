import axios from 'axios';

// Determinar la URL base según el entorno
const baseURL =
    process.env.REACT_APP_DB_USE === 'remote'
        ? process.env.REACT_APP_API_URL_REMOTE
        : process.env.REACT_APP_API_URL_LOCAL;

if (!baseURL) {
    console.error('Error: La baseURL no está configurada correctamente. Verifica las variables de entorno.');
}

// Crear una instancia de Axios
const api = axios.create({
    baseURL,
    withCredentials: true, // Habilita el envío de cookies si es necesario
});

// Interceptores (no necesitas modificarlos porque ya están bien escritos)


// Agregar un interceptor para incluir el token en los encabezados
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

// Agregar un interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el error es un 401 (Token expirado) y no se ha reintentado aún
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Si no hay refresh token, redirige al login
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/home';
                    return Promise.reject(error);
                }

                // Solicitar un nuevo access token usando el refresh token
                const response = await axios.post(`${baseURL}/refresh`, { refreshToken });
                const newAccessToken = response.data.accessToken;

                // Guardar el nuevo token en localStorage
                localStorage.setItem('token', newAccessToken);

                // Actualizar el header de la solicitud original
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Reintentar la solicitud original
                return api(originalRequest);
            } catch (refreshError) {
                console.error('Error al refrescar el token:', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/home'; // Redirige al login
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
