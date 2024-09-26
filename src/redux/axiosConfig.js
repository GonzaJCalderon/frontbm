// src/redux/actions/search.js
import api from '../axiosConfig'; // Asegúrate de importar tu instancia de Axios

export const searchItems = (term) => async (dispatch) => {
    try {
        const response = await api.get(`/search?nombre=${term}`); // Utiliza la instancia de Axios
        console.log('Search Results:', response.data); // Verifica los datos recibidos
        dispatch({
            type: 'SEARCH_ITEMS_SUCCESS',
            payload: response.data, // Asegúrate de que esto tenga la estructura correcta
        });
    } catch (error) {
        console.error('Search Error:', error); // Maneja errores
        dispatch({
            type: 'SEARCH_ITEMS_ERROR',
            payload: error.message,
        });
    }
};
