import api from '../axiosConfig';  
import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from './actionTypes';  

export const searchItems = (term, category) => async (dispatch) => {
    dispatch({ type: SEARCH_REQUEST });

    try {
        const lowerCaseTerm = term.toLowerCase();
        console.log("Buscando término:", lowerCaseTerm);  // Verifica el término de búsqueda
        // Enviamos tanto el término como la categoría de búsqueda al backend
        const response = await api.get(`/search/buscar`, {
            params: {
                query: lowerCaseTerm,
                category: category, // Se incluye la categoría para filtrar la búsqueda
            }
        });

        console.log("Respuesta de la API:", response);  // Imprime la respuesta completa
        dispatch({
            type: SEARCH_SUCCESS,
            payload: {
                usuarios: response.data.usuarios || [],
                bienes: response.data.bienes || [],
            },
        });

    } catch (error) {
        console.error('Search Error:', error);
        dispatch({
            type: SEARCH_ERROR,
            payload: error.message || 'Error al realizar la búsqueda',
        });
    }
};

export default searchItems;
