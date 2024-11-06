import axios from 'axios';
import api from '../axiosConfig';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';

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
    FETCH_TRANSACCIONES_ERROR,
    FETCH_PENDING_REGISTRATIONS_REQUEST,
    FETCH_PENDING_REGISTRATIONS_SUCCESS,
    FETCH_PENDING_REGISTRATIONS_ERROR,
    APPROVE_REGISTRATION_REQUEST,
    APPROVE_REGISTRATION_SUCCESS,
    APPROVE_REGISTRATION_ERROR,
    DENY_REGISTRATION_REQUEST,
    DENY_REGISTRATION_SUCCESS,
    DENY_REGISTRATION_ERROR,
    FETCH_APPROVED_USERS_REQUEST,
    FETCH_APPROVED_USERS_SUCCESS,
    FETCH_APPROVED_USERS_FAILURE,
    FETCH_REJECTED_USERS_REQUEST,
    FETCH_REJECTED_USERS_SUCCESS,
    FETCH_REJECTED_USERS_ERROR,
    APPROVE_USER_REQUEST, 
    APPROVE_USER_SUCCESS, 
    APPROVE_USER_ERROR,
    CHECK_USER_REQUEST, 
    CHECK_USER_SUCCESS,
     CHECK_USER_ERROR
    
} from './actionTypes';

// Define getToken at the top of your file
const getToken = () => localStorage.getItem('token');

// Obtener usuarios
export const fetchUsuarios = (pageNumber = 1) => async dispatch => {
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

// Definición de la función getCurrentUserId
const getCurrentUserId = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? currentUser.id : null;
};

// Asegúrate de que la función esté definida antes de ser utilizada
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

        // Almacena los datos en el localStorage para el usuario activo
        if (id === getCurrentUserId()) { // Verifica si el ID corresponde al usuario actual
            localStorage.setItem('currentUser', JSON.stringify(response.data));
        }

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
export const obtenerTransacciones = async (userId, isAdmin) => {
    try {
        const response = await api.get(`/bienes/transacciones/usuario/${userId}`);
        console.log('Respuesta de transacciones:', response.data); // Agrega este log para depuración
        if (Array.isArray(response.data)) {
            return response.data.map(transaccion => {
                return {
                    ...transaccion,
                    esAdmin: isAdmin
                };
            });
        }
        throw new Error('No se encontraron transacciones.');
    } catch (error) {
        console.error('Error en obtenerTransacciones:', error); // Log para depuración
        throw new Error(error.message);
    }
};



// Acción para el Administrador
export const fetchTransaccionesByAdmin = (userId) => async (dispatch) => {
    dispatch({ type: FETCH_TRANSACCIONES_REQUEST });
    try {
        const response = await api.get(`bienes/transacciones/usuario/${userId}`);
        console.log('Respuesta de la API:', response.data); // Agrega este log para depuración

        if (!Array.isArray(response.data)) {
            throw new Error('La respuesta no es un array de transacciones.');
        }

        dispatch({ type: FETCH_TRANSACCIONES_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_TRANSACCIONES_ERROR, payload: error.message });
    }
};



// Acción para Compras y Ventas
export const fetchUsuarioComprasVentas = (userId) => async (dispatch) => {
    if (!userId) {
        console.error('El userId es null o undefined');
        return;
    }

    dispatch({ type: FETCH_COMPRAS_VENTAS_REQUEST });

    try {
        const transacciones = await obtenerTransacciones(userId);
        dispatch({
            type: FETCH_COMPRAS_VENTAS_SUCCESS,
            payload: {
                bienesComprados: transacciones.filter(item => item.compradorId === userId),
                bienesVendidos: transacciones.filter(item => item.vendedorId === userId),
            }
        });
    } catch (error) {
        const errorMessage = error.message || 'Error desconocido';
        console.error('Error al obtener compras y ventas:', errorMessage);
        dispatch({ type: FETCH_COMPRAS_VENTAS_ERROR, payload: errorMessage });
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



export const fetchPendingRegistrations = () => async (dispatch) => {
    dispatch({ type: FETCH_PENDING_REGISTRATIONS_REQUEST });
    try {
        const response = await api.get(`usuarios/usuarios/pendientes`); // Ajusta según tu API
        dispatch({ type: FETCH_PENDING_REGISTRATIONS_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_PENDING_REGISTRATIONS_ERROR, error: error.message });
    }
};

export const approveUser = (userId) => async (dispatch) => {
    dispatch({ type: APPROVE_USER_REQUEST });
    try {
        const response = await api.put(`usuarios/${userId}/aprobar`); // Verifica que esta ruta sea correcta
        dispatch({ type: APPROVE_USER_SUCCESS, payload: response.data.usuario });
    } catch (error) {
        dispatch({ type: APPROVE_USER_ERROR, error: error.message });
    }
};


export const fetchApprovedUsers = () => {
    return async (dispatch) => {
        dispatch({ type: FETCH_APPROVED_USERS_REQUEST });
        try {
            const response = await api.get('usuarios/usuarios/aprobados'); // Asegúrate de que esta URL sea correcta
            dispatch({
                type: FETCH_APPROVED_USERS_SUCCESS,
                payload: response.data, // Asegúrate de que la respuesta contenga el array de usuarios
            });
        } catch (error) {
            dispatch({
                type: FETCH_APPROVED_USERS_FAILURE,
                payload: error.message,
            });
        }
    };
};

export const denyRegistration = (userId, motivoRechazo, adminId) => async (dispatch) => {
    dispatch({ type: DENY_REGISTRATION_REQUEST });
    try {
        console.log("Datos a enviar:", { userId, motivoRechazo, adminId }); // Asegúrate de que estos datos sean correctos
        await api.put(`usuarios/${userId}/rechazar`, { motivoRechazo, rechazadoPor: adminId }); // Cambia 'reason' por 'motivoRechazo'
        dispatch({ type: DENY_REGISTRATION_SUCCESS, payload: { id: userId } });
    } catch (error) {
        dispatch({ type: DENY_REGISTRATION_ERROR, error: error.message });
    }
};



export const fetchRejectedUsers = () => async (dispatch) => {
    dispatch({ type: FETCH_REJECTED_USERS_REQUEST });
    
    try {
        const response = await api.get('usuarios/usuarios/rechazados'); // Asegúrate de que esta sea la ruta correcta
        dispatch({
            type: FETCH_REJECTED_USERS_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: FETCH_REJECTED_USERS_ERROR,
            error: error.message,
        });
    }
};

// Acción para verificar si el usuario existe
export const checkExistingUser = (dni, email) => async (dispatch) => {
    dispatch({ type: CHECK_USER_REQUEST });
  
    try {
      const response = await api.post('usuarios/check', { dni, email });
  
      if (response.data.existe) {
        dispatch({
          type: CHECK_USER_SUCCESS,
          payload: response.data.usuario,
        });
        return response.data;  // Regresa la respuesta
      } else {
        dispatch({
          type: CHECK_USER_SUCCESS,
          payload: null,
        });
        return { usuario: null };  // Devuelve null si no existe el usuario
      }
    } catch (error) {
      dispatch({
        type: CHECK_USER_ERROR,
        error: error.message,
      });
      throw error; // Lanza el error para que el componente lo maneje
    }
  };
  