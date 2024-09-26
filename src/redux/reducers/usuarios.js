import {
    FETCH_USUARIOS_REQUEST,
    FETCH_USUARIOS_SUCCESS,
    FETCH_USUARIOS_ERROR,
    FETCH_USUARIO_DETAILS_REQUEST,
    FETCH_USUARIO_DETAILS_SUCCESS,
    FETCH_USUARIO_DETAILS_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    ADD_USUARIO_REQUEST,
    ADD_USUARIO_SUCCESS,
    ADD_USUARIO_ERROR,
    FETCH_COMPRAS_VENTAS_REQUEST,
    FETCH_COMPRAS_VENTAS_SUCCESS,
    FETCH_COMPRAS_VENTAS_ERROR,
    DELETE_USUARIO_REQUEST,
    DELETE_USUARIO_SUCCESS,
    DELETE_USUARIO_ERROR,
    ASSIGN_ROLE_REQUEST,
    ASSIGN_ROLE_SUCCESS,
    ASSIGN_ROLE_ERROR,
    RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_ERROR,
    UPDATE_USER_REQUEST,
    UPDATE_USER_SUCCESS,
    UPDATE_USER_ERROR,
    SET_USER_DETAILS,
    FETCH_OR_CREATE_VENDEDOR_REQUEST,
    FETCH_OR_CREATE_VENDEDOR_SUCCESS,
    FETCH_OR_CREATE_VENDEDOR_ERROR,
    BUSCAR_VENDEDOR_REQUEST,
    BUSCAR_VENDEDOR_SUCCESS,
    BUSCAR_VENDEDOR_FAIL,
    BUSCAR_USUARIO_DNI_REQUEST,
    BUSCAR_USUARIO_DNI_SUCCESS,
    BUSCAR_USUARIO_DNI_ERROR,
    FETCH_TRANSACCIONES_REQUEST, 
    FETCH_TRANSACCIONES_SUCCESS, 
    FETCH_TRANSACCIONES_ERROR 
} from '../actions/actionTypes';

const initialState = {
    isAuthenticated: false,
    usuarios: [],
    user: null,
    userDetails: {},
    items: [],
    currentPage: 1,
    role: '',
    vendedor: null,
    loading: false,
    error: null,
    comprasVentas: {
        bienesComprados: [],
        bienesVendidos: [],
    },
};

// Reducer
const usuariosReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_USUARIOS_REQUEST:
            return {
                ...state,
                loading: true
            };
        case FETCH_USUARIOS_SUCCESS:
            return {
                ...state,
                usuarios: action.payload,
                loading: false
            };
        case FETCH_USUARIOS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };
        case FETCH_USUARIO_DETAILS_REQUEST:
            return {
                ...state,
                loading: true
            };
        case FETCH_USUARIO_DETAILS_SUCCESS:
            return {
                ...state,
                userDetails: action.payload,
                loading: false
            };
        case FETCH_USUARIO_DETAILS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case LOGIN_REQUEST:
            return {
                ...state,
                loading: true
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.usuario,
                token: action.payload.token,
                loading: false,
                error: null,
            };
        case LOGIN_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case ADD_USUARIO_REQUEST:
            return {
                ...state,
                loading: true
            };
        case ADD_USUARIO_SUCCESS:
            return {
                ...state,
                usuarios: [...state.usuarios, action.payload],
                loading: false
            };
        case ADD_USUARIO_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };
        case FETCH_COMPRAS_VENTAS_REQUEST:
            return { ...state, loading: true, error: null };

        // Reducer
        case FETCH_COMPRAS_VENTAS_SUCCESS:
            return {
                ...state,
                comprasVentas: {
                    bienesComprados: action.payload.bienesComprados || [],
                    bienesVendidos: action.payload.bienesVendidos || []
                },
                loading: false,
                error: null
            };


        case FETCH_COMPRAS_VENTAS_ERROR:
            return { ...state, loading: false, error: action.payload };

        case DELETE_USUARIO_REQUEST:
            return {
                ...state,
                loading: true
            };
        case DELETE_USUARIO_SUCCESS:
            return {
                ...state,
                usuarios: state.usuarios.filter(usuario => usuario.id !== action.payload),
                loading: false
            };
        case DELETE_USUARIO_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };
        case ASSIGN_ROLE_REQUEST:
            return {
                ...state,
                loading: true
            };
        case ASSIGN_ROLE_SUCCESS:
            return {
                ...state,
                userDetails: {
                    ...state.userDetails,
                    rolTemporal: action.payload.rolTemporal
                },
                loading: false
            };
        case ASSIGN_ROLE_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };
        case RESET_PASSWORD_REQUEST:
            return {
                ...state,
                loading: true
            };
        case RESET_PASSWORD_SUCCESS:
            return {
                ...state,
                loading: false
            };
        case RESET_PASSWORD_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };
        case UPDATE_USER_REQUEST:
            return {
                ...state,
                loading: true
            };
        case UPDATE_USER_SUCCESS:
            return {
                ...state,
                userDetails: {
                    ...state.userDetails,
                    ...action.payload
                },
                loading: false
            };
        case UPDATE_USER_ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case SET_USER_DETAILS:
            return {
                ...state,
                user: action.payload,  // Asegúrate de que el usuario se esté configurando aquí
                loading: false,
            };
        case FETCH_OR_CREATE_VENDEDOR_REQUEST:
            return {
                ...state,
                loading: true,
                vendedor: null,
                error: null
            };
        case FETCH_OR_CREATE_VENDEDOR_SUCCESS:
            return {
                ...state,
                vendedor: action.payload,
                loading: false,
                error: null,
            };
        case FETCH_OR_CREATE_VENDEDOR_ERROR:
            return {
                ...state,
                loading: false,
                vendedor: null,
                error: action.payload
            };
        case BUSCAR_VENDEDOR_REQUEST:
            return {
                ...state,
                loading: true,
                vendedor: null,
                error: null
            };
        case BUSCAR_VENDEDOR_SUCCESS:
            return {
                ...state,
                loading: false,
                vendedor: action.payload,
                error: null
            };
        case BUSCAR_VENDEDOR_FAIL:
            return {
                ...state,
                loading: false,
                vendedor: null,
                error: action.payload
            };
        case BUSCAR_USUARIO_DNI_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case BUSCAR_USUARIO_DNI_SUCCESS:
            return {
                ...state,
                usuario: action.payload,
                loading: false,
            };
        case BUSCAR_USUARIO_DNI_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case FETCH_TRANSACCIONES_REQUEST:
            return { ...state, loading: true };
        case FETCH_TRANSACCIONES_SUCCESS:
            return { ...state, loading: false, transacciones: action.payload };
        case FETCH_TRANSACCIONES_ERROR:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default usuariosReducer;
