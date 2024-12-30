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
} from '../actions/actionTypes';

const initialState = {
    loading: false,
    data: [],         // Almacena datos de compras/ventas
    items: [],        // Almacena bienes para stock
    success: null,    // Mensaje de éxito
    error: null,      // Almacena errores
};

const stockReducer = (state = initialState, action) => {
    switch (action.type) {
        // FETCH COMPRAS/VENTAS
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

        // UPDATE STOCK
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
                items: state.items.map(bien =>
                    bien.id === action.payload.id 
                        ? { ...bien, stock: action.payload.stock } 
                        : bien
                ),
            };
        case UPDATE_STOCK_FAILURE:
            return { 
                ...state, 
                loading: false, 
                error: action.payload 
            };

        // UPLOAD STOCK
        case UPLOAD_STOCK_REQUEST:
            return { 
                ...state, 
                loading: true, 
                error: null, 
                success: null 
            };
        case UPLOAD_STOCK_SUCCESS:
            return { 
                ...state, 
                loading: false, 
                success: action.payload.message, 
                error: null 
            };
        case UPLOAD_STOCK_FAILURE:
            return { 
                ...state, 
                loading: false, 
                error: action.payload, 
                success: null 
            };

            case STOCK_IMAGES_UPLOAD_SUCCESS:
    return {
        ...state,
        success: true,
        loading: false,
    };
case STOCK_IMAGES_UPLOAD_FAIL:
    return {
        ...state,
        loading: false,
        error: action.payload,
    };


        default:
            return state;
    }
};

export default stockReducer;
