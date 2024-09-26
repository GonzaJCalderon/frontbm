// src/redux/actions/search.js
import api from '../axiosConfig'; // Asegúrate de que esta ruta sea correcta

export const searchItems = (term) => async (dispatch) => {
    try {
        const response = await api.get(`/search?nombre=${term}`); // Usa la instancia de Axios
        console.log('Search Results:', response.data);
        dispatch({
            type: 'SEARCH_ITEMS_SUCCESS',
            payload: response.data,
        });
    } catch (error) {
        console.error('Search Error:', error);
        dispatch({
            type: 'SEARCH_ITEMS_ERROR',
            payload: error.message,
        });
    }
};
