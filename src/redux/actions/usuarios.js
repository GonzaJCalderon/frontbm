
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
   REINTENTAR_REGISTRO_ERROR,
   FETCH_EMPRESAS_REQUEST,
   FETCH_EMPRESAS_SUCCESS,
   FETCH_EMPRESAS_ERROR,
   REGISTER_DELEGADO_REQUEST,
  REGISTER_DELEGADO_SUCCESS,
  REGISTER_DELEGADO_ERROR,
    
} from './actionTypes';


/**
 * Acción para obtener transacciones según tipo de usuario (persona o empresa)
 * 
 * @param {string} uuid - UUID del usuario
 * @param {string|null} empresaUuid - UUID de la empresa (si aplica)
 * @param {string|null} rolEmpresa - Rol actual en la empresa (delegado/responsable o null)
 */

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



// 👇 Permite string directo (uuid) o un objeto con filtros
export const fetchUsuarioDetails = (input) => async (dispatch) => {
  dispatch({ type: 'FETCH_USUARIO_DETAILS_REQUEST' });

  try {
    const token = localStorage.getItem('authToken');

    // Determinar los query params según el tipo de input
    const queryParams = typeof input === 'string' ? { uuid: input } : input;

    const response = await api.get('/usuarios/detalles', {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: 'FETCH_USUARIO_DETAILS_SUCCESS',
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: 'FETCH_USUARIO_DETAILS_FAILURE',
      payload: error?.response?.data?.message || error.message,
    });
    throw error;
  }
};




// Login
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password, rolTemporal }, { rejectWithValue }) => {
      try {
        const response = await api.post('/usuarios/login', { email, password, rolTemporal });
// Verifica la respuesta
        return {
          usuario: response.data.usuario,  // Asegúrate de estructurarlo así
          token: response.data.token
        };
      } catch (error) {
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

// ✅ Nuevo fetch con paginado y tipo
export const obtenerTodasLasTransacciones = async (uuid, modo, page = 1, tipo) => {
  try {
    const response = await api.get(`/transacciones/usuario/${uuid}?page=${page}&limit=10&tipo=${tipo || ''}`);
    return response.data; // { success, data, page, total, totalPages }
  } catch (error) {
    console.error('❌ Error al obtener transacciones:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener transacciones.');
  }
};



// Agregar usuario
export const addUsuario = (newUser) => async dispatch => {
    dispatch({ type: ADD_USUARIO_REQUEST });
    
  
    // Verificación de campos obligatorios
    const requiredFields = ['dni', 'cuit', 'nombre', 'apellido', 'email', 'direccion', 'tipo'];
    for (let field of requiredFields) {
      if (!newUser[field]) {
        dispatch({
          type: ADD_USUARIO_ERROR,
          error: `Falta el campo: ${field}`
        });
        return; // Detiene el proceso si falta algún campo
      }
    }
  
    // Asegurar que los campos de dirección estén presentes
    if (!newUser.direccion || !newUser.direccion.calle || !newUser.direccion.altura || !newUser.direccion.departamento) {
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
      dispatch({
        type: ADD_USUARIO_ERROR,
        error: error.response ? error.response.data : { message: error.message }
      });
      throw error;
    }
  };
  
  



// Acción para obtener compras y ventas de usuario
export const obtenerTransacciones = async (uuid, tipo = '', page = 1, limit = 10) => {
  try {
    const response = await api.get(`/transacciones/usuario/${uuid}?tipo=${tipo}&page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener las transacciones.');
  }
};


// Acción para obtener transacciones por empresa
export const obtenerTransaccionesEmpresa = async (empresaUuid) => {
  try {
    const response = await api.get(`/transacciones/empresa/${empresaUuid}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener transacciones de la empresa');
  }
};


// src/redux/actions/usuarios.js
export const obtenerComprasUsuario = async (uuid, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/transacciones/usuario/${uuid}/compras?page=${page}&limit=${limit}`);
    return {
      data: response.data.data,
      total: response.data.total
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener las compras.');
  }
};

export const obtenerVentasUsuario = async (uuid, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/transacciones/usuario/${uuid}/ventas?page=${page}&limit=${limit}`);
    return {
      data: response.data.data,
      total: response.data.total
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener las ventas.');
  }
};



export const fetchTransaccionesByAdmin = (uuid, empresaUuid = null, rolEmpresa = null) => async (dispatch) => {
  dispatch({ type: FETCH_TRANSACCIONES_REQUEST });

  try {
    let response;

    if (empresaUuid) {
      response = await api.get(`/transacciones/empresa/${empresaUuid}`);
    } else {
      response = await api.get(`/transacciones/usuario/${uuid}`);
    }

    const data = response.data;
    const transacciones = Array.isArray(data)
      ? data
      : [...(data.compras || []), ...(data.ventas || [])];

    dispatch({
      type: FETCH_TRANSACCIONES_SUCCESS,
      payload: transacciones,
    });

  } catch (error) {
    dispatch({
      type: FETCH_TRANSACCIONES_ERROR,
      payload: error.message || 'Error al obtener transacciones',
    });
  }
};






// Acción para Compras y Ventas
export const fetchUsuarioComprasVentas = (userId) => async (dispatch) => {
    if (!userId) {
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

    const response = await api.patch(`usuarios/usuarios/${uuid}/rol`, { rolDefinitivo: role });

    dispatch({
      type: ASSIGN_ROLE_SUCCESS,
      payload: response.data,
    });

  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Error al asignar rol';


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

    const updatedUser = response.data.usuario; // ✅ solo extraemos la parte útil

    dispatch({ type: 'UPDATE_USER_SUCCESS', payload: updatedUser });

    notification.success({
      message: 'Usuario actualizado',
      description: 'Los datos del usuario fueron actualizados correctamente.',
    });

    return Promise.resolve(updatedUser); // ✅ solo el objeto usuario
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Error desconocido';

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

export const getUserByUuid = async (uuid) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await api.get(`/usuarios/usuario/${uuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.usuario;
  } catch (error) {
    console.error('Error al obtener el usuario por UUID:', error);
    throw error;
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

      dispatch({
          type: FETCH_PENDING_REGISTRATIONS_SUCCESS,
          payload: response.data,
      });
  } catch (error) {
      dispatch({
          type: FETCH_PENDING_REGISTRATIONS_ERROR,
          error: error.message,
      });
  }
};




export const approveUser = (userUuid, data) => async (dispatch) => {
  dispatch({ type: 'APPROVE_USER_REQUEST' });

  try {
      const token = localStorage.getItem('token');

      const response = await api.put(`/usuarios/${userUuid}/aprobar`, data, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });


      dispatch({ type: 'APPROVE_USER_SUCCESS', payload: response.data });
      return response.data;
  } catch (error) {
      dispatch({ type: 'APPROVE_USER_ERROR', payload: error.response?.data || error.message });
      throw error;
  }
};



export const denyRegistration = (userUuid, data) => async (dispatch) => {
  dispatch({ type: 'DENY_REGISTRATION_REQUEST' });

  try {
    const token = localStorage.getItem('token');


    const response = await api.put(`/usuarios/${userUuid}/rechazar`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: 'DENY_REGISTRATION_SUCCESS', payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: 'DENY_REGISTRATION_ERROR', payload: error.response?.data || error.message });
    throw error;
  }
};

export const fetchApprovedUsers = () => async (dispatch) => {
  dispatch({ type: 'FETCH_APPROVED_USERS_REQUEST' });
  try {
    const response = await api.get('/usuarios/aprobados'); // Verifica la ruta correcta
    dispatch({ type: 'FETCH_APPROVED_USERS_SUCCESS', payload: response.data });
  } catch (error) {
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
    const { dni, nombre, apellido } = params;

    if (!dni || !nombre || !apellido) {
      throw new Error("DNI, nombre y apellido son requeridos.");
    }

    const response = await api.post("/usuarios/check", { dni, nombre, apellido });

    if (response.data?.usuario) {
      return { existe: true, usuario: response.data.usuario };
    } else {
      return { existe: false }; // Si no existe, devolvemos `{ existe: false }`
    }
  } catch (error) {
    return { existe: false }; // Devolver `existe: false` si hay error
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


    // 🔹 Asegurarnos de que la estructura es correcta antes de enviar
    const cleanedData = {
      dni: usuarioData.dni,
      nombre: usuarioData.nombre?.trim(),
      apellido: usuarioData.apellido?.trim(),
      email: usuarioData.email?.trim(),
      tipo: usuarioData.tipo,
      cuit: usuarioData.cuit?.trim() || '',
      razonSocial: usuarioData.tipo === 'juridica' ? usuarioData.razonSocial?.trim() : null,
      direccion: usuarioData.direccion || {},
    
      // 👇 Agregá estos campos si es persona jurídica
      dniResponsable: usuarioData.dniResponsable || '',
      nombreResponsable: usuarioData.nombreResponsable || '',
      apellidoResponsable: usuarioData.apellidoResponsable || '',
      cuitResponsable: usuarioData.cuitResponsable || '',
      domicilioResponsable: usuarioData.domicilioResponsable || {},
    };
    

    const response = await api.post('/usuarios/register-usuario-por-tercero', cleanedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data?.usuario) {
      dispatch({
        type: REGISTER_USER_THIRD_PARTY_SUCCESS,
        payload: response.data.usuario,
      });

      return response.data.usuario;
    }

    throw new Error('No se pudo registrar el usuario.');
  } catch (error) {
    dispatch({
      type: REGISTER_USER_THIRD_PARTY_ERROR,
      error: error.message,
    });

    throw new Error(error.response?.data?.message || "Error en el registro de usuario.");
  }
}; 

export const registerDelegado = (delegadoData) => async (dispatch) => {
  dispatch({ type: REGISTER_DELEGADO_REQUEST });

  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No se encontró token de autenticación.');

    const payload = {
      ...delegadoData,
      tipo: 'fisica', // 🔒 Siempre física
    };

    console.log('📤 Enviando datos del delegado:', payload); // 🔍 DEBUG

    const response = await api.post('/usuarios/registrar-delegado', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Respuesta de registro delegado:', response.data); // 🔍 DEBUG

    if (response.data?.usuario) {
      dispatch({
        type: REGISTER_DELEGADO_SUCCESS,
        payload: response.data.usuario,
      });
      return response.data.usuario;
    }

    throw new Error(response.data?.message || 'No se pudo registrar el delegado.');
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.message ||
      'Error desconocido al registrar delegado.';

    console.error('❌ Error al registrar delegado:', msg); // 🔥 DEBUG FULL

    dispatch({
      type: REGISTER_DELEGADO_ERROR,
      error: msg,
    });

    throw new Error(msg);
  }
};



  
  // Acción para obtener historial de cambios
export const fetchHistorialCambios = async (uuid) => {
  try {
    const response = await api.get(`/historialcambios/historial-cambios/${uuid}`);
// Verifica que sea un array
    return response.data; // Devuelve los datos directamente
  } catch (error) {
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
    throw new Error(error.response?.data?.message || 'Error al reenviar registro.');
  }
};

export const fetchRenaperData = (dni) => async (dispatch) => {
  dispatch({ type: 'FETCH_RENAPER_REQUEST' });

  try {
    const { data } = await api.get(`/renaper/${dni}`);

    // 🔍 Validar respuesta esperada desde RENAPER
    if (data && data.resultado === 0 && data.persona) {
      dispatch({ type: 'FETCH_RENAPER_SUCCESS', payload: data.persona });
      return data.persona;
    } else {
      const errorMsg = data.mensaje || 'Error al buscar los datos.';
      dispatch({ type: 'FETCH_RENAPER_FAILURE', payload: errorMsg });
      throw new Error(errorMsg);
    }
  } catch (error) {
    dispatch({
      type: 'FETCH_RENAPER_FAILURE',
      payload: error.response?.data?.mensaje || error.message || 'Error inesperado.',
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

export const getEmpresas = () => async (dispatch) => {
  dispatch({ type: 'FETCH_EMPRESAS_REQUEST' });

  try {
    const response = await api.get('/empresas');
    dispatch({ type: 'FETCH_EMPRESAS_SUCCESS', payload: response.data.empresas });
  } catch (error) {
    dispatch({
      type: 'FETCH_EMPRESAS_FAIL',
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getEmpresaByUuid = async (uuid) => {
  try {
    const response = await api.get(`/usuarios/empresas/${uuid}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener empresa por UUID:', error);
    return null;
  }
};


export const fetchDelegados = (empresaUuid) => async (dispatch) => {
  dispatch({ type: 'FETCH_DELEGADOS_REQUEST' });

  try {
    const token = localStorage.getItem('authToken'); // 👈 asegúrate de usar esta
    const res = await api.get(`/empresas/${empresaUuid}/delegados`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('[✅ API] Delegados recibidos:', res.data.delegados);

    dispatch({ type: 'FETCH_DELEGADOS_SUCCESS', payload: res.data.delegados });
  } catch (error) {
    console.error('[❌ ERROR] al cargar delegados:', error);
    dispatch({ type: 'FETCH_DELEGADOS_ERROR', payload: error.message });
  }
};


// actions/empresa.js
export const fetchMiEmpresaYDelegados = () => async (dispatch) => {
  dispatch({ type: 'FETCH_EMPRESAS_REQUEST' });
  dispatch({ type: 'FETCH_DELEGADOS_REQUEST' });

  try {
    const token = localStorage.getItem('token'); // 👈 asegurate que sea la key correcta

    const empresaRes = await api.get('/empresas/delegado/empresa', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const empresa = empresaRes.data.empresa;

    console.log('[✅ Empresa obtenida]:', empresa);

    if (!empresa || !empresa.uuid) {
      throw new Error('Empresa no válida o sin UUID.');
    }

    dispatch({ type: 'FETCH_EMPRESAS_SUCCESS', payload: [empresa] });

    const delegadosRes = await api.get(`/empresas/${empresa.uuid}/delegados`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('[✅ Delegados obtenidos]:', delegadosRes.data.delegados);

    dispatch({ type: 'FETCH_DELEGADOS_SUCCESS', payload: delegadosRes.data.delegados });

  } catch (err) {
    console.error('[❌ ERROR AL CARGAR EMPRESA + DELEGADOS]:', err);

    dispatch({
      type: 'FETCH_EMPRESAS_ERROR',
      payload: err.response?.data?.message || err.message,
    });

    dispatch({
      type: 'FETCH_DELEGADOS_ERROR',
      payload: err.response?.data?.message || err.message,
    });
  }
};



// actions/usuarios.js
export const fetchEmpresaDeDelegado = () => async () => {
  const token = localStorage.getItem('authToken');
  const res = await api.get('/usuarios/delegado/empresa', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
