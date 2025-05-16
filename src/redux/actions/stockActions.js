import api from '../axiosConfig';
import { fetchAllBienes } from '../actions/bienes';

import {
  UPDATE_STOCK,
  UPDATE_STOCK_REQUEST,
  UPDATE_STOCK_SUCCESS,
  UPDATE_STOCK_FAILURE,
  FETCH_USUARIO_COMPRAS_VENTAS_REQUEST,
  FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS,
  FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
  REGISTRAR_VENTA_EXITO,
  REGISTRAR_VENTA_ERROR,
  REGISTRAR_COMPRA_ERROR,
  UPLOAD_STOCK_REQUEST,
  UPLOAD_STOCK_SUCCESS,
  UPLOAD_STOCK_FAILURE,
  STOCK_IMAGES_UPLOAD_SUCCESS,
  STOCK_IMAGES_UPLOAD_FAIL,
  FINALIZAR_CREACION_REQUEST,
  FINALIZAR_CREACION_SUCCESS,
  FINALIZAR_CREACION_FAILURE,
  CLEAR_STOCK_ERROR } from './actionTypes';

/** 🔄 Registrar una venta */
export const registrarVenta = (ventaData) => async (dispatch) => {
  try {
    const response = await api.post('/transacciones/vender', ventaData);

    if (response.data.success) {
      dispatch({ type: REGISTRAR_VENTA_EXITO, payload: response.data });
      dispatch(fetchAllBienes()); // Forzar actualización
      return response.data;
    } else {
      throw new Error(response.data.message || "Error al registrar la venta");
    }
  } catch (error) {
    dispatch({ type: REGISTRAR_VENTA_ERROR, payload: error.message });
    return { error: error.message };
  }
};

/** 🛒 Registrar una compra */
export const registrarCompra = (formData) => async (dispatch, getState) => {
  try {
    const token = getState()?.auth?.token || localStorage.getItem("authToken");
    if (!token) throw new Error("Token no encontrado");

    const response = await api.post('/transacciones/comprar', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.bien || response.data?.success) {
      dispatch({ type: UPDATE_STOCK, payload: response.data.bien });
      return response.data;
    } else {
      throw new Error('La API no devolvió información del bien');
    }
  } catch (error) {
    dispatch({
      type: REGISTRAR_COMPRA_ERROR,
      payload: error.response?.data?.message || 'Error desconocido al registrar la compra',
    });
    return { error: error.message };
  }
};

/** 📦 Finalizar creación de bienes desde Excel + imágenes */
/** 📦 Finalizar creación de bienes desde Excel + imágenes */
export const finalizarCreacionBienes = (bienes) => async (dispatch) => {
  dispatch({ type: FINALIZAR_CREACION_REQUEST });

  try {
    const response = await api.post('/excel/finalizar-creacion', { bienes }); // ✅ Correcto
    dispatch({ type: FINALIZAR_CREACION_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: FINALIZAR_CREACION_FAILURE,
      payload: error.response?.data?.message || error.message || 'Error al crear los bienes.',
    });
   return {
  success: false,
  message: error.response?.data?.message || error.message || 'Error al registrar los bienes.',
};

  }
};



/** 📤 Subir archivo Excel con stock */
export const uploadStockExcel = (file, propietario_uuid) => async (dispatch) => {
  dispatch({ type: UPLOAD_STOCK_REQUEST });

  const formData = new FormData();
  formData.append('archivoExcel', file);

  try {
    const response = await api.post('/excel/upload-stock', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Propietario-UUID': propietario_uuid,
      },
    });

    dispatch({ type: UPLOAD_STOCK_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: UPLOAD_STOCK_FAILURE,
      payload: error.response?.data?.message || 'Error al subir el archivo.',
    });
    return Promise.reject(error);
  }
};

/** 📸 Subir fotos individuales o por bien */
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

    const response = await api.post('/excel/subir-fotos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    dispatch({ type: STOCK_IMAGES_UPLOAD_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: STOCK_IMAGES_UPLOAD_FAIL,
      payload: error.message || 'Error al subir imágenes',
    });
    return Promise.reject(error);
  }
};

/** 🔎 Buscar compras/ventas de un usuario */
export const fetchUsuarioComprasVentas = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_REQUEST });

  try {
    const response = await api.get(`/usuarios/${userId}/compras-ventas`);
    dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
      payload: error.response?.data?.message || 'Error al obtener historial',
    });
  }
};

/** 🔎 Buscar en stock */
export const searchItems = (term) => async (dispatch) => {
  try {
    const response = await api.get(`/stock?search=${term}`);
    dispatch({ type: 'SEARCH_ITEMS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'SEARCH_ITEMS_ERROR', payload: error.message });
  }
};

/** 🔁 Actualizar cantidad de stock manualmente */
export const updateStock = (bienId, cantidad) => async (dispatch) => {
  dispatch({ type: UPDATE_STOCK_REQUEST });

  try {
    const response = await api.patch(`/bienes/${bienId}`, { stock: cantidad });
    dispatch({ type: UPDATE_STOCK_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: UPDATE_STOCK_FAILURE, payload: error.message });
  }
};

/** 🔍 Historial de transacciones (compra/venta) */
export const fetchHistorialTransacciones = (uuid) => async (dispatch) => {
  dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_REQUEST });

  try {
    const response = await api.get(`/transacciones/usuario/${uuid}`);
    dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
      payload: error.response?.data?.message || 'Error al obtener historial',
    });
  }
};
