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
    FETCH_TRANSACCIONES_ERROR,
    FETCH_PENDING_REGISTRATIONS_REQUEST,
    FETCH_PENDING_REGISTRATIONS_SUCCESS,
    FETCH_PENDING_REGISTRATIONS_ERROR,
    APPROVE_REGISTRATION_REQUEST,
    APPROVE_REGISTRATION_SUCCESS,
    APPROVE_REGISTRATION_ERROR,
    DENY_REGISTRATION_REQUEST,
    DENY_REGISTRATION_SUCCESS,
    DENY_REGISTRATION_ERROR,
     FETCH_APPROVED_USERS_REQUEST,
    FETCH_APPROVED_USERS_SUCCESS,
    FETCH_APPROVED_USERS_FAILURE,
    FETCH_REJECTED_USERS_REQUEST,
    FETCH_REJECTED_USERS_SUCCESS,
    FETCH_REJECTED_USERS_ERROR,
    APPROVE_USER_SUCCESS,
    CHECK_USER_REQUEST,
    CHECK_USER_SUCCESS,
    CHECK_USER_ERROR,
    REGISTER_USER_THIRD_PARTY_REQUEST,
    REGISTER_USER_THIRD_PARTY_SUCCESS,
    REGISTER_USER_THIRD_PARTY_ERROR,
    FETCH_HISTORIAL_CAMBIOS_REQUEST,
    FETCH_HISTORIAL_CAMBIOS_SUCCESS,
    FETCH_HISTORIAL_CAMBIOS_ERROR,    
} from '../actions/actionTypes';

const initialState = {
    isAuthenticated: false,
    usuarios: [],
    rejectedUsers: [],
    approvedUsers: [], // Agrega esta línea
    user: null,
    userDetails: {},
    items: [],
    currentPage: 1,
    role: '',
    vendedor: null,
    loading: false,
    error: null,
    pendingRegistrations: [],
    comprasVentas: {
        bienesComprados: [],
        bienesVendidos: [],
    },
    transacciones: [], 
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
                    role: action.payload.usuario.rolDefinitivo, // Guarda el rol en el estado global
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
                console.log('Payload de ASSIGN_ROLE_SUCCESS:', action.payload);
                return {
                  ...state,
                  userDetails: {
                    ...state.userDetails,
                    rolDefinitivo: action.payload.usuario.rolDefinitivo,
                  },
                  loading: false,
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
                return {
                    ...state,
                    loading: true,
                };
            case FETCH_TRANSACCIONES_SUCCESS:
                return {
                    ...state,
                    loading: false,
                    transacciones: action.payload, // Asegúrate de que esto sea un array
                };
            case FETCH_TRANSACCIONES_ERROR:
                return {
                    ...state,
                    loading: false,
                    error: action.payload,
                };

              // Manejo de solicitudes de registro pendientes
        case FETCH_PENDING_REGISTRATIONS_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case FETCH_PENDING_REGISTRATIONS_SUCCESS:
            return {
                ...state,
                pendingRegistrations: action.payload,
                loading: false,
            };
        case FETCH_PENDING_REGISTRATIONS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error,
            };

        // Aprobar registro
        case APPROVE_REGISTRATION_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case APPROVE_REGISTRATION_SUCCESS:
            return {
                ...state,
                pendingRegistrations: state.pendingRegistrations.filter(user => user.id !== action.payload),
                loading: false,
            };
        case APPROVE_REGISTRATION_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error,
            };

        // Negar registro
        case DENY_REGISTRATION_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case DENY_REGISTRATION_SUCCESS:
            return {
                ...state,
                pendingRegistrations: state.pendingRegistrations.filter(user => user.id !== action.payload.id),
                loading: false,
            };


        case DENY_REGISTRATION_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error,
            };
            case FETCH_APPROVED_USERS_REQUEST:
                return { ...state, loading: true, error: null };
                case FETCH_APPROVED_USERS_SUCCESS:
                    return {
                        ...state,
                        loading: false,
                        approvedUsers: action.payload, // Asigna los usuarios aprobados al array correcto
                    };
                
            case FETCH_APPROVED_USERS_FAILURE:
                return { ...state, loading: false, error: action.payload };

                case FETCH_REJECTED_USERS_REQUEST:
                    return {
                        ...state,
                        loading: true,
                    };
                case FETCH_REJECTED_USERS_SUCCESS:
                    return {
                        ...state,
                        loading: false,
                        rejectedUsers: action.payload,
                    };
                case FETCH_REJECTED_USERS_ERROR:
                    return {
                        ...state,
                        loading: false,
                        error: action.error,
                    };
                    case APPROVE_USER_SUCCESS:
                        return {
                            ...state,
                            approvedUsers: [...state.approvedUsers, action.payload], // Agrega el nuevo usuario aprobado
                            pendingRegistrations: state.pendingRegistrations.filter(user => user.uuid !== action.payload.uuid),
                        };
                    
    case CHECK_USER_REQUEST:
            return { ...state, loading: true, error: null };
        case CHECK_USER_SUCCESS:
            return { ...state, loading: false, usuario: action.payload };
        case CHECK_USER_ERROR:
            return { ...state, loading: false, error: action.error };

            case REGISTER_USER_THIRD_PARTY_REQUEST:
                return {
                  ...state,
                  loading: true,
                  error: null,
                };
              case REGISTER_USER_THIRD_PARTY_SUCCESS:
                return {
                  ...state,
                  loading: false,
                  usuario: action.payload,
                };
              case REGISTER_USER_THIRD_PARTY_ERROR:
                return {
                  ...state,
                  loading: false,
                  error: action.error,
                };

                // Fetch historial de cambios
case FETCH_HISTORIAL_CAMBIOS_REQUEST:
    return {
        ...state,
        loading: true,
    };
case FETCH_HISTORIAL_CAMBIOS_SUCCESS:
    return {
        ...state,
        historialCambios: action.payload,
        loading: false,
    };
case FETCH_HISTORIAL_CAMBIOS_ERROR:
    return {
        ...state,
        loading: false,
        error: action.error,
    };

        default:
            return state;
    };
    

    
};

export default usuariosReducer;
