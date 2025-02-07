
import axios from 'axios';
import api from '../axiosConfig';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification, message  } from 'antd';

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
    FETCH_APPROVED_USERS_ERROR,
    
    FETCH_APPROVED_USERS_FAILURE,
    FETCH_REJECTED_USERS_REQUEST,
    FETCH_REJECTED_USERS_SUCCESS,
    FETCH_REJECTED_USERS_ERROR,
    APPROVE_USER_REQUEST, 
    APPROVE_USER_SUCCESS, 
    APPROVE_USER_ERROR,
    CHECK_USER_REQUEST, 
    CHECK_USER_SUCCESS,
     CHECK_USER_ERROR, 
     REGISTER_USER_THIRD_PARTY_REQUEST,
  REGISTER_USER_THIRD_PARTY_SUCCESS,
  REGISTER_USER_THIRD_PARTY_ERROR,
  REENVIAR_REGISTRO_REQUEST, 
  REENVIAR_REGISTRO_SUCCESS,
   REENVIAR_REGISTRO_ERROR,
   REINTENTAR_REGISTRO_REQUEST, 
   REINTENTAR_REGISTRO_SUCCESS, 
   REINTENTAR_REGISTRO_ERROR
  
    
} from './actionTypes';

// Define getToken at the top of your file
const getToken = () => localStorage.getItem('token');

// Obtener usuarios
export const fetchUsuarios = () => async (dispatch) => {
  dispatch({ type: FETCH_USUARIOS_REQUEST });

  try {
    const response = await api.get('/usuarios');

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("La respuesta de la API no es válida.");
    }

    dispatch({
      type: FETCH_USUARIOS_SUCCESS,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    dispatch({
      type: FETCH_USUARIOS_ERROR,
      payload: error.response?.data?.message || "Error desconocido al obtener usuarios.",
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
  dispatch({ type: 'FETCH_USUARIO_DETAILS_REQUEST' });
  try {
    const token = localStorage.getItem('authToken');
    const response = await api.get(`/usuarios/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: 'FETCH_USUARIO_DETAILS_SUCCESS', payload: response.data });
    return response.data; // Importante para usarlo en el componente
  } catch (error) {
    dispatch({ type: 'FETCH_USUARIO_DETAILS_FAILURE', payload: error.message });
    throw error; // Propaga el error al componente
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
    
    console.log("Estructura de newUser antes de enviar al backend:", newUser);
  
    // Verificación de campos obligatorios
    const requiredFields = ['dni', 'cuit', 'nombre', 'apellido', 'email', 'direccion', 'tipo'];
    for (let field of requiredFields) {
      if (!newUser[field]) {
        console.error(`Falta el campo: ${field}`);
        dispatch({
          type: ADD_USUARIO_ERROR,
          error: `Falta el campo: ${field}`
        });
        return; // Detiene el proceso si falta algún campo
      }
    }
  
    // Asegurar que los campos de dirección estén presentes
    if (!newUser.direccion || !newUser.direccion.calle || !newUser.direccion.altura || !newUser.direccion.departamento) {
      console.error('Faltan campos en la dirección');
      dispatch({
        type: ADD_USUARIO_ERROR,
        error: 'Faltan campos en la dirección'
      });
      return;
    }
  
    // Asignar valor por defecto a password si no está presente
    if (!newUser.password) {
      newUser.password = 'default_password'; // Valor por defecto para la contraseña
    }
  
    try {
      const response = await api.post('/usuarios/register-usuario-por-tercero', {
        dni: newUser.dni,
        cuit: newUser.cuit,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        direccion: {
          calle: newUser.direccion.calle,
          altura: newUser.direccion.altura,
          barrio: newUser.direccion.barrio || '', // Valor por defecto para el barrio
          departamento: newUser.direccion.departamento,
        },
        password: newUser.password,
        tipo: newUser.tipo,
        razonSocial: newUser.tipo === 'juridica' ? newUser.razonSocial || '' : undefined,
      });
  
      console.log("Respuesta del backend:", response.data);
  
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
      console.log("Error al registrar usuario:", error.response ? error.response.data : error.message);
      dispatch({
        type: ADD_USUARIO_ERROR,
        error: error.response ? error.response.data : { message: error.message }
      });
      throw error;
    }
  };
  
  



// Acción para obtener compras y ventas de usuario
export const obtenerTransacciones = async (uuid) => {
    try {
      const response = await api.get(`/transacciones/usuario/${uuid}`);
      console.log('Transacciones obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en obtenerTransacciones:', error);
      throw new Error(error.response?.data?.message || 'Error al cargar las transacciones.');
    }
  };
  
  



// Acción para el Administrador
export const fetchTransaccionesByAdmin = (uuid) => async (dispatch) => {
  try {
      const response = await api.get(`/transacciones/usuario/${uuid}`);
      dispatch({ type: 'FETCH_TRANSACCIONES_SUCCESS', payload: response.data });
  } catch (error) {
      console.error('Error fetching transactions:', error);
      dispatch({ type: 'FETCH_TRANSACCIONES_ERROR', payload: error.message });
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
export const deleteUsuario = (uuid) => async (dispatch) => {
  dispatch({ type: 'DELETE_USUARIO_REQUEST' });

  try {
    await api.delete(`/usuarios/${uuid}`); // Asegúrate de que el uuid se envíe correctamente
    dispatch({ type: 'DELETE_USUARIO_SUCCESS', payload: uuid });
  } catch (error) {
    dispatch({ type: 'DELETE_USUARIO_ERROR', payload: error.message });
    throw error; // Lanza el error para que el componente lo maneje
  }
};


// Asignar rol a usuario
export const assignRole = (uuid, role) => async (dispatch) => {
  dispatch({ type: ASSIGN_ROLE_REQUEST });
  try {
    // Asegúrate de que `uuid` y `rolDefinitivo` son correctos
    console.log('Enviando PATCH a /usuarios/:uuid/rol:', uuid, 'con rol:', role);

    const response = await api.patch(`usuarios/usuarios/${uuid}/rol`, { rolDefinitivo: role });

    dispatch({
      type: ASSIGN_ROLE_SUCCESS,
      payload: response.data,
    });

    console.log('Rol actualizado exitosamente:', response.data);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Error al asignar rol';

    console.error('Error asignando rol:', errorMessage);

    dispatch({
      type: ASSIGN_ROLE_ERROR,
      payload: errorMessage,
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

// Redux Action - Actualizar Usuario
export const updateUser = (uuid, userData) => async (dispatch) => {
  dispatch({ type: 'UPDATE_USER_REQUEST' });

  try {
      const token = localStorage.getItem('authToken');

      const response = await api.put(`/usuarios/${uuid}`, userData, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      dispatch({ type: 'UPDATE_USER_SUCCESS', payload: response.data });

      notification.success({
          message: 'Usuario actualizado',
          description: 'Los datos del usuario fueron actualizados correctamente.',
      });

      return Promise.resolve(response.data);
  } catch (error) {
      const errorMessage =
          error.response?.data?.message || error.message || 'Error desconocido';

      console.error('Error en la actualización:', errorMessage);

      notification.error({
          message: 'Error al actualizar usuario',
          description: errorMessage,
      });

      dispatch({
          type: 'UPDATE_USER_ERROR',
          payload: errorMessage,
      });

      return Promise.reject(new Error(errorMessage));
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
      const response = await api.get('/usuarios/usuarios/pendientes'); // Ajusta la ruta si es necesario
      console.log("Usuarios pendientes obtenidos:", response.data);

      dispatch({
          type: FETCH_PENDING_REGISTRATIONS_SUCCESS,
          payload: response.data,
      });
  } catch (error) {
      console.error('Error al obtener usuarios pendientes:', error);
      dispatch({
          type: FETCH_PENDING_REGISTRATIONS_ERROR,
          error: error.message,
      });
  }
};





export const approveUser = (userUuid, data) => async (dispatch) => {
  dispatch({ type: 'APPROVE_USER_REQUEST' });

  try {
      const token = localStorage.getItem('token'); // Usar token si es necesario

      console.log('Payload enviado al backend:', data);

      const response = await api.put(`/usuarios/${userUuid}/aprobar`, data, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      dispatch({ type: 'APPROVE_USER_SUCCESS', payload: response.data });
      return response.data;
  } catch (error) {
      console.error('Error al aprobar usuario:', error.response?.data || error.message);
      dispatch({ type: 'APPROVE_USER_ERROR', payload: error.response?.data || error.message });
      throw error;
  }
};


export const denyRegistration = (userUuid, data) => async (dispatch) => {
  dispatch({ type: 'DENY_REGISTRATION_REQUEST' });

  try {
    const token = localStorage.getItem('token');

    console.log('Payload enviado al backend:', data);

    const response = await api.put(`/usuarios/${userUuid}/rechazar`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: 'DENY_REGISTRATION_SUCCESS', payload: response.data });
    return response.data;
  } catch (error) {
    console.error('Error al rechazar usuario:', error.response?.data || error.message);
    dispatch({ type: 'DENY_REGISTRATION_ERROR', payload: error.response?.data || error.message });
    throw error;
  }
};

export const fetchApprovedUsers = () => async (dispatch) => {
  dispatch({ type: 'FETCH_APPROVED_USERS_REQUEST' });
  try {
    const response = await api.get('/usuarios/usuarios/aprobados'); // Verifica la ruta correcta
    dispatch({ type: 'FETCH_APPROVED_USERS_SUCCESS', payload: response.data });
  } catch (error) {
    console.error("Error al obtener usuarios aprobados:", error);
    dispatch({ type: 'FETCH_APPROVED_USERS_ERROR', payload: error.message });
  }
};




export const fetchRejectedUsers = () => async (dispatch) => {
  try {
    const response = await api.get('/usuarios/usuarios/rechazados');
    dispatch({ type: 'FETCH_REJECTED_USERS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_REJECTED_USERS_FAILURE', payload: error.message });
  }
};





// Acción para verificar si el usuario existe
export const checkExistingUser = (params) => async (dispatch) => {
  try {
    console.log("Datos enviados a checkExistingUser:", params); // Log para verificar
    const { dni, nombre, apellido } = params;

    if (!dni || !nombre || !apellido) {
      throw new Error("DNI, nombre y apellido son requeridos.");
    }

    const response = await api.post("/usuarios/check", { dni, nombre, apellido });
    return response.data;
  } catch (error) {
    console.error("Error en checkExistingUser:", error.message);
    throw error;
  }
};

// Acción para enviar el enlace de actualización de cuenta
export const sendUpdateAccountLink = (userId) => async () => {
  try {
    const response = await axios.post('/usuarios/send-update-link', { userId });
    message.success(response.data.mensaje || 'Enlace enviado con éxito.');
  } catch (error) {
    const errorMsg = error.response?.data?.mensaje || 'Error al enviar el enlace de actualización.';
    message.error(errorMsg);
    throw new Error(errorMsg);
  }
};


export const registerUsuarioPorTercero = (usuarioData) => async (dispatch) => {
  dispatch({ type: REGISTER_USER_THIRD_PARTY_REQUEST });

  try {
      const token = localStorage.getItem('token');
      if (!token) {
          throw new Error('Token no disponible.');
      }

      const response = await api.post(
          '/usuarios/register-usuario-por-tercero',
          usuarioData,
          {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          }
      );

      if (response.data?.usuario) {
          dispatch({
              type: REGISTER_USER_THIRD_PARTY_SUCCESS,
              payload: response.data.usuario,
          });

          return response.data.usuario; // Asegúrate de retornar el usuario registrado
      }

      throw new Error('No se pudo registrar el usuario.');
  } catch (error) {
      dispatch({
          type: REGISTER_USER_THIRD_PARTY_ERROR,
          error: error.message,
      });
      throw error; // Propaga el error para manejarlo en el UI
  }
};

  
  // Acción para obtener historial de cambios
export const fetchHistorialCambios = async (uuid) => {
  try {
    const response = await api.get(`/historialcambios/historial-cambios/${uuid}`);
    console.log('Respuesta de la API:', response.data); // Verifica que sea un array
    return response.data; // Devuelve los datos directamente
  } catch (error) {
    console.error('Error al obtener historial de cambios:', error.message);
    throw error; // Propaga el error para manejarlo en el componente
  }
};
  
export const reenviarRegistro = (uuid, formData) => async (dispatch) => {
  try {
    const response = await api.put(`/usuarios/${uuid}/reenviar`, formData);
    dispatch({
      type: 'REENVIAR_REGISTRO_EXITO',
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Error en reenviarRegistro:', error.response || error.message);
    throw new Error(error.response?.data?.message || 'Error al reenviar registro.');
  }
};


export const fetchRenaperData = (dni) => async (dispatch) => {
  dispatch({ type: 'FETCH_RENAPER_REQUEST' });

  try {
      const { data } = await api.get(`/renaper/renaper/${dni}`);
      if (data.success) {
          dispatch({ type: 'FETCH_RENAPER_SUCCESS', payload: data.data.persona });
          return data.data.persona;
      } else {
          dispatch({ type: 'FETCH_RENAPER_FAILURE', payload: data.message || 'Error al buscar los datos.' });
          throw new Error(data.message || 'Error al buscar los datos.');
      }
  } catch (error) {
      dispatch({
          type: 'FETCH_RENAPER_FAILURE',
          payload: error.response?.data?.message || 'Error inesperado.',
      });
      throw error;
  }
};

export const reintentarRegistro = (uuid, formData) => async (dispatch) => {
  dispatch({ type: REINTENTAR_REGISTRO_REQUEST });

  try {
    // Validar parámetros antes de enviar
    if (!uuid) {
      throw new Error('UUID del usuario es requerido.');
    }

    if (!formData || Object.keys(formData).length === 0) {
      throw new Error('Los datos del formulario son requeridos.');
    }

    console.log('Enviando datos para reintentar registro:', { uuid, formData });

    // Realizar la solicitud al backend
    const response = await api.put(`/usuarios/${uuid}/reintentar`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Agregar token de autenticación
        'Content-Type': 'application/json', // Asegurar el tipo de contenido
      },
    });

    // Manejo exitoso
    dispatch({
      type: REINTENTAR_REGISTRO_SUCCESS,
      payload: response.data,
    });

    // Mostrar notificación de éxito
    notification.success({
      message: 'Registro reenviado',
      description: 'Tu registro ha sido reenviado correctamente para revisión.',
    });

    return response.data; // Retornar datos al componente si es necesario
  } catch (error) {
    // Log detallado del error
    console.error('Error en reintentarRegistro:', {
      errorData: error.response?.data,
      errorStatus: error.response?.status,
      errorMessage: error.message,
    });

    // Preparar mensaje de error
    const errorMessage = error.response?.data?.message || 'Error al reintentar registro.';

    // Dispatch del error a Redux
    dispatch({
      type: REINTENTAR_REGISTRO_ERROR,
      payload: errorMessage,
    });

    // Mostrar notificación de error
    notification.error({
      message: 'Error',
      description: errorMessage,
    });

    // Lanzar el error para manejarlo en el componente
    throw new Error(errorMessage);
  }
};

