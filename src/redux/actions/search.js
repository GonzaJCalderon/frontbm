// src/redux/actions/search.js
import axios from 'axios';

export const searchItems = (term) => async (dispatch) => {
    try {
        const response = await axios.get(`http://localhost:5000/search?nombre=${term}`);
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

