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
    FETCH_BIENES,
    FETCH_TRAZABILIDAD_REQUEST,
    FETCH_TRAZABILIDAD_SUCCESS,
    FETCH_TRAZABILIDAD_ERROR,
} from '../actions/actionTypes';

const initialState = {
    items: [],
    item: {},
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
};

const bienesReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_BIENES_REQUEST:
        case FETCH_TRAZABILIDAD_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_BIENES:
            console.log('Reducer FETCH_BIENES:', action.payload);
            return {
                ...state,
                loading: true,
            };
        case FETCH_BIENES_SUCCESS:
            console.log('Reducer FETCH_BIENES_SUCCESS:', action.payload);
            return {
                ...state,
                items: action.payload,
                loading: false,
                error: null, // Limpiar error al obtener bienes con éxito
            };
        case FETCH_BIENES_ERROR:
            console.error('Error al obtener bienes en el reducer:', action.payload);
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
            case ADD_BIEN:
                return {
                    ...state,
                    items: [...state.items, action.payload], // Añade el nuevo bien al array de items
                    bienDetalles: {
                        ...state.bienDetalles,
                        ...action.payload,
                        fotos: [...(action.payload.fotos || [])], // Asegura fotos como array usando spread
                    },
                    success: true, // Actualiza success para indicar que fue exitoso
                    error: null,   // Resetea cualquier error anterior
                };
            
        case ADD_BIEN_ERROR:
            return {
                ...state,
                error: action.payload,
                success: false,
            };
        case FETCH_BIEN_DETAILS:
            console.log('Detalles del bien obtenidos:', action.payload);
            return {
                ...state,
                bienDetalles: {
                    ...state.bienDetalles,
                    ...action.payload,
                    fotos: action.payload.fotos || [],
                },
            };
        case UPDATE_BIEN:
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id ? action.payload : item
                ),
                bienDetalles: {
                    ...state.bienDetalles,
                    ...action.payload,
                    fotos: action.payload.fotos || [],
                },
            };
        case UPDATE_STOCK:
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id ? { ...item, stock: action.payload.stock } : item
                ),
            };
        case REGISTRAR_VENTA_EXITO:
        case REGISTRAR_COMPRA_EXITO:
            return {
                ...state,
                error: null,
                success: true,
                items: action.type === REGISTRAR_COMPRA_EXITO ? [...state.items, action.payload.bien] : state.items,
            };
        case REGISTRAR_VENTA_ERROR:
        case REGISTRAR_COMPRA_ERROR:
            return {
                ...state,
                error: action.payload,
                success: false,
            };
        case FETCH_TRAZABILIDAD_SUCCESS:
            return {
                ...state,
                trazabilidad: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_TRAZABILIDAD_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default bienesReducer;
