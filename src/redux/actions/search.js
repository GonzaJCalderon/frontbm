import api from '../axiosConfig';
import { SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_ERROR } from './actionTypes';

// 🔍 Búsqueda inteligente: usuarios, bienes o ambos
export const searchItems = (query, category = 'all') => async (dispatch) => {
  // Para usuarios, 'query' puede ser un objeto con filtros
  const isUserSearch = category === 'users';
  const isGlobalSearch = !isUserSearch;

  // Validación mínima para global
  if (isGlobalSearch && (!query || query.trim().length < 2)) return;

  dispatch({ type: SEARCH_REQUEST });

  try {
    const endpoint = isUserSearch ? '/search/users' : '/search/all';

    const { data } = await api.get(endpoint, {
      params: isUserSearch ? query : { term: query, category }
    });

    dispatch({
      type: SEARCH_SUCCESS,
      payload: {
        usuarios: data.usuarios?.rows || [],
        bienes: data.bienes?.rows || [],
      },
    });
  } catch (error) {
    dispatch({
      type: SEARCH_ERROR,
      payload: error.message || 'Error desconocido',
    });
  }
};

export default searchItems;
