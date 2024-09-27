
import axios from 'axios';
import axios from '../axiosConfig';

export const searchItems = (term) => async (dispatch) => {
    try {
        const response = await axios.get(`/search?nombre=${term}`);
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
