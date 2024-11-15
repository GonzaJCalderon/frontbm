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
    FETCH_TRAZABILIDAD_ERROR
} from './actionTypes';

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
export const addBien = (formData) => async dispatch => {
    try {
        // Validación básica
        if (!formData.has('fotos')) {
            throw new Error('No se encontraron fotos para cargar.');
        }

        const response = await axios.post(
            'http://localhost:5005/bienes/add/',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );

        dispatch({ type: ADD_BIEN_SUCCESS, payload: response.data });
    } catch (error) {
        console.error('Error al agregar el bien:', error);
        dispatch({ type: ADD_BIEN_ERROR, error: error.message });
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
export const updateBien = (id, bienData) => async dispatch => {
    try {
        const token = getToken();
        const res = await axios.put(`/bienes/${id}`, bienData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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


export const registrarCompra = (compraData) => async (dispatch) => {
    try {
      // Validaciones previas
      const precio = parseFloat(compraData.precio);
      const cantidad = parseInt(compraData.cantidad, 10);
      const metodoPago = compraData.metodoPago;
  
      if (isNaN(precio) || precio <= 0) {
        message.error('Por favor, ingrese un precio válido');
        return;
      }
  
      if (isNaN(cantidad) || cantidad <= 0) {
        message.error('Por favor, ingrese una cantidad válida');
        return;
      }
  
      if (!metodoPago || metodoPago === 'undefined') {
        message.error('Por favor, seleccione un método de pago');
        return;
      }
  
      // Crear FormData para enviar los datos y las fotos
      const formData = new FormData();
      formData.append('bienId', compraData.bienId);
      formData.append('compradorId', compraData.compradorId);
      formData.append('vendedorId', compraData.vendedorId);
      formData.append('precio', precio);
      formData.append('descripcion', compraData.descripcion);
      formData.append('tipo', compraData.tipo);
      formData.append('marca', compraData.marca);
      formData.append('modelo', compraData.modelo);
      formData.append('imei', compraData.imei || '');
      formData.append('cantidad', cantidad);
      formData.append('metodoPago', metodoPago);
  
      // Solo añadir fotos si son necesarias (si el bien no existe)
      if (compraData.fotos && compraData.fotos.length > 0) {
        compraData.fotos.forEach((file) => {
          formData.append('fotos', file.originFileObj);
        });
      }
  
      // Hacer la solicitud al backend
      const res = await axios.post('/bienes/comprar_bien', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Dispatch a una acción de éxito
      dispatch({
        type: COMPRA_SUCCESS,
        payload: res.data,
      });
  
      message.success('Compra registrada con éxito');
    } catch (error) {
      console.error('Error al registrar la compra:', error);
      dispatch({
        type: COMPRA_ERROR,
        payload: error.message,
      });
      message.error('Error al registrar la compra');
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
