import { retry } from 'async';
import axios from '../axiosConfig';
import { message } from 'antd';

import {
    FETCH_BIENES,
    ADD_BIEN,
    ADD_BIEN_REQUEST,
    ADD_BIEN_ERROR,
    ADD_BIEN_SUCCESS,
    FETCH_BIEN_DETAILS,
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



// Acción para obtener todos los bienes disponibles
export const fetchAllBienes = () => async (dispatch) => {
    dispatch({ type: FETCH_BIENES_REQUEST });

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado en localStorage');

        const response = await axios.get('/bienes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Respuesta de la API:', response.data);
        dispatch({ type: FETCH_BIENES_SUCCESS, payload: response.data });
    } catch (error) {
        console.error('Error al obtener los bienes:', error.message);
        dispatch({ type: FETCH_BIENES_ERROR, payload: error.message });
    }
};




// Acción para obtener los bienes del usuario
export const fetchBienes = (userId) => async (dispatch) => {
    dispatch({ type: FETCH_BIENES_REQUEST });

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado en localStorage');
        if (!userId) throw new Error('ID de usuario no encontrado');  // Asegúrate de que userId esté presente

        const response = await axios.get(`/bienes/usuario/${userId}/stock`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Respuesta de la API:', response.data);
        dispatch({ type: FETCH_BIENES_SUCCESS, payload: response.data });
    } catch (error) {
        console.error('Error al obtener los bienes:', error.message);
        dispatch({ type: FETCH_BIENES_ERROR, payload: error.message });
    }
};

// Acción para agregar un nuevo bien
// Acción para agregar un nuevo bien
export const addBien = (bienData) => async dispatch => {
    dispatch({ type: ADD_BIEN_REQUEST });
    try {
        const response = await axios.post('/bienes', bienData);  // Usa la instancia configurada de Axios
        dispatch({
            type: ADD_BIEN_SUCCESS,
            payload: response.data  // Asegúrate de que esto contiene el bien creado
        });
        return response.data;  // Asegúrate de devolver la respuesta completa
    } catch (error) {
        dispatch({
            type: ADD_BIEN_ERROR,
            error: error.response ? error.response.data : error.message
        });
        return { error: error.response ? error.response.data : error.message };  // Manejo de errores
    }
};




// Acción para obtener los detalles de un bien específico
export const fetchBienDetails = (bienId) => async (dispatch) => {
    try {
        const res = await axios.get(`/bienes/${bienId}`);
        dispatch({
            type: FETCH_BIEN_DETAILS,
            payload: res.data
        });
    } catch (error) {
        console.error('Error fetching bien details:', error);
        // Maneja el error y devuelve un estado predecible
        dispatch({
            type: FETCH_BIEN_DETAILS_ERROR,
            payload: error.message
        });
    }
};



// Acción para actualizar un bien existente
export const updateBien = (id, bienData) => async dispatch => {
    try {
        const res = await axios.put(`/bienes/${id}`, bienData);
        dispatch({
            type: UPDATE_BIEN,
            payload: res.data
        });
    } catch (error) {
        console.error('Error updating bien:', error);
        // Manejar el error adecuadamente
    }
};

// Acción para registrar una venta
export const registrarVenta = (ventaData) => async (dispatch) => {
    try {
        const response = await axios.post('/vender', ventaData); // Asegúrate de que la URL sea correcta
        dispatch({
            type: REGISTRAR_VENTA_EXITO,
            payload: response.data
        });
        dispatch({
            type: UPDATE_STOCK,
            payload: response.data.bien // Actualiza el stock con la información del bien vendido
        });
    } catch (error) {
        console.error('Error al registrar la venta:', error);
        dispatch({
            type: REGISTRAR_VENTA_ERROR,
            payload: error.message
        });
    }
};


// Acción para registrar una compra
export const registrarCompra = (compraData) => async (dispatch, getState) => {
    console.log('Datos enviados a registrarCompra:', compraData);

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no encontrado en el localStorage');
        return dispatch({ type: 'ERROR', payload: 'Token no encontrado en el estado global' });
    }

    // Validar que los datos necesarios estén presentes
    const { fecha, precio, cantidad, compradorId, vendedorId, bienId, estado, metodoPago } = compraData;
    if (!fecha || !precio || !cantidad || !compradorId || !vendedorId || !bienId || !estado || !metodoPago) {
        throw new Error('Faltan datos necesarios para registrar la compra');
    }
    


    try {
        // Registrar la compra
        const response = await axios.post('/bienes/comprar', compraData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Respuesta del backend:', response.data);

        // Verificar que la transacción se ha registrado
        if (response.data.mensaje === 'Compra registrada con éxito') {
            dispatch({ type: REGISTRAR_COMPRA_EXITO, payload: response.data });
        } else {
            throw new Error('La respuesta del backend no indica éxito');
        }
    } catch (error) {
        console.error('Error al registrar la compra:', error.response ? error.response.data : error.message);
        dispatch({ type: REGISTRAR_COMPRA_ERROR, payload: error.response ? error.response.data : error.message });
    }
};


// Acción para obtener la trazabilidad de un bien específico
export const fetchTrazabilidadBien = (bienUuid) => async (dispatch) => {
    dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado en localStorage');

        const response = await axios.get(`bienes/transacciones/trazabilidad/${bienUuid}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Trazabilidad del bien:', response.data);
        dispatch({
            type: FETCH_TRAZABILIDAD_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message; // Captura mensaje del servidor
        console.error('Error al obtener la trazabilidad del bien:', errorMessage);
        dispatch({
            type: FETCH_TRAZABILIDAD_ERROR,
            payload: errorMessage
        });
    }
};



