
import api from '../axiosConfig';
import axios from '../axiosConfig';
import { message } from 'antd';
import prepareFormData from '../../utils/prepareFormData';  // Ajusta la ruta si es necesario



import {
    FETCH_BIENES,
    FETCH_BIENES_FAILURE,
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
    REGISTRAR_COMPRA_ERROR,
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

export const fetchAllBienes = () => async (dispatch) => {
  dispatch({ type: FETCH_BIENES_REQUEST });

  try {
    const response = await api.get('/bienes');
    const sortedBienes = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    dispatch({ type: FETCH_BIENES_SUCCESS, payload: sortedBienes });
  } catch (error) {
    dispatch({ type: FETCH_BIENES_ERROR, payload: error.message });
  }
};


// Acción para obtener los bienes del usuario 
export const fetchBienes = (uuid) => async (dispatch) => {
  dispatch({ type: FETCH_BIENES_REQUEST });

  try {
    const response = await axios.get(`/bienes/usuario/${uuid}`);
    console.log('Datos recibidos:', response.data);

    dispatch({
      type: FETCH_BIENES_SUCCESS,
      payload: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error en fetchBienes:', error);

    dispatch({
      type: FETCH_BIENES_ERROR,
      payload: error.response?.data || error.message,
    });

    return { success: false, error: error.response?.data || error.message };
  }
};





// Acción para agregar un nuevo bien
export const addBien = (formData) => async (dispatch) => {
  dispatch({ type: ADD_BIEN_REQUEST });

  try {
    const response = await axios.post('/bienes/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch({ type: ADD_BIEN_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    const errorMessage = handleRequestError(error);
    dispatch({ type: ADD_BIEN_ERROR, payload: errorMessage });
    throw new Error(errorMessage);
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
export const registrarVenta = (ventaData) => async (dispatch) => {
  try {
    const token = localStorage.getItem('token'); // O donde almacenes el token

    const response = await fetch('http://localhost:5005/transacciones/vender', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Envía el token aquí
      },
      body: JSON.stringify(ventaData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar la venta.');
    }

    return data; // Retorna la respuesta si es exitosa
  } catch (error) {
    console.error('Error en registrarVenta:', error.message);
    throw error;
  }
};




// Acción para registrar una compra
export const registrarCompra = (formData) => async (dispatch) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No se encontró el token de autenticación.');
    }

    const response = await axios.post('http://localhost:5005/transacciones/comprar', formData, {
      headers: {
        Authorization: `Bearer ${token}`, // Enviar el token en el encabezado
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Respuesta del servidor en registrarCompra:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error en registrarCompra:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

  


  

// Acción para obtener la trazabilidad de un bien específico
export const fetchTrazabilidadBien = (bienUuid) => async (dispatch) => {
    dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

    try {
        const token = getToken();
        const response = await axios.get(`http://localhost:5005/bienes/trazabilidad/${bienUuid}`, {
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
  const { tipo, marca, modelo, cantidad, tipoOperacion } = updatedData;

  // Verificar parámetros requeridos
  if (!tipo || !marca || !modelo || !cantidad || !tipoOperacion) {
    throw new Error('Faltan parámetros requeridos: tipo, marca, modelo, cantidad, tipoOperacion.');
  }

  console.log('Datos enviados para actualizar stock:', updatedData);

  try {
    const response = await axios.put('/bienes/actualizar-por-parametros', updatedData);

    if (response && response.data) {
      dispatch({
        type: UPDATE_STOCK,
        payload: response.data, // Actualización exitosa
      });
      return response.data;
    } else {
      throw new Error('La respuesta del servidor no contiene datos.');
    }
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    throw new Error(
      error.response?.data?.message || 'Error al actualizar el stock desde el servidor.'
    );
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
// Acción para obtener bienes de un usuario específico
export const fetchBienesPorUsuario = (uuid) => async (dispatch) => {
  dispatch({ type: GET_BIENES_USUARIO_REQUEST });

  try {
    // El frontend usa 'uuid' en lugar de 'userId'
    const response = await axios.get(`/bienes/usuario/${uuid}`);
    console.log('Bienes del usuario:', response.data);

    dispatch({
      type: GET_BIENES_USUARIO_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: GET_BIENES_USUARIO_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });
  }
};



export const agregarMarca = (tipo, marca) => async (dispatch) => {
  try {
    const response = await axios.post('bienes/bienes/marcas', { tipo, marca });
    return response.data;
  } catch (error) {
    console.error('Error al agregar marca:', error);
    throw error;
  }
};

export const agregarModelo = (tipo, marca, modelo) => async (dispatch) => {
  try {
    const response = await axios.post('bienes/bienes/modelos', { tipo, marca, modelo });
    return response.data;
  } catch (error) {
    console.error('Error al agregar modelo:', error);
    throw error;
  }
};

export const actualizarStock = (params) => async (dispatch) => {
  try {
    const response = await axios.put('/bienes/actualizar-stock', params);
    dispatch({ type: UPDATE_STOCK, payload: response.data });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    throw error;
  }
};
