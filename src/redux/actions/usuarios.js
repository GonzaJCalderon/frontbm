import axios from 'axios';
import api from '../axiosConfig';
import { createAsyncThunk } from '@reduxjs/toolkit';

import {
    FETCH_USUARIOS_REQUEST,
    FETCH_USUARIOS_SUCCESS,
    FETCH_USUARIOS_ERROR,
    FETCH_USUARIO_DETAILS_REQUEST,
    FETCH_USUARIO_DETAILS_SUCCESS,
    FETCH_USUARIO_DETAILS_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    REGISTER_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    ADD_USUARIO_REQUEST,
    ADD_USUARIO_SUCCESS,
    ADD_USUARIO_ERROR,
    FETCH_COMPRAS_VENTAS_REQUEST,
    FETCH_COMPRAS_VENTAS_SUCCESS,
    FETCH_COMPRAS_VENTAS_ERROR,
    DELETE_USUARIO_REQUEST,
    DELETE_USUARIO_SUCCESS,
    DELETE_USUARIO_ERROR,
    ASSIGN_ROLE_REQUEST,
    ASSIGN_ROLE_SUCCESS,
    ASSIGN_ROLE_ERROR,
    RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_ERROR,
    SEARCH_REQUEST,
    SEARCH_SUCCESS,
    SEARCH_ERROR, 
    SET_USER_DETAILS,
    UPDATE_USER_REQUEST, 
    UPDATE_USER_SUCCESS, 
    UPDATE_USER_ERROR, 
    BUSCAR_USUARIO_DNI_REQUEST,
    BUSCAR_USUARIO_DNI_SUCCESS,
    BUSCAR_USUARIO_DNI_ERROR,
    BUSCAR_VENDEDOR_FAIL,
    BUSCAR_VENDEDOR_SUCCESS,
    BUSCAR_VENDEDOR_REQUEST ,
    FETCH_TRANSACCIONES_REQUEST, 
    FETCH_TRANSACCIONES_SUCCESS, 
    FETCH_TRANSACCIONES_ERROR 
} from './actionTypes';

// Define getToken at the top of your file
const getToken = () => localStorage.getItem('token');

// Obtener usuarios
export const fetchUsuarios = (pageNumber) => async dispatch => {
    dispatch({ type: FETCH_USUARIOS_REQUEST });
    try {
        const response = await api.get(`/usuarios?page=${pageNumber}`);
        console.log('Respuesta de la API:', response.data); // Verifica que la respuesta contenga los datos esperados

        const data = Array.isArray(response.data) ? response.data : [];
        dispatch({
            type: FETCH_USUARIOS_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: FETCH_USUARIOS_ERROR,
            error: error.response ? error.response.data : error.message
        });
    }
};

// Obtener detalles de usuario
export const fetchUsuarioDetails = (id) => async (dispatch) => {
    dispatch({ type: FETCH_USUARIO_DETAILS_REQUEST });
    try {
        const token = getToken();
        if (!token) {
            console.error('No token found in localStorage');
            throw new Error('No token found');
        }
        console.log('Token enviado:', token);

        const response = await api.get(`/usuarios/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        dispatch({ type: FETCH_USUARIO_DETAILS_SUCCESS, payload: response.data });
    } catch (error) {
        console.error('Error al obtener los detalles del usuario:', error);
        dispatch({ type: FETCH_USUARIO_DETAILS_FAILURE, payload: error.message });
    }
};

// Login
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password, rolTemporal }, { rejectWithValue }) => {
      try {
        console.log('Datos enviados al backend:', { email, password, rolTemporal });
        const response = await api.post('/usuarios/login', { email, password, rolTemporal });
        console.log('Respuesta del backend:', response.data); // Verifica la respuesta
        return {
          usuario: response.data.usuario,  // Asegúrate de estructurarlo así
          token: response.data.token
        };
      } catch (error) {
        console.error('Error en la solicitud de login:', error);
        return rejectWithValue(error.response.data);
      }
    }
);

// Logout
export const logout = () => dispatch => {
    localStorage.removeItem('token');
    dispatch({ type: LOGOUT });
};

// Registro
export const register = (newUser) => async dispatch => {
    dispatch({ type: REGISTER_REQUEST });
    try {
        const response = await api.post('/register', newUser);
        dispatch({
            type: REGISTER_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: REGISTER_FAIL,
            error: error.response ? error.response.data : error.message
        });
    }
};

// Agregar usuario
export const addUsuario = (newUser) => async dispatch => {
    dispatch({ type: ADD_USUARIO_REQUEST });
    console.log("Datos enviados al backend:", newUser); // Log de datos enviados al backend

    try {
        const response = await api.post('/usuarios/register-usuario-por-tercero', newUser);
        console.log("Respuesta del backend:", response.data); // Log de respuesta del backend

        if (response.data && response.data.usuario) {
            dispatch({
                type: ADD_USUARIO_SUCCESS,
                payload: response.data.usuario
            });
            return response.data;
        } else {
            throw new Error('Estructura de respuesta inesperada');
        }
    } catch (error) {
        console.log("Error al registrar usuario:", error.response ? error.response.data : error.message); // Log de error
        dispatch({
            type: ADD_USUARIO_ERROR,
            error: error.response ? error.response.data : { message: error.message }
        });
        throw error; // Re-lanzar el error para manejo en el componente
    }
};






// Acción para obtener compras y ventas de usuario
// Acción para obtener compras y ventas de usuario
export const fetchUsuarioComprasVentas = (userId) => async (dispatch) => {
    if (!userId) {
        console.error('El userId es null o undefined');
        return;
    }

    dispatch({ type: FETCH_COMPRAS_VENTAS_REQUEST });

    try {
        const response = await api.get(`/bienes/transacciones/usuario/${userId}`);
        console.log('Response Data:', response.data);

        if (Array.isArray(response.data)) {
            dispatch({
                type: FETCH_COMPRAS_VENTAS_SUCCESS,
                payload: {
                    bienesComprados: response.data.filter(item => item.compradorId === userId),
                    bienesVendidos: response.data.filter(item => item.vendedorId === userId),
                }
            });
        } else {
            console.error('Error: Los datos de respuesta no son un array');
            dispatch({
                type: FETCH_COMPRAS_VENTAS_ERROR,
                payload: 'Los datos de respuesta no son un array',
            });
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        console.error('Error al obtener compras y ventas:', errorMessage);
        dispatch({
            type: FETCH_COMPRAS_VENTAS_ERROR,
            payload: errorMessage,
        });
    }
};



// Acción para que el administrador obtenga las transacciones de un usuario específico
// Acción para que el administrador obtenga las transacciones de un usuario específico
export const fetchTransaccionesByAdmin = (userId) => async (dispatch) => {
    if (!userId) {
        console.error('El userId proporcionado es null o undefined');
        return;
    }

    dispatch({ type: FETCH_TRANSACCIONES_REQUEST });

    try {
        // Realiza la petición al backend utilizando el userId del usuario que el admin desea consultar
        const response = await api.get(`/bienes/transacciones/usuario/${userId}`);
        console.log('Response Data:', response.data);  // Verifica que la respuesta sea la esperada

        // Verifica si response.data es un array de transacciones
        if (Array.isArray(response.data)) {
            dispatch({
                type: FETCH_TRANSACCIONES_SUCCESS,
                payload: {
                    userId,
                    bienesComprados: response.data.filter(item => item.compradorId === parseInt(userId)),  // Asegura que los IDs sean comparados correctamente
                    bienesVendidos: response.data.filter(item => item.vendedorId === parseInt(userId)),
                }
            });
        } else {
            console.error('Error: Los datos de respuesta no son un array');
            dispatch({
                type: FETCH_TRANSACCIONES_ERROR,
                payload: 'Los datos de respuesta no son un array',
            });
        }
    } catch (error) {
        // Manejo del error de manera más robusta
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        console.error('Error al obtener transacciones para el usuario:', errorMessage);
        dispatch({
            type: FETCH_TRANSACCIONES_ERROR,
            payload: errorMessage,
        });
    }
};




// Acción para eliminar un usuario
export const deleteUsuario = (userId) => async dispatch => {
    dispatch({ type: DELETE_USUARIO_REQUEST });
    try {
        await api.delete(`/usuarios/${userId}`);
        dispatch({ type: DELETE_USUARIO_SUCCESS, payload: userId });
    } catch (error) {
        dispatch({ type: DELETE_USUARIO_ERROR, payload: error.message });
    }
};

// Asignar rol a usuario
export const assignRole = (userId, role) => async dispatch => {
    dispatch({ type: ASSIGN_ROLE_REQUEST });
    try {
        const response = await api.patch(`/usuarios/${userId}/rol`, { rol: role });
        dispatch({
            type: ASSIGN_ROLE_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        console.error('Error assigning role:', error);
        dispatch({
            type: ASSIGN_ROLE_ERROR,
            error: error.response ? error.response.data : error.message
        });
    }
};

// Resetear contraseña
export const resetPassword = (userId) => async dispatch => {
    dispatch({ type: RESET_PASSWORD_REQUEST });
    try {
        await api.post(`/usuarios/${userId}/reset-password`);
        dispatch({ type: RESET_PASSWORD_SUCCESS });
    } catch (error) {
        dispatch({ type: RESET_PASSWORD_ERROR, payload: error.message });
    }
};

// Acción para actualizar un usuario
export const updateUser = (userId, userData) => async dispatch => {
    dispatch({ type: UPDATE_USER_REQUEST });
    try {
        const response = await api.put(`/usuarios/${userId}`, userData);
        dispatch({ type: UPDATE_USER_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: UPDATE_USER_ERROR, payload: error.message });
    }
};

// Acción para buscar items
export const searchItems = (query) => async dispatch => {
    dispatch({ type: SEARCH_REQUEST });
    try {
        const response = await api.get(`/items/search?query=${query}`);
        dispatch({
            type: SEARCH_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: SEARCH_ERROR,
            payload: error.message
        });
    }
};

// Buscar usuario por DNI
export const buscarUsuarioPorDni = (dni) => async dispatch => {
    dispatch({ type: BUSCAR_USUARIO_DNI_REQUEST });
    try {
        const response = await api.get(`/usuarios/dni?dni=${dni}`);
        dispatch({
            type: BUSCAR_USUARIO_DNI_SUCCESS,
            payload: response.data
        });
        return response; // Asegúrate de devolver la respuesta
    } catch (error) {
        dispatch({
            type: BUSCAR_USUARIO_DNI_ERROR,
            error: error.response ? error.response.data : error.message
        });
        return { error: error.response ? error.response.data : error.message }; // Manejo de errores
    }
};


// Buscar vendedor
export const buscarVendedor = (dni) => async dispatch => {
    dispatch({ type: BUSCAR_VENDEDOR_REQUEST });
    try {
        const response = await api.get(`/usuarios/vendedores/dni?dni=${dni}`);
        dispatch({
            type: BUSCAR_VENDEDOR_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: BUSCAR_VENDEDOR_FAIL,
            payload: error.message
        });
    }
};
