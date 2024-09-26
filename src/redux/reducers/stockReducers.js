// reducers/stockReducer.js

import {
    FETCH_USUARIO_COMPRAS_VENTAS_REQUEST,
    FETCH_USUARIO_COMPRAS_VENTAS_SUCCESS,
    FETCH_USUARIO_COMPRAS_VENTAS_ERROR,
    UPDATE_STOCK_REQUEST,
    UPDATE_STOCK_SUCCESS,
    UPDATE_STOCK_FAILURE
} from '../actions/actionTypes';

const initialState = {
    loading: false,
    data: [],
    error: null,
};

const stockReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_USUARIO_COMPRAS_VENTAS_REQUEST:
            return {
                ...state,
                loading: true,
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
        case UPDATE_STOCK_REQUEST:
            return { ...state, loading: true };
        case UPDATE_STOCK_SUCCESS:
            return {
                ...state,
                loading: false,
                items: state.items.map(bien =>
                    bien.id === action.payload.id ? { ...bien, stock: action.payload.stock } : bien
                ),
            };
        case UPDATE_STOCK_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default stockReducer;
