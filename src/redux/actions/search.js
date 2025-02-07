import api from '../axiosConfig';  
import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from './actionTypes';  

export const searchItems = (term, category) => async (dispatch) => {
    dispatch({ type: SEARCH_REQUEST });

    try {
        const lowerCaseTerm = term.toLowerCase();
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const uuid = userData.uuid || null;
        const role = userData.role || null;
        
        if (!uuid || !role) { // ✅ CORREGIDO: Ahora validamos uuid correctamente
            console.warn("Advertencia: uuid o role no encontrados en localStorage.");
            return dispatch({
                type: SEARCH_ERROR,
                payload: "No se encontraron credenciales de usuario.",
            });
        }

        const params = { query: lowerCaseTerm, uuid, role }; // ✅ CORREGIDO: Ahora se usa uuid correctamente
        if (category && category !== 'todos') {
            params.category = category;
        }

        const response = await api.get('/search/buscar', { params });
        console.log("Respuesta completa de la API:", response);
        console.log("Usuarios:", response.data.usuarios);
        console.log("Bienes:", response.data.bienes);

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
