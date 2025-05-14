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
  SEARCH_REQUEST, 
  SEARCH_SUCCESS, 
  SEARCH_ERROR,
  FETCH_BIENES_EMPRESA_REQUEST,
  FETCH_BIENES_EMPRESA_SUCCESS,
  FETCH_BIENES_EMPRESA_ERROR,
  GET_BIENES_PROPIETARIO_SUCCESS,
  GET_BIENES_PROPIETARIO_FAILURE,
  GET_BIENES_PROPIETARIO_REQUEST,
  RESET_BIEN_SUCCESS,
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

      case REGISTRAR_VENTA_EXITO: {
        const transacciones = action.payload || [];
      
        return {
          ...state,
          items: state.items.map((bien) => {
            const transac = transacciones.find(t => t.bien_uuid === bien.uuid);
            if (!transac) return bien;
      
            return {
              ...bien,
              propietario_uuid: transac.comprador_uuid,
              fotos: transac.fotos || bien.fotos,
              identificadores: transac.imeis || bien.identificadores,
            };
          }),
          success: true,
          loading: false,
        };
      }
      
      case REGISTRAR_VENTA_ERROR: {
        return {
          ...state,
          error: action.payload,
          success: false,
          loading: false,
        };
      }
      
      
      
        case REGISTRAR_COMPRA_EXITO:
          const nuevosBienes = action.payload.transacciones?.map((trans) => {
            const bien = trans.bien || {}; // En caso de que venga trans.bien
            return {
              ...bien,
              uuid: bien.uuid || trans.bien_uuid,
              precio: bien.precio || trans.precio,
              fotos: trans.fotos || [],
              stock: trans.cantidad || 1,
              identificadores: trans.imeis || [], // 👈 si vienen IMEIs desde backend
              propietario_uuid: trans.comprador_uuid,
            };
          }) || [];
        
          return {
            ...state,
            items: [...state.items, ...nuevosBienes],
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
          transacciones: Array.isArray(action.payload)
            ? action.payload.map((transaccion) => ({
                ...transaccion,
                compradorTransaccion: transaccion.comprador || {},
                vendedorTransaccion: transaccion.vendedor || {},
                empresaCompradora: transaccion.empresaCompradora || null,
                empresaVendedora: transaccion.empresaVendedora || null,
                bienTransaccion: {
                  ...transaccion.bien,
                  detalles: transaccion.imeis || [],
                  fotos: transaccion.fotos || [],
                },
              }))
            : [],
          mensaje:
            Array.isArray(action.payload) && action.payload.length
              ? ''
              : 'Este bien aún no tiene transacciones.',
        };
      
      
      

  case SEARCH_REQUEST:
      return { ...state, loading: true, error: null };

    case SEARCH_SUCCESS:
      return {
        ...state,
        loading: false,
        items: Array.isArray(action.payload) ? action.payload : [],
      };
      

    case SEARCH_ERROR:
      return { ...state, loading: false, error: action.payload };


    case DELETE_BIEN:
      return {
        ...state,
        items: state.items.filter((bien) => bien.uuid !== action.payload),
      };
      case FETCH_BIENES_EMPRESA_REQUEST:
  return {
    ...state,
    loading: true,
    error: null,
  };

case FETCH_BIENES_EMPRESA_SUCCESS:
  return {
    ...state,
    loading: false,
    bienesEmpresa: action.payload,
  };

case FETCH_BIENES_EMPRESA_ERROR:
  return {
    ...state,
    loading: false,
    error: action.payload,
  };

  case GET_BIENES_PROPIETARIO_SUCCESS:
    return {
      ...state,
      loading: false,
      items: (action.payload?.bienes || []).map((bien) => ({
        ...bien,
        stock: typeof bien.stock === 'number' ? bien.stock : 0,
        identificadores: bien.identificadores || [],
        fotos: bien.fotos || [],
      })),
      totalPages: Math.ceil((action.payload?.total || 0) / (action.payload?.pageSize || 1)),
      currentPage: action.payload?.page || 1,
    };
  
  
    case GET_BIENES_PROPIETARIO_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case GET_BIENES_PROPIETARIO_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
      case RESET_BIEN_SUCCESS:
        return { ...state, success: false };
      


    default:
      return state;
  }
};

export default bienesReducer;
