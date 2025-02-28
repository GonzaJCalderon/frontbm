
import api from '../axiosConfig';
import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from './actionTypes';  

export const searchItems = (term, category) => async (dispatch) => {
    dispatch({ type: SEARCH_REQUEST });

    try {
        const params = { [category]: term }; // ✅ Asegura que solo envía un campo relevante
        console.log("🔍 Enviando búsqueda con params:", params); // 🔥 Verifica qué se envía al backend

        const response = await api.get('/search', { params });

        console.log("✅ Respuesta de la API:", response.data); // 🔥 Muestra qué devuelve el backend

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
