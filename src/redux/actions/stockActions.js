import axios from 'axios';
import { 
    UPDATE_STOCK, 
    FETCH_USUARIO_COMPRAS_VENTAS_REQUEST, 
    FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS, 
    FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
    REGISTRAR_COMPRA_ERROR,
    UPDATE_STOCK_REQUEST,
     UPDATE_STOCK_SUCCESS, 
     UPDATE_STOCK_FAILURE
} from './actionTypes';

export const registrarVenta = (ventaData) => async (dispatch) => {
    try {
      const response = await axios.post('http://localhost:5000/bienes/transaccion', ventaData);
      dispatch({ type: 'REGISTRAR_VENTA_EXITO', payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      dispatch({ type: 'REGISTRAR_VENTA_ERROR', payload: error });
      throw error;
    }
  };

  export const registrarCompra = (compraData) => async (dispatch, getState) => {
    try {
        // Obtén el token del estado global
        const { auth: { token } } = getState();
        if (!token) throw new Error('Token no encontrado en el estado global');

        // Obtener el comprador desde el localStorage
        const comprador = JSON.parse(localStorage.getItem('usuario'));
        if (!comprador) throw new Error('No se encontró el comprador en el localStorage');

        // Agregar el compradorId a los datos de la compra
        const datosCompra = {
            ...compraData,
            compradorId: comprador.id, // Asume que el ID del comprador está en `comprador.id`
        };

        // Verifica los datos que se van a enviar
        console.log('Datos enviados a /bienes/comprar:', datosCompra);

        const response = await axios.post('http://localhost:5000/bienes/comprar', datosCompra, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Asegúrate de que la respuesta contiene la estructura esperada
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


export const uploadStockExcel = (file) => async (dispatch) => {
    try {
        dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_REQUEST });

        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('http://localhost:5000/stock/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        dispatch({
            type: FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
            payload: error.message,
        });
    }
};

export const fetchUsuarioComprasVentas = (userId) => async (dispatch) => {
    dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_REQUEST });
    try {
        const response = await axios.get(`http://localhost:5000/usuarios/${userId}/compras-ventas`);
        dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({ type: FETCH_USUARIO_COMPRAS_VENTAS_ERROR, payload: error.message });
    }
};

export const searchItems = (term) => async (dispatch) => {
    try {
        const response = await axios.get(`http://localhost:5000/stock?search=${term}`);
        dispatch({
            type: 'SEARCH_ITEMS_SUCCESS',
            payload: response.data, // Suponiendo que response.data es un array de bienes
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
      const response = await axios.patch(`/bienes/${bienId}`, { stock: cantidad });
      dispatch({ type: UPDATE_STOCK_SUCCESS, payload: response.data });
    } catch (error) {
      dispatch({ type: UPDATE_STOCK_FAILURE, payload: error.message });
    }
  };
