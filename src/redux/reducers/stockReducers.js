import {
    FETCH_USUARIO_COMPRAS_VENTAS_REQUEST,
    FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS,
    FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
    UPDATE_STOCK_REQUEST,
    UPDATE_STOCK_SUCCESS,
    UPDATE_STOCK_FAILURE,
    UPLOAD_STOCK_REQUEST,
    UPLOAD_STOCK_SUCCESS,
    UPLOAD_STOCK_FAILURE,
    STOCK_IMAGES_UPLOAD_SUCCESS,
    STOCK_IMAGES_UPLOAD_FAIL,
    CLEAR_STOCK_ERROR,
  } from '../actions/actionTypes';
  
  const initialState = {
    loading: false,
    data: [],        // Historial de compras/ventas
    items: [],       // Bienes actuales en stock
    success: null,   // Mensajes de éxito
    error: null,     // Mensajes de error
  };
  
  const stockReducer = (state = initialState, action) => {
    switch (action.type) {
      // 🔄 Compras/Ventas del usuario
      case FETCH_USUARIO_COMPRAS_VENTAS_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS:
        return {
          ...state,
          loading: false,
          data: action.payload,
        };
  
      case FETCH_USUARIO_COMPRAS_VENTAS_ERROR:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // 🔄 Actualización de stock
      case UPDATE_STOCK_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case UPDATE_STOCK_SUCCESS:
        return {
          ...state,
          loading: false,
          items: state.items.map((bien) =>
            bien.uuid === action.payload.uuid
              ? { ...bien, stock: action.payload.stock }
              : bien
          ),
        };
  
      case UPDATE_STOCK_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // 🔄 Subida masiva de stock (Excel o carga múltiple)
      case UPLOAD_STOCK_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
          success: null,
        };
  
      case UPLOAD_STOCK_SUCCESS:
        return {
          ...state,
          loading: false,
          success: action.payload.message,
          error: null,
          items: [...state.items, ...(action.payload.bienes || [])],
        };
  
      case UPLOAD_STOCK_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
          success: null,
        };
  
      // 🔄 Subida de imágenes (IMEIs o generales)
      case STOCK_IMAGES_UPLOAD_SUCCESS:
        return {
          ...state,
          loading: false,
          success: true,
        };
  
      case STOCK_IMAGES_UPLOAD_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
  
      // 🧼 Limpiar errores si es necesario
      case CLEAR_STOCK_ERROR:
        return {
          ...state,
          error: null,
        };
      
  
      default:
        return state;
    }
  };
  
  export default stockReducer;
  