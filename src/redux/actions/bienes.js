
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
    VERIFY_IMEI_REQUEST,
    VERIFY_IMEI_SUCCESS,
    VERIFY_IMEI_FAILURE,
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
    console.log("📌 Respuesta del servidor en Redux:", response.data);
    
    const sortedBienes = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    dispatch({ type: FETCH_BIENES_SUCCESS, payload: sortedBienes });

    return sortedBienes; // ✅ AHORA RETORNAMOS LOS BIENES
  } catch (error) {
    console.error('❌ Error en fetchAllBienes:', error);
    dispatch({ type: FETCH_BIENES_ERROR, payload: error.message });

    return []; // ✅ Devuelve un array vacío en caso de error para evitar undefined
  }
};



// Acción para obtener los bienes del usuario 
// Acción para obtener los bienes del usuario
export const fetchBienes = (userUuid) => async (dispatch) => {
  dispatch({ type: FETCH_BIENES_REQUEST });

  try {
    if (!userUuid) {
      console.error("❌ Error en fetchBienes: userUuid es inválido.");
      dispatch({ type: FETCH_BIENES_ERROR, payload: "No se encontró el usuario." });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Error en fetchBienes: No hay token en localStorage.");
      dispatch({ type: FETCH_BIENES_ERROR, payload: "No se encontró el token de autenticación." });
      return;
    }

    const response = await api.get(`/bienes/usuario/${userUuid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response || !response.data) {
      console.error("❌ Respuesta de API inválida en fetchBienes.");
      dispatch({ type: FETCH_BIENES_ERROR, payload: "Error al obtener bienes. Respuesta inválida." });
      return;
    }

    console.log("📌 Datos recibidos desde API:", JSON.stringify(response.data, null, 2));

    const bienesNormalizados = response.data.map((bien) => {
      const fotosCombinadas = [
        ...(bien.fotos || []),
        ...(bien.identificadores?.map(det => det.foto).filter(Boolean) || [])
      ];

      let stockReal = bien.stock || 0;
      if (bien.tipo.toLowerCase().includes("teléfono movil")) {
        stockReal = bien.identificadores?.filter(det => det.estado === "disponible").length || 0;
      }

      return {
        uuid: bien.uuid,
        tipo: bien.tipo,
        marca: bien.marca,
        modelo: bien.modelo,
        descripcion: bien.descripcion,
        stock: stockReal,
        fotos: fotosCombinadas.length > 0 ? fotosCombinadas : ['/images/placeholder.png'],
        identificadores: bien.identificadores || [],
        createdAt: bien.createdAt ? new Date(bien.createdAt) : new Date(),
      };
    });

    console.log("📌 Bienes normalizados antes de enviar a Redux:", JSON.stringify(bienesNormalizados, null, 2));

    dispatch({ type: FETCH_BIENES_SUCCESS, payload: bienesNormalizados });

    return { success: true, data: bienesNormalizados };

  } catch (error) {
    console.error("❌ Error en fetchBienes:", error);
    dispatch({
      type: FETCH_BIENES_ERROR,
      payload: error.response?.data?.message || "Error al obtener bienes.",
    });

    return { success: false, message: error.message || "Error desconocido" };
  }
};









// Acción para agregar un nuevo bien
export const addBien = (formData) => async (dispatch) => {
  dispatch({ type: ADD_BIEN_REQUEST });

  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/bienes/add', formData, {
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
export const updateBien = (uuid, formData) => async dispatch => {
  try {
      const token = getToken();

      // Realizar la solicitud con FormData
      const res = await axios.put(`/bienes/${uuid}`, formData, {
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data', // Necesario para manejar archivos
          },
      });

      // Despachar la acción al reducer
      dispatch({ type: UPDATE_BIEN, payload: res.data });
      return res.data;
  } catch (error) {
      console.error('Error updating bien:', error);
      throw error;
  }
};



// Acción para registrar una venta
// Acción para registrar una venta
// Acción para registrar una venta
export const registrarVenta = (ventaData) => async (dispatch) => {
  try {
    // Nota: No se establece manualmente el header 'Content-Type'
    const response = await api.post('/transacciones/vender', ventaData);
    return response.data; // Retorna la respuesta si es exitosa
  } catch (error) {
    console.error('Error en registrarVenta:', error);
    throw handleRequestError(error); // Se asume que tienes definida esta función para manejar errores
  }
};


// Acción para registrar una compra
// Acción para registrar una compra
export const registrarCompra = (formData) => async (dispatch) => {
  try {
    const response = await api.post('/transacciones/comprar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    dispatch({
      type: REGISTRAR_COMPRA_EXITO,
      payload: response.data,
    });

    console.log("✅ Compra registrada y almacenada en Redux:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ Error en registrarCompra:", error);

    dispatch({
      type: REGISTRAR_COMPRA_ERROR,
      payload: error.response?.data?.message || "Error desconocido al registrar la compra",
    });

    throw handleRequestError(error);
  }
};


  


  

// Acción para obtener la trazabilidad de un bien específico
export const fetchTrazabilidadBien = (bienUuid) => async (dispatch) => {
  dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

  try {
    const response = await api.get(`/bienes/trazabilidad/${bienUuid}`);
    console.log("📌 Trazabilidad recibida:", response.data);

    dispatch({
      type: FETCH_TRAZABILIDAD_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_TRAZABILIDAD_ERROR,
      payload: error.message || "Error desconocido",
    });
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
    const response = await axios.get(`/bienes/usuario/${uuid}`);
    console.log('Bienes del usuario (raw):', response.data);

    const bienesNormalizados = response.data.map((bien) => {
      // Calcula el stock según el tipo y detalles
      const stockCalculado =
        (bien.tipo.toLowerCase().includes("teléfono movil") && bien.detalles)
          ? bien.detalles.filter(det => det.estado.toLowerCase() === "disponible").length
          : (bien.stock && bien.stock.cantidad !== undefined ? bien.stock.cantidad : (bien.stock || 0));
    
      return {
        uuid: bien.uuid,
        tipo: bien.tipo,
        marca: bien.marca,
        modelo: bien.modelo,
        descripcion: bien.descripcion,
        // Asegúrate de que el precio sea numérico para poder usar toFixed
        precio: bien.precio ? Number(bien.precio) : 0,
        stock: stockCalculado,
        identificadores: bien.detalles || [],
        // Combina las fotos del bien y las fotos de cada detalle (si existen)
        fotos: [
          ...(bien.fotos || []),
          ...((bien.detalles && bien.detalles.length > 0)
              ? bien.detalles.map(det => det.foto).filter(foto => foto)
              : [])
        ],
        createdAt: new Date(bien.createdAt)
      };
    }).sort((a, b) => b.createdAt - a.createdAt);

    console.log('Bienes normalizados:', JSON.stringify(bienesNormalizados, null, 2));

    dispatch({
      type: GET_BIENES_USUARIO_SUCCESS,
      payload: bienesNormalizados,
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
      const token = localStorage.getItem('token'); // O ajusta según cómo almacenes el token
      await axios.delete(`/bienes/${uuid}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      // Opcional: Actualizar el estado global recargando la lista
      dispatch(fetchAllBienes());

      // Notificación de éxito
      notification.success({ message: 'Bien eliminado correctamente.' });
  } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el bien.';
      console.error('Error al eliminar bien:', errorMessage);

      // Notificación de error
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

export const verificarIMEI = (imei) => async (dispatch) => {
  dispatch({ type: VERIFY_IMEI_REQUEST }); // Indica el inicio de la solicitud

  try {
      const response = await api.get(`/bienes/imei-exists/${imei}`);
      const exists = response.data.exists;

      dispatch({
          type: VERIFY_IMEI_SUCCESS,
          payload: exists, // true si el IMEI existe, false de lo contrario
      });

      return exists;
  } catch (error) {
      console.error('Error al verificar IMEI:', error);

      dispatch({
          type: VERIFY_IMEI_FAILURE,
          payload: error.message || 'Error al verificar el IMEI.',
      });

      throw error;
  }
};