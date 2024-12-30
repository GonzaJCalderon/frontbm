import api from '../axiosConfig';  
import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from './actionTypes';  

export const searchItems = (term, category) => async (dispatch) => {
    dispatch({ type: SEARCH_REQUEST });

    try {
        const lowerCaseTerm = term.toLowerCase();
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role'); // Asumimos que el rol del usuario también se guarda en localStorage
        console.log("Buscando término:", lowerCaseTerm);

        if (!userId || !role) {
            throw new Error("userId o role no encontrados en localStorage.");
        }

        const params = { query: lowerCaseTerm, userId, role };
        if (category && category !== 'todos') {
            params.category = category;
        }

        const response = await api.get('/search/buscar', { params });
        console.log("Respuesta completa de la API:", response);
console.log("Usuarios:", response.data.usuarios);
console.log("Bienes:", response.data.bienes);

        console.log("Respuesta de la API:", response);
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
