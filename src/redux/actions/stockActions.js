import axios from 'axios';
import api from '../axiosConfig'; // Importa tu instancia de Axios
import { fetchAllBienes } from '../actions/bienes';


import { 
    UPDATE_STOCK, 
    FETCH_USUARIO_COMPRAS_VENTAS_REQUEST, 
    FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS, 
    FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
    REGISTRAR_COMPRA_ERROR,
    UPDATE_STOCK_REQUEST,
    UPDATE_STOCK_SUCCESS, 
    UPDATE_STOCK_FAILURE,
    UPLOAD_STOCK_REQUEST, 
    UPLOAD_STOCK_SUCCESS, 
    UPLOAD_STOCK_FAILURE, 
    STOCK_IMAGES_UPLOAD_SUCCESS,
    STOCK_IMAGES_UPLOAD_FAIL,
    FINALIZAR_CREACION_REQUEST,
    FINALIZAR_CREACION_SUCCESS,
    FINALIZAR_CREACION_FAILURE ,
    REGISTRAR_VENTA_EXITO,
    REGISTRAR_VENTA_ERROR,
    
} from './actionTypes';

export const registrarVenta = (ventaData) => async (dispatch) => {
    try {
      const response = await api.post('/ventas/registrar', ventaData);
      console.log("📌 Venta registrada, respuesta del backend:", response.data);
  
      if (response.data.success) {
        dispatch({ type: REGISTRAR_VENTA_EXITO, payload: response.data });
        
        // 🔥 Forzar actualización de bienes después de la venta
        dispatch(fetchAllBienes());
  
        return response.data;
      } else {
        throw new Error(response.data.message || "Error al registrar la venta");
      }
    } catch (error) {
      console.error('❌ Error en registrarVenta:', error);
      dispatch({ type: REGISTRAR_VENTA_ERROR, payload: error.message });
      return { error: error.message };
    }
  };
  
export const registrarCompra = (compraData) => async (dispatch, getState) => {
    try {
        const { auth: { token } } = getState();
        if (!token) throw new Error('Token no encontrado en el estado global');

        const comprador = JSON.parse(localStorage.getItem('usuario'));
        if (!comprador) throw new Error('No se encontró el comprador en el localStorage');

        const datosCompra = {
            ...compraData,
            compradorId: comprador.id,
        };

        console.log('Datos enviados a /bienes/comprar:', datosCompra);

        const response = await api.post('/bienes/comprar', datosCompra, { // Cambia a 'api'
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.bien) {
            dispatch({
                type: UPDATE_STOCK,
                payload: response.data.bien
            });
        } else {
            throw new Error('Respuesta de la API no contiene la información esperada');
        }

    } catch (error) {
        console.error('Error al registrar la compra:', error);
        dispatch({
            type: REGISTRAR_COMPRA_ERROR,
            payload: error.response?.data?.message || 'Error desconocido al registrar la compra'
        });
    }
};
export const finalizarCreacionBienes = (bienes) => async (dispatch) => {
    dispatch({ type: 'FINALIZAR_CREACION_REQUEST' });
  
    try {
      // Validar los bienes antes de enviarlos
      if (!Array.isArray(bienes) || bienes.length === 0) {
        throw new Error('No hay bienes para procesar.');
      }
  
      bienes.forEach((bien, index) => {
        if (!bien.tipo || !bien.marca || !bien.modelo) {
          throw new Error(`Faltan datos obligatorios en el bien #${index + 1}.`);
        }
      });
  
      console.log('Enviando bienes al backend:', bienes);
  
      // Enviar bienes al servidor
      const response = await api.post('/excel/finalizar-creacion', { bienes });
  
      console.log('Respuesta del servidor:', response.data);
  
      // Actualizar Redux
      dispatch({ type: 'ADD_BIENES', payload: response.data.bienes });
      dispatch({ type: 'FINALIZAR_CREACION_SUCCESS', payload: response.data });
  
      return Promise.resolve(response.data);
    } catch (error) {
      console.error('Error al finalizar creación de bienes:', error);
  
      const mensajeError = error.response?.data?.message || 'Error al crear los bienes.';
  
      dispatch({
        type: 'FINALIZAR_CREACION_FAILURE',
        payload: mensajeError,
      });
  
      return Promise.reject(new Error(mensajeError));
    }
  };
  
  

export const uploadStockExcel = (file, propietario_uuid) => async (dispatch) => {
    dispatch({ type: UPLOAD_STOCK_REQUEST });
  
    const formData = new FormData();
    formData.append('archivoExcel', file);
  
    try {
      console.log('Iniciando subida de archivo Excel:', file);
  
      const response = await api.post('/excel/upload-stock', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Propietario-UUID': propietario_uuid,
        },
      });
  
      console.log('Respuesta del servidor al subir la planilla:', response.data);
  
      dispatch({ type: UPLOAD_STOCK_SUCCESS, payload: response.data });
      return Promise.resolve(response.data);
    } catch (error) {
      console.error('Error al subir el archivo Excel:', error);
      dispatch({
        type: UPLOAD_STOCK_FAILURE,
        payload: error.response?.data?.message || 'Error al subir el archivo.',
      });
      return Promise.reject(error);
    }
  };
  

export const uploadStockImages = (mapaFotos) => async (dispatch) => {
    try {
        if (!mapaFotos || typeof mapaFotos !== 'object') {
            throw new Error('El mapa de fotos no es válido.');
        }

        const formData = new FormData();

        Object.keys(mapaFotos).forEach((bienId) => {
            const fotos = mapaFotos[bienId];
            if (Array.isArray(fotos)) {
                fotos.forEach((foto) => {
                    formData.append(`fotos[${bienId}]`, foto);
                });
            }
        });

        console.log('Enviando fotos con el siguiente mapa:', mapaFotos);

        const response = await api.post('/excel/subir-fotos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Respuesta del servidor:', response.data);

        dispatch({
            type: STOCK_IMAGES_UPLOAD_SUCCESS,
            payload: response.data,
        });

        return Promise.resolve(response.data);
    } catch (error) {
        console.error('Error en uploadStockImages:', error);
        dispatch({
            type: STOCK_IMAGES_UPLOAD_FAIL,
            payload: error.message || 'Error desconocido al subir las imágenes',
        });
        return Promise.reject(error);
    }
};





export const fetchUsuarioComprasVentas = (userId) => async (dispatch) => {
    dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_REQUEST });
    try {
        const response = await api.get(`/usuarios/${userId}/compras-ventas`); // Cambia a 'api'
        dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_ERROR, payload: error.message });
    }
};

export const searchItems = (term) => async (dispatch) => {
    try {
        const response = await api.get(`/stock?search=${term}`); // Cambia a 'api'
        dispatch({
            type: 'SEARCH_ITEMS_SUCCESS',
            payload: response.data,
        });
    } catch (error) {
        console.error('Search Error:', error);
        dispatch({
            type: 'SEARCH_ITEMS_ERROR',
            payload: error.message,
        });
    }
};

export const updateStock = (bienId, cantidad) => async (dispatch) => {
    dispatch({ type: UPDATE_STOCK_REQUEST });
  
    try {
        const response = await api.patch(`/bienes/${bienId}`, { stock: cantidad }); // Cambia a 'api'
        dispatch({ type: UPDATE_STOCK_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: UPDATE_STOCK_FAILURE, payload: error.message });
    }
};
