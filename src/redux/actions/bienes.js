
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
    SEARCH_REQUEST, 
    SEARCH_SUCCESS, 
    SEARCH_ERROR,
    FETCH_BIENES_EMPRESA_REQUEST,
    FETCH_BIENES_EMPRESA_SUCCESS,
    FETCH_BIENES_EMPRESA_ERROR,
    GET_BIENES_PROPIETARIO_FAILURE,
    GET_BIENES_PROPIETARIO_SUCCESS,
    GET_BIENES_PROPIETARIO_REQUEST,
    } from './actionTypes';




const handleRequestError = (error) => {
  if (error.response) {
    return error.response.data.message || 'Error al procesar la solicitud en el servidor.';
  } else if (error.request) {
    return 'No se recibió respuesta del servidor.';
  } else {
    return `Error en la solicitud: ${error.message}`;
  }
};


// Función para obtener el token del localStorage
const getToken = () => localStorage.getItem('token');

export const fetchAllBienes = () => async (dispatch) => {
  dispatch({ type: FETCH_BIENES_REQUEST });

  try {
    const response = await api.get('/bienes');

    const sortedBienes = response.data.sort(
      (a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion)
    );

    dispatch({ type: FETCH_BIENES_SUCCESS, payload: sortedBienes });

    return sortedBienes;
  } catch (error) {
    dispatch({ type: FETCH_BIENES_ERROR, payload: error.message });
    return [];
  }
};




// Acción para obtener los bienes del usuario 
export const fetchBienes = () => async (dispatch) => {
  dispatch({ type: FETCH_BIENES_REQUEST });

  try {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    if (!token || !userData?.uuid) {
      dispatch({
        type: FETCH_BIENES_ERROR,
        payload: "Faltan datos de autenticación o usuario.",
      });
      return { success: false, message: "Datos de autenticación incompletos." };
    }

    const empresaUuid = userData?.empresaUuid;
    const usuarioUuid = userData?.uuid;

    if (!usuarioUuid) {
      dispatch({
        type: FETCH_BIENES_ERROR,
        payload: "Falta el UUID del usuario.",
      });
      return { success: false, message: "Falta el UUID del usuario." };
    }

    let url;

    if (empresaUuid && typeof empresaUuid === 'string' && empresaUuid.length === 36) {
      url = `/bienes/empresa/${empresaUuid}`;
    } else {
      url = `/bienes/usuario/${usuarioUuid}?incluirDelegados=true`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const bienesRaw = empresaUuid ? response.data : response.data?.data;

    if (!Array.isArray(bienesRaw)) {
      throw new Error("La respuesta del servidor no contiene una lista válida de bienes.");
    }

    const bienesNormalizados = bienesRaw.map((bien) => {
      const esTelefonoMovil = bien.tipo?.toLowerCase().includes("teléfono movil");

      let stockCalculado = 0;

      if (esTelefonoMovil && Array.isArray(bien.identificadores)) {
        stockCalculado = bien.identificadores.filter((i) => i.estado === 'disponible').length;
      } else if (typeof bien.stock === 'number') {
        stockCalculado = bien.stock;
      }

      const fotosCombinadas = [
        ...(bien.fotos || []),
        ...(bien.identificadores?.map((d) => d.foto).filter(Boolean) || []),
      ];

      return {
        uuid: bien.uuid,
        tipo: bien.tipo,
        marca: bien.marca,
        modelo: bien.modelo,
        descripcion: bien.descripcion,
        precio: Number(bien.precio || 0),
        stock: stockCalculado,
        fotos: fotosCombinadas.length > 0 ? fotosCombinadas : ['/images/placeholder.png'],
        identificadores: bien.identificadores || [],
        createdAt: bien.createdAt ? new Date(bien.createdAt) : new Date(),
      };
    });

    dispatch({
      type: FETCH_BIENES_SUCCESS,
      payload: bienesNormalizados,
    });

    return { success: true, data: bienesNormalizados };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Error al obtener bienes.";
    dispatch({ type: FETCH_BIENES_ERROR, payload: msg });
    return { success: false, message: msg };
  }
};







export const addBien = (formData) => async (dispatch) => {
  dispatch({ type: ADD_BIEN_REQUEST });

  try {
    const token = localStorage.getItem('authToken');
    const response = await api.post('/bienes/crear', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    const bienUuid = response?.data?.bien?.uuid;
    const cantidadEsperada = formData.get('stock')
      ? JSON.parse(formData.get('stock'))?.cantidad || 0
      : 0;

    if (!bienUuid || !cantidadEsperada) {
      throw new Error("❌ No se pudo obtener UUID del bien o cantidad esperada.");
    }

    // 🔁 Esperar hasta que los identificadores (IMEIs) estén disponibles
   let retries = 10;
let bienConfirmado = false;
let disponibles = 0; // 🔧 Inicializada fuera del bucle


    while (retries > 0 && !bienConfirmado) {
      const check = await api.get(`/bienes/buscar/${bienUuid}`);
      const identificadores = check?.data?.bien?.identificadores || [];
      const disponibles = identificadores.filter(i => i.estado === 'disponible').length;

      if (disponibles >= cantidadEsperada) {
        bienConfirmado = true;
        break;
      }

      await new Promise((res) => setTimeout(res, 800));
      retries--;
    }
if (!bienConfirmado) {
  throw new Error(
    `❌ El bien fue creado, pero solo se generaron ${disponibles || 0} IMEIs de los ${cantidadEsperada} esperados.`
  );
}


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
      throw error;
  }
};

// redux/actions/bienes.js
export const fetchFotosDeBien = (bienUuid) => async () => {
  try {
    const res = await api.get(`/bienes/${bienUuid}/fotos`);
    return res.data?.fotos || [];
  } catch (err) {
    console.error(err);
    throw new Error('No se pudieron cargar las fotos del bien.');
  }
};




// Acción para registrar una venta

// Acción para registrar una venta
export const registrarVenta = (ventaData) => async (dispatch) => {
  try {
    const response = await api.post('/transacciones/vender', ventaData);
    console.log('✅ RESPUESTA BACKEND:', response.data); // <-- AGREGALO ACÁ

    dispatch({
      type: REGISTRAR_VENTA_EXITO,
      payload: response.data.transacciones,
    });

    return { success: true, message: response.data.message };

  } catch (error) {
    const mensajeError = error.response?.data?.error || error.message || 'Error al registrar venta';
    console.error('❌ ERROR registrarVenta:', mensajeError); // <-- AGREGALO TAMBIÉN

    dispatch({
      type: REGISTRAR_VENTA_ERROR,
      payload: mensajeError,
    });

    return { success: false, message: mensajeError };
  }
};





export const registrarCompra = (formData) => async (dispatch) => {
  try {
    const response = await api.post('/transacciones/comprar', formData); // ❌ no pongas Content-Type

    const { data } = response;

    // Validar que sea success real
    if (response.status === 201 && data.success) {
      dispatch({
        type: REGISTRAR_COMPRA_EXITO,
        payload: data,
      });

      message.success(data.message || '✅ Compra registrada con éxito.');
      return { success: true, data };
    } else {
      const errorMsg = data.message || 'La compra no pudo registrarse.';
      throw new Error(errorMsg);
    }

  } catch (error) {
    const msg = error?.response?.data?.error || error?.message || '❌ Error desconocido al registrar la compra.';

    dispatch({
      type: REGISTRAR_COMPRA_ERROR,
      payload: msg,
    });

    message.error(msg);
    return { success: false, message: msg };
  }
};









  


  

// Acción para obtener la trazabilidad de un bien específico
export const fetchTrazabilidadBien = (identificadorUnico) => async (dispatch) => {
  dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

  try {
    const response = await api.get(`/bienes/trazabilidad-identificador/${identificadorUnico}`);

    dispatch({
      type: FETCH_TRAZABILIDAD_SUCCESS,
      payload: Array.isArray(response.data.historial)
      ? response.data.historial.map((t) => ({
          ...t,
          compradorTransaccion: t.comprador,
          vendedorTransaccion: t.vendedor,
          empresaCompradora: t.empresaCompradora || null,
          empresaVendedora: t.empresaVendedora || null,
          bien: t.bien,
          imeis: t.bien?.detalles || [],
          fotos: t.bien?.fotos || [],
        }))
      : [],
    });
  } catch (error) {
    dispatch({
      type: FETCH_TRAZABILIDAD_ERROR,
      payload: error.message || "Error al obtener trazabilidad",
    });
  }
};


export const fetchTrazabilidadPorBien = (uuid) => async (dispatch) => {
  dispatch({ type: FETCH_TRAZABILIDAD_REQUEST });

  try {
    const response = await api.get(`/bienes/trazabilidad/${uuid}`);

    dispatch({
      type: FETCH_TRAZABILIDAD_SUCCESS,
      payload: Array.isArray(response.data) ? response.data : [], // 👈 Misma validación importante
    });
  } catch (error) {
    dispatch({
      type: FETCH_TRAZABILIDAD_ERROR,
      payload: error.message || "Error al obtener trazabilidad",
    });
  }
};





export const actualizarStockPorParametros = (updatedData) => async (dispatch) => {
  const { tipo, marca, modelo, cantidad, tipoOperacion } = updatedData;

  // Verificar parámetros requeridos
  if (!tipo || !marca || !modelo || !cantidad || !tipoOperacion) {
    throw new Error('Faltan parámetros requeridos: tipo, marca, modelo, cantidad, tipoOperacion.');
  }


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
// Acción para obtener bienes de un usuario específico
export const fetchBienesPorUsuario = (uuid, incluirDelegados = false) => async (dispatch) => {
  dispatch({ type: GET_BIENES_USUARIO_REQUEST });

  try {
    const queryString = incluirDelegados ? '?incluirDelegados=true' : '';
    const response = await axios.get(`/bienes/usuario/${uuid}${queryString}`);

    const bienesNormalizados = response.data.data.map((bien) => {
      const stockCalculado =
        bien.tipo?.toLowerCase().includes("teléfono movil") && bien.identificadores
          ? bien.identificadores.length
          : bien.stock || 0;

      return {
        ...bien,
        precio: Number(bien.precio || 0),
        stock: stockCalculado,
        createdAt: new Date(bien.createdAt),
      };
    });

    dispatch({
      type: GET_BIENES_USUARIO_SUCCESS,
      payload: bienesNormalizados,
    });

    // 🔧 FIX: agregar return explícito como lo hace fetchBienesPorEmpresa
    return { success: true, data: bienesNormalizados };

  } catch (error) {
    dispatch({
      type: GET_BIENES_USUARIO_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });

    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Error al obtener bienes',
    };
  }
};

export const fetchBienesPorPropietario = (uuid, page = 1, limit = 30, search = '') => async (dispatch) => {
  dispatch({ type: GET_BIENES_PROPIETARIO_REQUEST });

  try {
    const offset = (page - 1) * limit;
    const res = await api.get(`/bienes/propietario/${uuid}?limit=${limit}&offset=${offset}&search=${search}`);
    const bienesRaw = res.data?.data || [];

    const bienesNormalizados = bienesRaw.map((bien) => {
      const esTelefonoMovil = bien.tipo?.toLowerCase().includes("teléfono movil");

      const stockCalculado = esTelefonoMovil
        ? (bien.identificadores || []).filter((i) => i.estado === 'disponible').length
        : (bien.stock || 0);

      const fotosCombinadas = [
        ...(bien.fotos || []),
        ...(bien.identificadores?.map((d) => d.foto).filter(Boolean) || [])
      ];

      return {
        uuid: bien.uuid,
        tipo: bien.tipo,
        marca: bien.marca,
        modelo: bien.modelo,
        descripcion: bien.descripcion,
        precio: Number(bien.precio || 0),
        stock: stockCalculado,
        fotos: fotosCombinadas.length > 0 ? fotosCombinadas : ['/images/placeholder.png'],
        identificadores: bien.identificadores || [],
        createdAt: bien.createdAt ? new Date(bien.createdAt) : new Date(),
      };
    });

    dispatch({
      type: GET_BIENES_PROPIETARIO_SUCCESS,
      payload: {
        bienes: bienesNormalizados,
        total: res.data?.total || bienesNormalizados.length,
        page: res.data?.page || 1,
        pageSize: res.data?.pageSize || limit,
      },
    });

    return {
      success: true,
      data: bienesNormalizados,
      total: res.data?.total || bienesNormalizados.length,
      page: res.data?.page || 1,
      pageSize: res.data?.pageSize || limit,
    };

  } catch (error) {
    dispatch({
      type: GET_BIENES_PROPIETARIO_FAILURE,
      payload: error.response?.data?.message || 'Error al obtener los bienes del propietario',
    });

    return { success: false, message: error.message };
  }
};




export const fetchBienesPorEmpresa = (empresaUuid) => async (dispatch) => {
  dispatch({ type: FETCH_BIENES_EMPRESA_REQUEST });

  try {
    const res = await api.get(`/bienes/empresa/${empresaUuid}`);
    const bienesRaw = res.data?.data || res.data; // por si viene como `data: [...]`

    const bienesNormalizados = bienesRaw.map((bien) => {
      const esTelefonoMovil = bien.tipo?.toLowerCase().includes("teléfono movil");

      let stockCalculado = 0;
      if (esTelefonoMovil && Array.isArray(bien.identificadores)) {
        stockCalculado = bien.identificadores.filter(i => i.estado === 'disponible').length;
      } else if (typeof bien.stock === 'number') {
        stockCalculado = bien.stock;
      }

      const fotosCombinadas = [
        ...(bien.fotos || []),
        ...(bien.identificadores?.map((d) => d.foto).filter(Boolean) || [])
      ];

      return {
        uuid: bien.uuid,
        tipo: bien.tipo,
        marca: bien.marca,
        modelo: bien.modelo,
        descripcion: bien.descripcion,
        precio: Number(bien.precio || 0),
        stock: stockCalculado,
        fotos: fotosCombinadas.length > 0 ? fotosCombinadas : ['/images/placeholder.png'],
        identificadores: bien.identificadores || [],
        createdAt: bien.createdAt ? new Date(bien.createdAt) : new Date(),
      };
    });

    dispatch({
      type: FETCH_BIENES_EMPRESA_SUCCESS,
      payload: bienesNormalizados,
    });

    return { success: true, data: bienesNormalizados };
  } catch (error) {
    dispatch({
      type: FETCH_BIENES_EMPRESA_ERROR,
      payload: error.response?.data?.message || 'Error al obtener los bienes de la empresa',
    });

    return { success: false, message: error.message };
  }
};



export const agregarMarca = (tipo, marca) => async (dispatch) => {
  try {
    const response = await axios.post('bienes/bienes/marcas', { tipo, marca });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const agregarModelo = (tipo, marca, modelo) => async (dispatch) => {
  try {
    const response = await axios.post('bienes/bienes/modelos', { tipo, marca, modelo });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const actualizarStock = (params) => async (dispatch) => {
  try {
    const response = await axios.put('/bienes/actualizar-stock', params);
    dispatch({ type: UPDATE_STOCK, payload: response.data });
  } catch (error) {
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



export const buscarBienes = (term) => async (dispatch) => {
  dispatch({ type: SEARCH_REQUEST });

  try {
    const response = await api.get('/bienes/buscar', { params: { term } });

    dispatch({
      type: SEARCH_SUCCESS,
      payload: response.data.results || [],
    });
  } catch (error) {
    dispatch({
      type: SEARCH_ERROR,
      payload: error.message || 'Error al buscar bienes.',
    });
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

      dispatch({
          type: VERIFY_IMEI_FAILURE,
          payload: error.message || 'Error al verificar el IMEI.',
      });

      throw error;
  }
};