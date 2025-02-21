
import api from '../axiosConfig';
import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from './actionTypes';  

export const searchItems = (term, category) => async (dispatch) => {
    dispatch({ type: SEARCH_REQUEST });

    try {
        const params = { [category]: term }; // Enviar solo el campo que se busca
        console.log("🔍 Enviando búsqueda con params:", params);

        const response = await api.get('/search', { params });
        console.log("✅ Respuesta de la API:", response.data);

        dispatch({
            type: SEARCH_SUCCESS,
            payload: {
                usuarios: response.data.usuarios.results || [],
                bienes: response.data.bienes.results || [],
            },
        });

    } catch (error) {
        console.error('❌ Error en la búsqueda:', error);
        dispatch({
            type: SEARCH_ERROR,
            payload: error.message || 'Error al realizar la búsqueda',
        });
    }
};



export default searchItems;
