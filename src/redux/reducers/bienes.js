// redux/reducers/bienesReducer.js

import {
  FETCH_BIENES_REQUEST,
  FETCH_BIENES_SUCCESS,
  FETCH_BIENES_ERROR,
  ADD_BIEN,
  ADD_BIEN_ERROR,
  FETCH_BIEN_DETAILS,
  UPDATE_BIEN,
  UPDATE_STOCK,
  REGISTRAR_VENTA_EXITO,
  REGISTRAR_VENTA_ERROR,
  REGISTRAR_COMPRA_EXITO,
  REGISTRAR_COMPRA_ERROR,
  FETCH_TRAZABILIDAD_REQUEST,
  FETCH_TRAZABILIDAD_SUCCESS,
  FETCH_TRAZABILIDAD_ERROR,
  GET_BIENES_USUARIO_REQUEST,
  GET_BIENES_USUARIO_SUCCESS,
  GET_BIENES_USUARIO_FAILURE,
  DELETE_BIEN,
} from '../actions/actionTypes';

const initialState = {
  items: [], // Lista de bienes
  item: {}, // Detalles de un bien específico
  totalPages: 0,
  currentPage: 1,
  trazabilidad: {},
  loading: false,
  bienDetalles: {
    tipo: '',
    marca: '',
    modelo: '',
    precio: '',
    cantidad: 0,
    fotos: [],
  },
  stock: [],
  error: null,
  success: false,
  searchResults: {
    bienes: [], // Inicializa con un arreglo vacío
  },
};

const bienesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BIENES_REQUEST:
    case FETCH_TRAZABILIDAD_REQUEST:
    case GET_BIENES_USUARIO_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
      case FETCH_BIENES_SUCCESS:
        return {
          ...state,
          items: action.payload.map((bien) => ({
            ...bien,
            identificadores: bien.identificadores || [], // Asegúrate de incluir los identificadores
          })),
          loading: false,
          error: null,
        };
      

    case FETCH_BIENES_ERROR:
    case FETCH_TRAZABILIDAD_ERROR:
    case GET_BIENES_USUARIO_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || action.payload || 'Error desconocido',
      };

      case ADD_BIEN:
        return {
          ...state,
          items: [...state.items, action.payload],
        };

    case ADD_BIEN_ERROR:
      return {
        ...state,
        error: action.payload,
        success: false,
      };

    case UPDATE_BIEN:
      return {
        ...state,
        items: state.items.map((item) =>
          item.uuid === action.payload.uuid ? action.payload : item // Asegúrate de usar 'uuid' en lugar de 'id' si ese es el campo correcto
        ),
        bienDetalles: {
          ...state.bienDetalles,
          ...action.payload,
          fotos: action.payload.fotos || state.bienDetalles.fotos,
        },
        success: true,
      };
      case UPDATE_STOCK:
        return {
          ...state,
          items: state.items.map((item) =>
            item.uuid === action.payload.uuid
              ? { ...item, stock: action.payload.stock }
              : item
          ),
        };

    case REGISTRAR_VENTA_EXITO:
    case REGISTRAR_COMPRA_EXITO:
      return {
        ...state,
        items: [...state.items, action.payload || {}], // Asegúrate de que 'bien' no es necesario aquí
        success: true,
        error: null,
      };

    case REGISTRAR_VENTA_ERROR:
    case REGISTRAR_COMPRA_ERROR:
      return {
        ...state,
        error: action.payload,
        success: false,
      };

    case FETCH_BIEN_DETAILS:
      return {
        ...state,
        bienDetalles: {
          ...state.bienDetalles,
          ...action.payload,
          fotos: action.payload?.fotos || [],
        },
      };

    case FETCH_TRAZABILIDAD_SUCCESS:
      return {
        ...state,
        trazabilidad: action.payload,
        loading: false,
        error: null,
      };

      case DELETE_BIEN: // Si decides agregar una acción DELETE_BIEN explícita
  return {
    ...state,
    items: state.items.filter((bien) => bien.uuid !== action.payload),
  }

    default:
      return state;
  }
};

export default bienesReducer;
