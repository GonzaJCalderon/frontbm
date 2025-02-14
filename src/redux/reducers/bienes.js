import {
  FETCH_BIENES_REQUEST,
  FETCH_BIENES_SUCCESS,
  FETCH_BIENES_ERROR,
  ADD_BIEN,
  ADD_BIENES,
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
  GET_BIENES_USUARIO_FAILURE, 
  GET_BIENES_USUARIO_SUCCESS,
  DELETE_BIEN,
} from '../actions/actionTypes';

const initialState = {
  items: [], // Lista de bienes
  item: {}, // Detalles de un bien específico
  totalPages: 0,
  currentPage: 1,
  trazabilidad: [],
  transacciones: [],
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
  mensaje: '',
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
      case GET_BIENES_USUARIO_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload,  // Aquí se asignan los bienes normalizados
      };

    case FETCH_BIENES_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.map((bien) => ({
          ...bien,
          stock: bien.stock !== undefined && bien.stock !== null ? bien.stock : 'No disponible',
          identificadores: bien.identificadores || [],
          todasLasFotos: bien.todasLasFotos || [],
        })),
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

    case ADD_BIENES:
      return {
        ...state,
        items: [
          ...state.items,
          ...action.payload.map((bien) => ({
            ...bien,
            identificadores: bien.identificadores || [],
            stock: bien.stock || 0,
          })),
        ],
        loading: false,
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
          item.uuid === action.payload.uuid
            ? {
                ...item,
                ...action.payload,
                identificadores: action.payload.identificadores || item.identificadores,
              }
            : item
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
          item.uuid === action.payload.uuid ? { ...item, stock: action.payload.stock } : item
        ),
      };

      case REGISTRAR_VENTA_EXITO:
        return {
          ...state,
          items: state.items.map(bien => 
            bien.uuid === action.payload.uuid
              ? {
                  ...bien,
                  propietario: action.payload.propietario ?? bien.propietario,
                  stock: action.payload.stock ?? bien.stock,
                  fechaActualizacion: action.payload.updatedAt ?? bien.fechaActualizacion,
                }
              : bien
          ),
          success: true,
        };
      
        case REGISTRAR_COMPRA_EXITO:
          return {
            ...state,
            items: [
              ...state.items,
              ...action.payload.transacciones?.map((transaccion) => transaccion.bien || transaccion.bien_uuid) || [],
            ],
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
    loading: false,
    transacciones: action.payload.map(transaccion => ({
      ...transaccion,
      fotos: transaccion.fotos || [],
      imeis: transaccion.imeis || [],
    })),
    mensaje: action.payload.length ? '' : 'Este bien aún no tiene transacciones.',
  };


    case DELETE_BIEN:
      return {
        ...state,
        items: state.items.filter((bien) => bien.uuid !== action.payload),
      };

    default:
      return state;
  }
};

export default bienesReducer;
