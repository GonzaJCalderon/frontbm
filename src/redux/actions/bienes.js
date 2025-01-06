
import api from '../axiosConfig';
import axios from '../axiosConfig';
import { message,notification  } from 'antd';
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
    DELETE_BIEN,
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
    const token = localStorage.getItem('token');
    const response = await axios.post('/bienes/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
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
export const fetchBienDetails = (uuid) => async (dispatch) => {
  dispatch({ type: 'FETCH_BIEN_DETAILS_REQUEST' });

  try {
      const response = await api.get(`/bienes/${uuid}`);
      dispatch({ type: 'FETCH_BIEN_DETAILS_SUCCESS', payload: response.data });
      return response.data; // Devuelve los datos al componente
  } catch (error) {
      dispatch({ type: 'FETCH_BIEN_DETAILS_FAILURE', error });
      console.error('Error fetching bien details:', error);
      throw error; // Lanza el error al componente
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
    const response = await api.post('/transacciones/vender', ventaData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Retorna la respuesta si es exitosa
  } catch (error) {
    console.error('Error en registrarVenta:', error);
    throw handleRequestError(error); // Usar la función de manejo de errores
  }
};



// Acción para registrar una compra
export const registrarCompra = (formData) => async (dispatch) => {
  try {
    const response = await api.post('/transacciones/comprar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw handleRequestError(error);
  }
};

  


  

// Acción para obtener la trazabilidad de un bien específico
export const fetchTrazabilidadBien = (bienUuid) => async (dispatch) => {
  dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

  try {
    const response = await api.get(`/bienes/trazabilidad/${bienUuid}`);
    dispatch({ type: FETCH_TRAZABILIDAD_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_TRAZABILIDAD_ERROR, payload: handleRequestError(error) });
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

export const deleteBien = (uuid) => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/bienes/${uuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Opcional: despachar acción para actualizar lista
    dispatch(fetchAllBienes());
    notification.success({ message: 'Bien eliminado correctamente.' });
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error al eliminar el bien.';
    console.error('Error al eliminar bien:', errorMessage);
    notification.error({ message: 'Error', description: errorMessage });
    throw new Error(errorMessage);
  }
};


export const editBien = (uuid, updatedData) => async (dispatch) => {
  try {
    const token = getToken(); // Obtén el token del localStorage

    // Realiza la solicitud PUT al backend con los datos actualizados
    const response = await axios.put(`/bienes/${uuid}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`, // Incluye el token en los headers
        'Content-Type': 'application/json',
      },
    });

    // Actualiza el estado en el frontend
    dispatch({
      type: UPDATE_BIEN,
      payload: response.data,
    });

    // Opcional: mostrar un mensaje de éxito
    message.success('El bien ha sido actualizado correctamente.');
  } catch (error) {
    const errorMessage = handleRequestError(error);
    message.error(errorMessage);
  }
};
