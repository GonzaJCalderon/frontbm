import axios from '../axiosConfig';
import { message } from 'antd';
import prepareFormData from '../../utils/prepareFormData';  // Ajusta la ruta si es necesario


import {
    FETCH_BIENES,
    ADD_BIEN,
    ADD_BIEN_REQUEST,
    ADD_BIEN_ERROR,
    ADD_BIEN_SUCCESS,
    FETCH_BIEN_DETAILS,
    FETCH_BIEN_DETAILS_REQUEST,
    UPDATE_BIEN,
    REGISTRAR_VENTA_EXITO,
    REGISTRAR_VENTA_ERROR,
    UPDATE_STOCK,
    FETCH_BIENES_ERROR,
    FETCH_BIENES_SUCCESS,
    FETCH_BIENES_REQUEST,
    FETCH_BIEN_DETAILS_ERROR,
    REGISTRAR_COMPRA_REQUEST,
    COMPRA_SUCCESS,
    COMPRA_ERROR,
    REGISTRAR_COMPRA_EXITO,
    FETCH_TRAZABILIDAD_REQUEST,
    FETCH_TRAZABILIDAD_SUCCESS,
    FETCH_TRAZABILIDAD_ERROR,
    GET_BIENES_USUARIO_REQUEST,
    GET_BIENES_USUARIO_SUCCESS,
    GET_BIENES_USUARIO_FAILURE,
} from './actionTypes';

const handleRequestError = (error) => {
  if (error.response) {
    console.error('Error del servidor:', error.response.data);
    return error.response.data.message || 'Error al procesar la solicitud en el servidor.';
  } else if (error.request) {
    console.error('Error de red:', error.request);
    return 'No se recibió respuesta del servidor.';
  } else {
    console.error('Error en configuración:', error.message);
    return `Error en la solicitud: ${error.message}`;
  }
};


// Función para obtener el token del localStorage
const getToken = () => localStorage.getItem('token');

// Acción para obtener todos los bienes disponibles
export const fetchAllBienes = () => async (dispatch) => {
    dispatch({ type: FETCH_BIENES_REQUEST });

    try {
        const token = getToken();
        if (!token) throw new Error('Token no encontrado en localStorage');

        const response = await axios.get('/bienes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        dispatch({ type: FETCH_BIENES_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_BIENES_ERROR, payload: error.response ? error.response.data : error.message });
    }
};

// Acción para obtener los bienes del usuario
export const fetchBienes = (userId) => async (dispatch) => {
    dispatch({ type: FETCH_BIENES_REQUEST });

    try {
        const token = getToken();
        if (!token) throw new Error('Token no encontrado en localStorage');
        if (!userId) throw new Error('ID de usuario no encontrado');

        const response = await axios.get(`/bienes/usuario/${userId}/stock`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        console.log(response.data);  // Verifica la estructura de los datos
        
        dispatch({ type: FETCH_BIENES_SUCCESS, payload: response.data });
        
    } catch (error) {
        dispatch({ type: FETCH_BIENES_ERROR, payload: error.response ? error.response.data : error.message });
    }
};
// Acción para agregar un nuevo bien
export const addBien = (formData) => async (dispatch) => {
  dispatch({ type: ADD_BIEN_REQUEST }); // Despacha el inicio de la solicitud
  try {
    const response = await axios.post('/bienes/add/', formData);

    if (response && response.data) {
      dispatch({ type: ADD_BIEN_SUCCESS, payload: response.data });
      return response.data; // Retornar los datos para manejar en el componente
    } else {
      throw new Error('Respuesta del servidor no contiene datos.');
    }
  } catch (error) {
    console.error('Error al agregar el bien:', error);

    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }

    dispatch({
      type: ADD_BIEN_ERROR,
      payload: error.response ? error.response.data.message || error.response.data : error.message,
    });

    throw new Error(
      error.response
        ? error.response.data.message || 'Error al agregar el bien.'
        : 'Error de conexión con el servidor.'
    );
  }
};




// Acción para obtener los detalles de un bien específico
export const fetchBienDetails = (bienId) => async (dispatch) => {
    dispatch({ type: FETCH_BIEN_DETAILS_REQUEST }); // Asegúrate de tener este tipo de acción
    try {
        const res = await axios.get(`/bienes/${bienId}`);
        dispatch({ type: FETCH_BIEN_DETAILS, payload: res.data });
    } catch (error) {
        dispatch({
            type: FETCH_BIEN_DETAILS_ERROR,
            payload: error.response ? error.response.data : error.message
        });
    }
};

// Acción para actualizar un bien existente
export const updateBien = (uuid, bienData) => async dispatch => {
    try {
        const token = getToken();
        // Limpiar datos antes de enviarlos
        const cleanData = (data) => {
            const result = {};
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    result[key] = data[key];
                }
            });
            return result;
        };

        const bienDataCleaned = cleanData(bienData);

        // Realizar la solicitud
        const res = await axios.put(`/bienes/${uuid}`, bienDataCleaned, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Despachar la acción al reducer
        dispatch({ type: UPDATE_BIEN, payload: res.data });
    } catch (error) {
        console.error('Error updating bien:', error);
    }
};


// Acción para registrar una venta
// Acción para registrar una venta
export const registrarVenta = (ventaData) => async (dispatch) => {
    try {
        // Log para verificar los datos que se envían
        console.log('Datos de venta que se envían al backend:', ventaData);
        
        const token = getToken();
        const response = await axios.post('bienes/vender', ventaData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Log para verificar la respuesta del backend
        console.log('Respuesta del backend:', response.data);

        dispatch({ type: REGISTRAR_VENTA_EXITO, payload: response.data });
        dispatch({ type: UPDATE_STOCK, payload: response.data.bien });
    } catch (error) {
        // Log para verificar el error en caso de que ocurra
        console.error('Error al registrar la venta:', error.response ? error.response.data : error.message);
        
        dispatch({
            type: REGISTRAR_VENTA_ERROR,
            payload: error.response ? error.response.data : error.message
        });
    }
};





export const registrarCompra = (formDataToSend) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await axios.post('/bienes/comprar', formDataToSend, config);
    
    dispatch({
      type: 'REGISTRAR_COMPRA_SUCCESS',
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: 'REGISTRAR_COMPRA_FAIL',
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });

    throw error;
  }
};



  

// Acción para obtener la trazabilidad de un bien específico
export const fetchTrazabilidadBien = (bienUuid) => async (dispatch) => {
    dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

    try {
        const token = getToken();
        const response = await axios.get(`/bienes/trazabilidad/${bienUuid}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        dispatch({ type: FETCH_TRAZABILIDAD_SUCCESS, payload: response.data });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.error(errorMessage); // Asegúrate de que el mensaje de error sea claro
        dispatch({ type: FETCH_TRAZABILIDAD_ERROR, payload: errorMessage });
    }
};

export const actualizarStockPorParametros = (updatedData) => async (dispatch) => {
  const { tipo, marca, modelo, cantidad } = updatedData;

  // Verificar parámetros requeridos
  if (!tipo || !marca || !modelo || !cantidad) {
    const missingParams = [];
    if (!tipo) missingParams.push('tipo');
    if (!marca) missingParams.push('marca');
    if (!modelo) missingParams.push('modelo');
    if (!cantidad) missingParams.push('cantidad');

    throw new Error(`Faltan parámetros requeridos: ${missingParams.join(', ')}`);
  }

  console.log('Datos recibidos en actualizarStockPorParametros:', updatedData);

  try {
    const response = await axios.put('/bienes/actualizar-por-parametros', updatedData);

    if (response && response.data) {
      dispatch({
        type: UPDATE_STOCK,
        payload: response.data, // Actualización exitosa del stock
      });
      return response.data;
    } else {
      throw new Error('La respuesta del servidor no contiene datos.');
    }
  } catch (error) {
    if (error.response) {
      console.error('Error al actualizar stock:', error.response.data);
      throw new Error(
        error.response.data.message || 'Error al actualizar stock desde el servidor.'
      );
    } else if (error.request) {
      console.error('Error de solicitud:', error.request);
      throw new Error('No se recibió respuesta del servidor al intentar actualizar el stock.');
    } else {
      console.error('Error en configuración de solicitud:', error.message);
      throw new Error(`Error al actualizar stock: ${error.message}`);
    }
  }
};


export const fetchBienesStock = (search = '', userId) => async (dispatch) => {
  dispatch({ type: FETCH_BIENES_REQUEST });

  try {
    const token = getToken();
    if (!token) throw new Error('Token no encontrado en localStorage');

    // Construir la URL con los parámetros de búsqueda y el userId
    let url = '/bienes/stock';
    const params = new URLSearchParams();
    
    if (search) {
      params.append('search', search);
    }

    if (userId) {
      params.append('userId', userId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    dispatch({ type: FETCH_BIENES_SUCCESS, payload: response.data.bienes });
    
  } catch (error) {
    dispatch({ type: FETCH_BIENES_ERROR, payload: error.response ? error.response.data : error.message });
  }
};




// Acción para obtener bienes de un usuario específico
export const fetchBienesPorUsuario = (userId) => async (dispatch) => {
  dispatch({ type: GET_BIENES_USUARIO_REQUEST });

  try {
    const response = await axios.get(`/bienes/bien/usuario/${userId}`);
    dispatch({
      type: GET_BIENES_USUARIO_SUCCESS,
      payload: response.data.bienes,
    });
  } catch (error) {
    dispatch({
      type: GET_BIENES_USUARIO_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};

  