import axios from 'axios';

// Crear una instancia de Axios
const api = axios.create({
    baseURL: 'http://localhost:5000', // URL base de tu API
    withCredentials: true, // Habilita el envío de cookies
});

// Agregar un interceptor para incluir el token en los encabezados
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Incluir el token en el encabezado
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Agregar un interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response, // Devolver la respuesta si todo está bien
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token'); // Eliminar el token
            window.location.href = '/login'; // Redirige al usuario a la página de inicio de sesión
        }
        return Promise.reject(error);
    }
);

export default api;
