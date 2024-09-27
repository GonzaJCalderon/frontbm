import axios from '../axiosConfig';
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
    REGISTRAR_COMPRA_SUCCESS,
    REGISTRAR_COMPRA_ERROR,
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

        dispatch({ type: FETCH_BIENES_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_BIENES_ERROR, payload: error.response ? error.response.data : error.message });
    }
};

// Acción para agregar un nuevo bien
export const addBien = (bienData) => async dispatch => {
    dispatch({ type: ADD_BIEN_REQUEST });
    try {
        const token = getToken();
        const response = await axios.post('/bienes', bienData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        dispatch({ type: ADD_BIEN_SUCCESS, payload: response.data });
        return response.data;
    } catch (error) {
        dispatch({
            type: ADD_BIEN_ERROR,
            error: error.response ? error.response.data : error.message
        });
        return { error: error.response ? error.response.data : error.message };
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
export const registrarVenta = (ventaData) => async (dispatch) => {
    try {
        const token = getToken();
        const response = await axios.post('/vender', ventaData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        dispatch({ type: REGISTRAR_VENTA_EXITO, payload: response.data });
        dispatch({ type: UPDATE_STOCK, payload: response.data.bien });
    } catch (error) {
        dispatch({
            type: REGISTRAR_VENTA_ERROR,
            payload: error.response ? error.response.data : error.message
        });
    }
};

// Acción para registrar una compra
export const registrarCompra = (compraData) => async (dispatch) => {
    const token = getToken();
    if (!token) {
        return dispatch({ type: 'ERROR', payload: 'Token no encontrado en el estado global' });
    }

    try {
        const response = await axios.post('/bienes/comprar', compraData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.mensaje === 'Compra registrada con éxito') {
            dispatch({ type: REGISTRAR_COMPRA_EXITO, payload: response.data });
        } else {
            throw new Error('La respuesta del backend no indica éxito');
        }
    } catch (error) {
        dispatch({ type: REGISTRAR_COMPRA_ERROR, payload: error.response ? error.response.data : error.message });
    }
};

// Acción para obtener la trazabilidad de un bien específico
export const fetchTrazabilidadBien = (bienUuid) => async (dispatch) => {
    dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

    try {
        const token = getToken();
        const response = await axios.get(`/bienes/transacciones/trazabilidad/${bienUuid}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        dispatch({ type: FETCH_TRAZABILIDAD_SUCCESS, payload: response.data });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch({ type: FETCH_TRAZABILIDAD_ERROR, payload: errorMessage });
    }
};
