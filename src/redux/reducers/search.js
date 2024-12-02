import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from '../actions/actionTypes';  // Importa los tipos de acción

const initialState = {
    usuarios: [],
    bienes: [],
    loading: false,
    error: null,
};

const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_REQUEST:
            return { ...state, loading: true };
        case SEARCH_SUCCESS:
            console.log("Datos recibidos en el reducer:", action.payload);  // Para verificar la estructura
            return {
                ...state,
                loading: false,
                usuarios: action.payload.usuarios || [],  // Asegúrate de que 'usuarios' existe en la respuesta
                bienes: action.payload.bienes || [],      // Asegúrate de que 'bienes' existe en la respuesta
            };
        case SEARCH_ERROR:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default searchReducer;
