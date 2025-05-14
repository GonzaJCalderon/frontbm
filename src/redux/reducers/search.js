import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from '../actions/actionTypes';

const initialState = {
    usuarios: [],
    bienes: [],
    loading: false,
    error: null,
};

const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_REQUEST:
            return { ...state, loading: true, error: null };
        case SEARCH_SUCCESS:
            return {
                ...state,
                loading: false,
                usuarios: action.payload.usuarios || [], // Se asegura de que nunca sea `undefined`
                bienes: action.payload.bienes || [],
            };
        case SEARCH_ERROR:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default searchReducer;
